import type {
  AnalyzeRequest,
  BuildManifest,
  JobStatus,
  PageArtifact,
} from '@/entities/devpilot/model/devpilot-types'

/**
 * DevPilot 엔진과 호스트(tinto-gui) 사이의 단일 계약(seam).
 * 구현 교체: Mock(Pass 1 default) → Http(엔진 GA) → InProcess(데스크탑).
 * 소비자(devpilot-service)는 이 인터페이스에만 의존 → 전환 시 1곳만 교체.
 */
export interface DevPilotTransport {
  analyze(req: AnalyzeRequest): Promise<BuildManifest>
  generate(manifestId: string, pageIds?: string[]): Promise<{ jobId: string }>
  getJob(jobId: string): Promise<JobStatus>
  getPage(jobId: string, pageId: string): Promise<PageArtifact>
}
