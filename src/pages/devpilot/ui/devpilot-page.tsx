import { DevPilotGeneratePanel } from '@/features/devpilot-generate'
import { PageHeader } from '@/shared/ui/page-header'

export function DevPilotPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="퍼블리싱 자동화"
        description="기획안과 디자인 레퍼런스로 회사 디자인 시스템에 순응하는 페이지를 생성합니다. (Pass 1: mock transport)"
      />
      <DevPilotGeneratePanel />
    </div>
  )
}
