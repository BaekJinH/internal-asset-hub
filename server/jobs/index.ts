/**
 * JOBS — orchestration, checkpointing, resume.
 *
 * CANONICAL SOURCE (PHASE-MAP):
 *   - ADAPT (devpilot-v2): auto-runner orchestration — phase-chain, cost-guard, retry-strategy,
 *     batch-runner, variant-runner, per-page-retry-queue.
 *   - GREEN-FIELD: a resume-from-checkpoint executor (devpilot-v2 persists run state but has NO
 *     resume executor). AC: 50-page job → interrupt after checkpoint → resume skips completed pages.
 *
 * Emits the shipped `JobStatus` (jobId / phase / total / completed / failed / checkpointId).
 *
 * TODO(STEP 3): implement createJob / getJob / checkpoint / resume. Sequence AFTER codegen works
 *   (Rev 1.4 Δ6): FT corpus writer comes after per-page generation is verified.
 */
import type { JobStatus } from '../contract'

export async function getJob(_jobId: string): Promise<JobStatus> {
  throw new Error('SCAFFOLD: job orchestration not yet implemented (STEP 3).')
}
