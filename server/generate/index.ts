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
import { dynamicFinalRepair } from '../emitters/dynamic-final-repair'
import { runGate } from '../conformance'
import { runQualityAudit } from '../conformance/quality-audit'

export interface GenerateOptions {
  request?: AnalyzeRequest
  pageIds?: string[]
  jobId?: string
  model?: string
}

export interface GenerateResult {
  artifacts: PageArtifact[]
  failed: PageError[]
}

/** Deterministic BuildManifest → PageArtifact[] (static target). No LLM; Ollama enrichment is additive-deferred. */
export async function generatePages(manifest: BuildManifest, opts: GenerateOptions = {}): Promise<GenerateResult> {
  const emitter = getEmitter('static')
  const shared = [...(await emitter.emitShared(manifest))]
  const targets = manifest.sitemap.filter((p) => !opts.pageIds || opts.pageIds.includes(p.pageId))

  const artifacts: PageArtifact[] = []
  const failed: PageError[] = []

  for (const page of targets) {
    try {
      const pageFiles = [...(await emitter.emitPage(manifest, page))]
      // repair over [shared + this page] — internal links resolve against the full manifest route map
      const { files } = dynamicFinalRepair([...shared, ...pageFiles], manifest)
      const gates = await runGate(files)
      const audit = runQualityAudit(files, manifest)

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
