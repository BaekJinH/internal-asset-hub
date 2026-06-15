import { useMemo } from 'react'
import { mockProjects } from '@/shared/mocks/mock-projects'
import { mockAssets } from '@/shared/mocks/mock-assets'
import { mockServerStatus } from '@/shared/mocks/mock-server-status'
import type { Project } from '@/entities/project'
import type { Asset } from '@/entities/asset'
import type { ServerStatus } from '@/entities/server'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { DashboardSummary } from '@/widgets/dashboard-summary'
import { ServerStatusCard } from '@/entities/server'
import { RecentProjects } from '@/widgets/recent-projects'
import { RecentAssets } from '@/widgets/recent-assets'
import { AiExtensionPreview } from '@/widgets/ai-extension-preview'

export function DashboardPage() {
  const projects = mockProjects as Project[]
  const assets = mockAssets as Asset[]
  const serverStatus = mockServerStatus as ServerStatus
  const recentUploads = useMemo(() => assets.filter((asset) => asset.updatedAt >= '2026-06-01').length, [assets])

  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="내부 자산 허브 현황"
        actions={
          <div className="flex gap-2">
            <Button>프로젝트 생성</Button>
            <Button variant="secondary">자산 등록</Button>
            <Button variant="secondary">검색</Button>
            <Button variant="secondary">AI 확장 보기</Button>
          </div>
        }
      />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <DashboardSummary title="전체 프로젝트" value={String(projects.length)} />
        <DashboardSummary title="등록 자산" value="1,284" />
        <DashboardSummary title="최근 업로드" value={String(recentUploads)} />
        <DashboardSummary title="미분류 파일" value={String(serverStatus.unclassifiedFileCount)} />
        <DashboardSummary title="스토리지 사용량" value="3.2TB / 12TB" />
      </section>
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <section>
            <h2 className="mb-3 text-xl font-semibold">최근 프로젝트</h2>
            <RecentProjects projects={projects.slice(0, 4)} />
          </section>
          <section>
            <h2 className="mb-3 text-xl font-semibold">최근 등록 자산</h2>
            <RecentAssets assets={assets.slice(0, 4)} />
          </section>
        </div>
        <div className="space-y-4">
          <ServerStatusCard status={serverStatus} />
          <AiExtensionPreview />
        </div>
      </div>
    </div>
  )
}
