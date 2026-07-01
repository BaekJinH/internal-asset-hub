/**
 * JOBS — orchestration, manifest/job stores, (future) checkpoint/resume.
 *
 * CANONICAL SOURCE (PHASE-MAP): ADAPT devpilot-v2 auto-runner (phase-chain/cost-guard/retry/batch) +
 *   GREEN-FIELD resume-from-checkpoint executor (devpilot persists state but has no resume).
 *
 * MVP = in-memory stores + synchronous deterministic generation (static emit is fast, no LLM). The shapes
 *   are the shipped `JobStatus` / `PageArtifact`. Durable checkpoint/resume + 50-page async fan-out are a
 *   later increment (sequenced after codegen enrichment). The manifestStore is the analyze→generate seam:
 *   analyze() (or a seed) puts a BuildManifest; generate looks it up by manifestId.
 */
import type { AnalyzeRequest, BuildManifest, JobStatus, PageArtifact } from '../contract'
import { generatePages } from '../generate'

interface StoredManifest {
  manifest: BuildManifest
  request?: AnalyzeRequest
}
interface StoredJob {
  status: JobStatus
  pages: Map<string, PageArtifact>
}

const manifests = new Map<string, StoredManifest>()
const jobs = new Map<string, StoredJob>()
let seq = 0

/** analyze→generate seam: store a manifest so a later generate(manifestId) can find it. Returns manifestId. */
export function putManifest(manifest: BuildManifest, request?: AnalyzeRequest): string {
  manifests.set(manifest.manifestId, { manifest, request })
  return manifest.manifestId
}

export function getManifest(manifestId: string): BuildManifest | undefined {
  return manifests.get(manifestId)?.manifest
}

/** Create + run a job for a stored manifest. Returns null if the manifest is unknown (→ 404 at the seam). */
export async function createJob(manifestId: string, pageIds?: string[]): Promise<{ jobId: string } | null> {
  const stored = manifests.get(manifestId)
  if (!stored) return null

  const jobId = `job_${manifestId}_${++seq}`
  const { artifacts, failed } = await generatePages(stored.manifest, {
    request: stored.request,
    pageIds,
    jobId,
  })

  const total = (pageIds ?? stored.manifest.sitemap.map((p) => p.pageId)).length
  const status: JobStatus = {
    jobId,
    phase: artifacts.length === 0 && failed.length > 0 ? 'failed' : 'done',
    total,
    completed: artifacts.length,
    failed,
    checkpointId: `${jobId}-cp-1`,
  }
  jobs.set(jobId, { status, pages: new Map(artifacts.map((a) => [a.pageId, a])) })
  return { jobId }
}

export function getJob(jobId: string): JobStatus | null {
  return jobs.get(jobId)?.status ?? null
}

export function getPage(jobId: string, pageId: string): PageArtifact | null {
  return jobs.get(jobId)?.pages.get(pageId) ?? null
}
