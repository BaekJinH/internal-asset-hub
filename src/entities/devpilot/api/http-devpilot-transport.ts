import type { DevPilotTransport } from '@/entities/devpilot/api/devpilot-transport'
import type {
  AnalyzeRequest,
  BuildManifest,
  JobStatus,
  PageArtifact,
} from '@/entities/devpilot/model/devpilot-types'

const BASE_URL: string = import.meta.env.VITE_DEVPILOT_API_BASE_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!response.ok) {
    throw new Error(`DevPilot API ${response.status}: ${path}`)
  }
  return (await response.json()) as T
}

/**
 * 엔진 GA 시 default로 승격될 실 transport. Pass 1에선 컴파일만(주입하지 않음).
 * CORS/인증은 엔진 서버측. base_url = `VITE_DEVPILOT_API_BASE_URL`.
 */
export class HttpDevPilotTransport implements DevPilotTransport {
  analyze(req: AnalyzeRequest): Promise<BuildManifest> {
    return request<BuildManifest>('/analyze', { method: 'POST', body: JSON.stringify(req) })
  }

  generate(manifestId: string, pageIds?: string[]): Promise<{ jobId: string }> {
    return request<{ jobId: string }>('/generate', {
      method: 'POST',
      body: JSON.stringify({ manifestId, pageIds }),
    })
  }

  getJob(jobId: string): Promise<JobStatus> {
    return request<JobStatus>(`/jobs/${jobId}`)
  }

  getPage(jobId: string, pageId: string): Promise<PageArtifact> {
    return request<PageArtifact>(`/jobs/${jobId}/pages/${pageId}`)
  }
}
