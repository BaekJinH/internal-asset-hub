import type { DevPilotTransport } from '@/entities/devpilot/api/devpilot-transport'
import { MockDevPilotTransport } from '@/entities/devpilot/api/mock-devpilot-transport'
import type {
  AnalyzeRequest,
  BuildManifest,
  JobStatus,
  PageArtifact,
} from '@/entities/devpilot/model/devpilot-types'

/**
 * 호스트가 소비하는 단일 진입점. transport를 DI로 주입.
 * Pass 1 default = Mock(엔진 디커플). 엔진 GA 시 아래 한 줄을 `new HttpDevPilotTransport()`로 교체.
 */
export function createDevPilotService(transport: DevPilotTransport) {
  return {
    analyze(req: AnalyzeRequest): Promise<BuildManifest> {
      return transport.analyze(req)
    },
    generate(manifestId: string, pageIds?: string[]): Promise<{ jobId: string }> {
      return transport.generate(manifestId, pageIds)
    },
    getJob(jobId: string): Promise<JobStatus> {
      return transport.getJob(jobId)
    },
    getPage(jobId: string, pageId: string): Promise<PageArtifact> {
      return transport.getPage(jobId, pageId)
    },
  }
}

export type DevPilotService = ReturnType<typeof createDevPilotService>

// ★ Pass 1 default 주입(Mock). 엔진 GA 시 이 한 줄만 교체.
export const devpilotService: DevPilotService = createDevPilotService(new MockDevPilotTransport())
