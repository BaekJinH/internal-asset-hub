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

export interface GenerateOptions {
  request?: AnalyzeRequest
  pageIds?: string[]
  jobId?: string
  model?: string
  /** ((B)⑤) structural-cushion seeds (baseUrl, locale, a11y labels, …). Defaults keep the pipeline working. */
  seeds?: StructuralSeeds
}

export interface GenerateResult {
  artifacts: PageArtifact[]
  failed: PageError[]
}

/** Deterministic BuildManifest → PageArtifact[] (static target). No LLM; Ollama enrichment is additive-deferred. */
export async function generatePages(manifest: BuildManifest, opts: GenerateOptions = {}): Promise<GenerateResult> {
  const emitter = getEmitter('static')
  const seeds = opts.seeds ?? defaultStructuralSeeds
  const renderShared = [...(await emitter.emitShared(manifest))] // styles.css + app.js (per-page render deps)
  // ((B)⑤) SITE-LEVEL structural cushions built ONCE: sitemap.xml + robots.txt + a token-only 404.html. They
  // ship in each self-contained page bundle + are gated, but are EXCLUDED from the per-page QUALITY audit — a
  // 404/sitemap/robots is not page content, so its intentional thinness must not drag the page's quality score.
  // COLLISION GUARD: if the manifest already routes a real page to 404.html, the authored page wins — the
  // synthetic 404 is skipped (no duplicate/ambiguous bundle file) and 404.html is NOT audit-excluded (it is real).
  const notFoundFile = routeToFile(notFoundSpec(seeds).route)
  const hasReal404 = manifest.sitemap.some((p) => routeToFile(p.route) === notFoundFile)
  const siteFiles = [
    ...buildSiteCushions(manifest, seeds),
    ...(hasReal404 ? [] : await emitter.emitPage(manifest, notFoundSpec(seeds))),
  ]
  const siteMetaPaths = new Set(siteFiles.map((f) => f.path)) // identity = files WE synthesize, not any '404.html'
  const targets = manifest.sitemap.filter((p) => !opts.pageIds || opts.pageIds.includes(p.pageId))

  const artifacts: PageArtifact[] = []
  const failed: PageError[] = []

  for (const page of targets) {
    try {
      const pageFiles = [...(await emitter.emitPage(manifest, page))]
      // ((B)⑤) a11y BEFORE repair (img-alt must precede dynamicFinalRepair's local-image stripping).
      const { files: a11yed } = fixAccessibility(pageFiles, seeds.a11y)
      // repair over [render deps + site files + this page] — the self-contained, gate-verified deployable unit
      const { files: repaired } = dynamicFinalRepair([...renderShared, ...siteFiles, ...a11yed], manifest)
      // SEO AFTER repair, on THIS page's own file only — so repair's internal-link normalization never sees the
      // canonical/og <link> (a non-scheme baseUrl would otherwise be rewritten to href="#"), and no OTHER page's
      // file gets this page's canonical.
      const pagePath = routeToFile(page.route)
      const seoInput = seoInputForPage(manifest, page, seeds)
      const files = repaired.map((f) =>
        f.path === pagePath ? { path: f.path, content: injectSeoIntoHtml(f.content, seoInput) } : f,
      )
      const gates = await runGate(files)
      const audit = runQualityAudit(files.filter((f) => !siteMetaPaths.has(f.path)), manifest)

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
            model: opts.model ?? 'static-emitter@deterministic',
            timestamp: new Date().toISOString(),
            jobId: opts.jobId ?? '',
          },
        },
      })
    } catch (err) {
      failed.push({ pageId: page.pageId, gate: 'emit', reason: err instanceof Error ? err.message : String(err) })
    }
  }

  return { artifacts, failed }
}
