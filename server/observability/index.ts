/**
 * OBSERVABILITY & CONTROL layer (increment-①, deterministic engine skeleton).
 *
 * · worker-registry — §11 single SoT: worker catalog + stage→worker bindings + zod fail-closed override guard.
 * · stage-events    — StageEvent DTO + StageEmitter + the actual-vs-reported false-observability guard.
 *
 * Served on :8787 (engine URL) via transport: GET /pipeline/structure · GET /models · GET /runs/:id/events,
 * plus POST /generate stageModelOverrides. The host SPA (src/, frozen) is untouched — the dashboard (increment-②)
 * consumes these engine endpoints directly. Live streaming + real worker calls are the (A) pairing (increment-③).
 */
export {
  WORKERS,
  STAGE_BINDINGS,
  DETERMINISTIC,
  INTEGRATED_WORKERS,
  isWorkerAvailable,
  isWorkerIntegrated,
  isWorkerRunnable,
  resolveWorker,
  pipelineStructure,
  listWorkers,
  stageModelOverridesSchema,
  type Tier,
  type StageKind,
  type WorkerRole,
  type Worker,
  type ModelId,
  type StageBinding,
  type StageId,
  type ResolvedWorker,
  type StageModelOverrides,
  type StageStructure,
  type WorkerListing,
} from './worker-registry'

export {
  StageEmitter,
  verifyRunObservability,
  actualPathsOf,
  type StageStatus,
  type StageEvent,
  type EmitOpts,
} from './stage-events'

export { renderDashboard, workerBadgeHtml, workerOptionLabel, type DashboardData } from './dashboard'
