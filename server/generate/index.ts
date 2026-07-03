/**
 * PHASE-2 — 생성 / CODEGEN orchestration.
 *
 * CANONICAL SOURCE (PHASE-MAP): n8n v31 stages S11→S19 translated to TS (styles/partials/per-screen HTML/
 *   app.js/quality-check/Dynamic Final Repair). devpilot-v2 phase_4 verify gates absorbed here.
 *
 * INPUT = BuildManifest (from analyze). The DETERMINISTIC floor runs NOW with NO LLM: the static emitter
 *   already produces host-conformant pages (proven by slice.ts). Local Ollama (`qwen3-coder:30b`, company
 *   server) is an ADDITIVE enrichment of page bodies through this same emitter — deferred until reachable.
 *
 * `generatePages` = per-page emit → Dynamic Final Repair → conformance gate → quality audit → PageArtifact.
 *   Job orchestration / checkpointing lives in ../jobs; the HTTP seam in ../transport calls through both.
 */
import type { AnalyzeRequest, BuildManifest, PageArtifact, PageError } from '../contract'
import { getEmitter } from '../emitters'
import { routeToFile } from '../emitters/static-emitter'
import { dynamicFinalRepair } from '../emitters/dynamic-final-repair'
import { runGate } from '../conformance'
import { runQualityAudit } from '../conformance/quality-audit'
import { buildSiteCushions, notFoundSpec, defaultStructuralSeeds, type StructuralSeeds } from '../post-process'
import { fixAccessibility } from '../post-process/a11y-fixer'
import { seoInputForPage, injectSeoIntoHtml } from '../post-process/seo-injector'
import { DETERMINISTIC, type StageEmitter } from '../observability'

export interface GenerateOptions {
  request?: AnalyzeRequest
  pageIds?: string[]
  jobId?: string
  model?: string
  /** ((B)⑤) structural-cushion seeds (baseUrl, locale, a11y labels, …). Defaults keep the pipeline working. */
  seeds?: StructuralSeeds
  /** ((OBS)①) run-scoped StageEmitter — when present, every stage emits a StageEvent (artifacts DERIVED from real
   *  output, never a hardcoded label). Optional: generatePages runs identically without it (backward-compatible). */
  emitter?: StageEmitter
}

export interface GenerateResult {
  artifacts: PageArtifact[]
  failed: PageError[]
  /** ((OBS)①) every file path the run ACTUALLY produced (shared + site + all page bundles), deduped — the
   *  independent actual-truth against which verifyRunObservability checks the StageEvents' claimed artifacts. */
  producedPaths: string[]
}

/** Deterministic BuildManifest → PageArtifact[] (static target). No LLM; Ollama enrichment is additive-deferred.
 *  ((OBS)①) when opts.emitter is present, each stage emits a StageEvent whose artifacts/outputSummary are DERIVED
 *  from the real stage output — the emitter never fabricates a claim (false-observability discipline). */
export async function generatePages(manifest: BuildManifest, opts: GenerateOptions = {}): Promise<GenerateResult> {
  const staticEmitter = getEmitter('static')
  const obs = opts.emitter
  const seeds = opts.seeds ?? defaultStructuralSeeds

  const renderShared = [...(await staticEmitter.emitShared(manifest))] // styles.css + app.js (per-page render deps)
  obs?.emit('generate.emitShared', 'ok', {
    artifacts: renderShared.map((f) => f.path),
    outputSummary: `${renderShared.length} shared assets: ${renderShared.map((f) => f.path).join(', ')}`,
  })

  // ((B)⑤) SITE-LEVEL structural cushions built ONCE: sitemap.xml + robots.txt + a token-only 404.html. They
  // ship in each self-contained page bundle + are gated, but are EXCLUDED from the per-page QUALITY audit — a
  // 404/sitemap/robots is not page content, so its intentional thinness must not drag the page's quality score.
  // COLLISION GUARD: if the manifest already routes a real page to 404.html, the authored page wins — the
  // synthetic 404 is skipped (no duplicate/ambiguous bundle file) and 404.html is NOT audit-excluded (it is real).
  const notFoundFile = routeToFile(notFoundSpec(seeds).route)
  const hasReal404 = manifest.sitemap.some((p) => routeToFile(p.route) === notFoundFile)
  const cushionFiles = buildSiteCushions(manifest, seeds)
  obs?.emit('generate.cushion.sitemap', 'ok', {
    artifacts: cushionFiles.map((f) => f.path),
    outputSummary: cushionFiles.map((f) => f.path).join(', '),
  })
  const notFoundFiles = hasReal404 ? [] : [...(await staticEmitter.emitPage(manifest, notFoundSpec(seeds)))]
  obs?.emit('generate.cushion.notfound', hasReal404 ? 'skipped' : 'ok', {
    artifacts: notFoundFiles.map((f) => f.path),
    outputSummary: hasReal404 ? 'real /404 present — synthetic 404 skipped' : notFoundFiles.map((f) => f.path).join(', '),
  })
  const siteFiles = [...cushionFiles, ...notFoundFiles]
  const siteMetaPaths = new Set(siteFiles.map((f) => f.path)) // identity = files WE synthesize, not any '404.html'
  const targets = manifest.sitemap.filter((p) => !opts.pageIds || opts.pageIds.includes(p.pageId))

  const artifacts: PageArtifact[] = []
  const failed: PageError[] = []

  for (const page of targets) {
    const pagePath = routeToFile(page.route)
    try {
      const pageFiles = [...(await staticEmitter.emitPage(manifest, page))]
      // resolve + record the worker that actually produced this page body (deterministic floor; Ollama = (A)).
      const emitResolved = obs?.emit('generate.emitPage', 'ok', {
        pageId: page.pageId,
        artifacts: pageFiles.map((f) => f.path),
        outputSummary: `${pageFiles.length} file(s): ${pageFiles.map((f) => f.path).join(', ')}`,
      })
      const workerModel = emitResolved?.actual ?? opts.model ?? DETERMINISTIC

      // ((B)⑤) a11y BEFORE repair (img-alt must precede dynamicFinalRepair's local-image stripping).
      const a11yResult = fixAccessibility(pageFiles, seeds.a11y)
      const a11yed = a11yResult.files
      obs?.emit('generate.a11y', 'ok', {
        pageId: page.pageId,
        artifacts: a11yed.map((f) => f.path),
        detail: a11yResult.report,
        outputSummary: `img=${a11yResult.report.imgAltFixed} button=${a11yResult.report.buttonNamed} input=${a11yResult.report.inputNamed} lang=${a11yResult.report.langFixed} headingWarn=${a11yResult.report.headingWarnings.length}`,
      })

      // repair over [render deps + site files + this page] — the self-contained, gate-verified deployable unit
      const repairResult = dynamicFinalRepair([...renderShared, ...siteFiles, ...a11yed], manifest)
      const repaired = repairResult.files
      obs?.emit('generate.repair', 'ok', {
        pageId: page.pageId,
        artifacts: repaired.map((f) => f.path),
        detail: repairResult.report,
        outputSummary: `unresolvedRoutes=${repairResult.report.unresolvedRoutes} imagesReplaced=${repairResult.report.imagesReplaced} bridgedClasses=${repairResult.report.bridgedClasses}`,
      })

      // SEO AFTER repair, on THIS page's own file only — so repair's internal-link normalization never sees the
      // canonical/og <link> (a non-scheme baseUrl would otherwise be rewritten to href="#"), and no OTHER page's
      // file gets this page's canonical.
      const seoInput = seoInputForPage(manifest, page, seeds)
      const files = repaired.map((f) =>
        f.path === pagePath ? { path: f.path, content: injectSeoIntoHtml(f.content, seoInput) } : f,
      )
      obs?.emit('generate.seo', 'ok', {
        pageId: page.pageId,
        artifacts: [pagePath],
        outputSummary: `canonical + meta/OG/JSON-LD injected into ${pagePath}`,
      })

      const gates = await runGate(files)
      obs?.emit('generate.gate', gates.dsConformance.pass ? 'ok' : 'failed', {
        pageId: page.pageId,
        artifacts: files.map((f) => f.path),
        detail: gates.dsConformance,
        outputSummary: `dsConformance ${gates.dsConformance.pass ? 'PASS' : 'FAIL'} (color=${gates.dsConformance.colorLiteralViolations.length} token=${gates.dsConformance.tokenViolations.length} naming=${gates.dsConformance.namingViolations.length})`,
      })

      const audit = runQualityAudit(files.filter((f) => !siteMetaPaths.has(f.path)), manifest)
      obs?.emit('generate.audit', 'ok', {
        pageId: page.pageId,
        artifacts: [pagePath],
        detail: audit,
        outputSummary: `qualityScore=${audit.qualityScore} issues=${audit.issues.length} warnings=${audit.warnings.length}`,
      })

      artifacts.push({
        pageId: page.pageId,
        files, // self-contained deployable unit: shared assets + this page's HTML (repaired)
        gates,
        ftRecord: {
          input: {
            spec: opts.request?.spec ?? '(deterministic static emit)',
            designRefMode: opts.request?.designRefMode ?? 'none',
            conformanceProfile: opts.request?.conformanceProfile ?? 'default',
          },
          output: { files },
          quality: {
            gateScore: audit.qualityScore / 100,
            gold: gates.dsConformance.pass && audit.qualityScore >= 90,
          },
          meta: {
            model: workerModel, // ((OBS)①) the resolved worker that ran this stage (was a hardcoded sentinel)
            timestamp: new Date().toISOString(),
            jobId: opts.jobId ?? '',
          },
        },
      })
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err)
      obs?.emit('generate.emitPage', 'failed', {
        pageId: page.pageId,
        error: { pageId: page.pageId, gate: 'emit', reason },
        outputSummary: `FAILED: ${reason}`,
      })
      failed.push({ pageId: page.pageId, gate: 'emit', reason })
    }
  }

  const producedPaths = [
    ...new Set([...renderShared, ...siteFiles, ...artifacts.flatMap((a) => a.files)].map((f) => f.path)),
  ]
  return { artifacts, failed, producedPaths }
}
