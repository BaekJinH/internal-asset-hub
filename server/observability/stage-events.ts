/**
 * STAGE EVENTS — the observability stream (StageEvent) + emitter + the actual-vs-reported guard.
 *
 * StageEvent is a SERVER DTO (NOT added to the frozen host contract `devpilot-types.ts` — the MVP serves it on
 *   :8787, the host SPA never consumes it). It reuses already-shipped shapes so no parallel vocabulary is born:
 *   meta{model,timestamp,jobId} = FTRecord.meta; error{pageId,gate,reason} = PageError; detail carries the
 *   stage's own report (GateReport.dsConformance | QualityReport | RepairReport | A11yReport) verbatim.
 *
 * PORT (§3, from devpilot-v2 run-context.ts): onPhaseComplete's (result, state) discipline → StageEmitter.emit,
 *   and verifyActualVsIntended → verifyRunObservability. EXCLUDED: the null-result start tick and its
 *   `null as unknown as PhaseResult` TYPE LIE (here the emitter type is honest); the React/IPC notifySubscribers
 *   edge (server-internal store instead); live per-stage durations (deterministic stages are instant — real
 *   durations are the (A)/Ollama pairing, increment-③).
 *
 * ★ FALSE-OBSERVABILITY GUARD (CTO): a stage that reports 'ok' must actually have produced/touched what it
 *   CLAIMS — mirroring verifyActualVsIntended's "actual never recorded ⇒ fail" (R-6 vaccine). artifacts/
 *   outputSummary MUST be DERIVED from the real stage output, never a hardcoded label.
 */
import type { StageId } from './worker-registry'
import { STAGE_BINDINGS, resolveWorker, type ModelId, type ResolvedWorker, type StageModelOverrides } from './worker-registry'

export type StageStatus = 'ok' | 'skipped' | 'failed'

export interface StageEvent {
  runId: string
  stageId: StageId
  status: StageStatus
  /** deterministic ordering within a run (NOT wall-clock). */
  seq: number
  /** the worker that ACTUALLY ran (ResolvedWorker.actual). */
  model: ModelId
  /** set only when an override was requested but degraded to the default (a valid-but-unreachable worker). */
  requested?: ModelId
  /** run-level ISO timestamp (injected — provenance; per-stage wall-clock duration is the (A) pairing). */
  timestamp: string
  /** human summary DERIVED from the real output (e.g. "2 files · gate PASS · 0 violations"). */
  outputSummary: string
  /** file paths this stage ACTUALLY produced/touched — the anchor the false-observability guard checks. */
  artifacts: string[]
  /** the stage's own report verbatim (GateReport.dsConformance | QualityReport | RepairReport | A11yReport). */
  detail?: unknown
  /** PageError shape, on status 'failed'. */
  error?: { pageId: string; gate: string; reason: string }
  /** which page this per-page stage event belongs to (absent for run-level / once-per-build stages). */
  pageId?: string
}

export interface EmitOpts {
  outputSummary?: string
  artifacts?: string[]
  detail?: unknown
  error?: { pageId: string; gate: string; reason: string }
  pageId?: string
}

/**
 * Per-run collector. Deterministic: `seq` orders events, `timestamp` is injected once (so a self-check run is
 * byte-reproducible). Holds the run's stageModelOverrides and resolves the ACTUAL worker per emit — so the
 * recorded `model` is always what ran, never merely what was requested.
 */
export class StageEmitter {
  private readonly events: StageEvent[] = []
  private seq = 0

  constructor(
    private readonly runId: string,
    private readonly timestamp: string,
    private readonly overrides: StageModelOverrides = {},
    private readonly env: NodeJS.ProcessEnv = process.env,
  ) {}

  /** Resolve without emitting (fail-closed on an unregistered override). */
  resolve(stageId: StageId): ResolvedWorker {
    return resolveWorker(stageId, this.overrides[stageId], this.env)
  }

  /** Record a terminal stage event; returns the resolved worker so the caller can stamp meta.model = actual. */
  emit(stageId: StageId, status: StageStatus, opts: EmitOpts = {}): ResolvedWorker {
    const w = this.resolve(stageId)
    this.events.push({
      runId: this.runId,
      stageId,
      status,
      seq: this.seq++,
      model: w.actual,
      ...(w.fellBack ? { requested: w.requested } : {}),
      timestamp: this.timestamp,
      outputSummary: opts.outputSummary ?? '',
      artifacts: opts.artifacts ?? [],
      ...(opts.detail !== undefined ? { detail: opts.detail } : {}),
      ...(opts.error ? { error: opts.error } : {}),
      ...(opts.pageId ? { pageId: opts.pageId } : {}),
    })
    return w
  }

  collected(): StageEvent[] {
    return this.events
  }
}

/**
 * FALSE-OBSERVABILITY GUARD (port of verifyActualVsIntended). Given a run's events and the set of file paths the
 * run ACTUALLY produced, catch the two ways a report can lie:
 *   (1) a producing stage reported 'ok' but recorded NO artifact  — the "reported done without recording what it
 *       produced" case (devpilot's actual-never-recorded ⇒ fail);
 *   (2) a stage's claimed artifact is absent from the actual output — reported ≠ actual.
 * Returns pass=false + specific mismatches so a self-check tooth (and, later, a run-time invariant) can bite.
 */
export function verifyRunObservability(
  events: StageEvent[],
  actualPaths: Set<string>,
): { pass: boolean; mismatches: string[] } {
  const mismatches: string[] = []
  for (const e of events) {
    const where = `${e.stageId}${e.pageId ? `[${e.pageId}]` : ''}`
    if (e.status === 'ok' && STAGE_BINDINGS[e.stageId]?.produces && e.artifacts.length === 0)
      mismatches.push(`${where}: reported ok but recorded no artifact (false observability — produced nothing?)`)
    if (e.status === 'ok')
      for (const a of e.artifacts)
        if (!actualPaths.has(a)) mismatches.push(`${where}: reported artifact "${a}" absent from actual run output`)
  }
  return { pass: mismatches.length === 0, mismatches }
}

/** Collect the actual output paths of a run from its page artifacts (each self-contained page bundle). */
export function actualPathsOf(pageFileSets: { files: { path: string }[] }[]): Set<string> {
  const s = new Set<string>()
  for (const p of pageFileSets) for (const f of p.files) s.add(f.path)
  return s
}
