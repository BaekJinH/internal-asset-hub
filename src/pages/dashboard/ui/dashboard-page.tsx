import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  FileQuestion,
  FileStack,
  FolderKanban,
  HardDrive,
  PlusCircle,
  Search,
  Upload,
} from 'lucide-react'
import { mockProjects } from '@/shared/mocks/mock-projects'
import { mockAssets } from '@/shared/mocks/mock-assets'
import { mockServerStatus } from '@/shared/mocks/mock-server-status'
import type { Project } from '@/entities/project'
import type { Asset } from '@/entities/asset'
import type { ServerStatus } from '@/entities/server'
import { APP_ROUTES } from '@/shared/config/routes'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { DashboardSection, DashboardSummaryCard } from '@/widgets/dashboard-section'
import { ServerStatusCard } from '@/entities/server'
import { AiExtensionPreview } from '@/widgets/ai-extension-preview'
import { mockCategoryBreakdownData, mockUploadTrendData } from '@/shared/mocks/mock-dashboard-charts'
import {
  AssetCategoryChart,
  AssetUploadTrendChart,
  buildCategoryBreakdownData,
  buildProjectAssetDistributionData,
  buildUploadTrendData,
  DashboardProjectList,
  DashboardRecentAssetsTable,
  getRecentUploadCount,
  getTotalRegisteredAssets,
  ProjectAssetDistributionChart,
  shouldUseAggregateChartData,
  StorageUsageCard,
} from '@/widgets/dashboard'

function DashboardSummarySkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-[104px] rounded-lg" />
      ))}
    </div>
  )
}

function DashboardChartsSkeleton() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-[380px] rounded-lg" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[360px] rounded-lg" />
        <Skeleton className="h-[360px] rounded-lg" />
      </div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const projects = mockProjects as Project[]
  const assets = mockAssets as Asset[]
  const serverStatus = mockServerStatus as ServerStatus
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 300)
    return () => window.clearTimeout(timer)
  }, [])

  const uploadTrendData = useMemo(
    () => (shouldUseAggregateChartData(assets) ? mockUploadTrendData : buildUploadTrendData(assets)),
    [assets],
  )
  const categoryData = useMemo(
    () => (shouldUseAggregateChartData(assets) ? mockCategoryBreakdownData : buildCategoryBreakdownData(assets)),
    [assets],
  )
  const projectAssetData = useMemo(() => buildProjectAssetDistributionData(projects), [projects])
  const totalAssets = useMemo(() => getTotalRegisteredAssets(projects), [projects])
  const recentUploads = useMemo(() => getRecentUploadCount(assets), [assets])

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    [projects],
  )

  const recentAssets = useMemo(
    () => [...assets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8),
    [assets],
  )

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="대시보드"
        description="내부 자산 허브의 프로젝트, 자산, 스토리지 현황을 한눈에 확인하세요."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(APP_ROUTES.search)}>
              <Search className="h-4 w-4" />
              통합 검색
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(APP_ROUTES.assetNew)}>
              <PlusCircle className="h-4 w-4" />
              자산 등록
            </Button>
            <Button size="sm" onClick={() => navigate(APP_ROUTES.projects)}>
              프로젝트 보기
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <DashboardSummarySkeleton />
      ) : (
        <section aria-label="요약 지표" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardSummaryCard
            title="전체 프로젝트"
            value={String(projects.length)}
            helperText="활성 및 보관 프로젝트"
            icon={FolderKanban}
          />
          <DashboardSummaryCard
            title="등록 자산"
            value={totalAssets.toLocaleString('ko-KR')}
            helperText="전체 등록 파일"
            icon={FileStack}
          />
          <DashboardSummaryCard
            title="최근 업로드"
            value={String(recentUploads)}
            helperText="6월 이후 업데이트"
            icon={Upload}
          />
          <DashboardSummaryCard
            title="미분류 파일"
            value={String(serverStatus.unclassifiedFileCount)}
            helperText="분류 대기 중"
            icon={FileQuestion}
          />
          <DashboardSummaryCard
            title="스토리지 사용량"
            value={`${serverStatus.storageUsed.toFixed(1)}TB / ${serverStatus.storageTotal.toFixed(1)}TB`}
            helperText={`전체 용량 대비 ${Math.round((serverStatus.storageUsed / serverStatus.storageTotal) * 100)}%`}
            icon={HardDrive}
          />
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-8">
          {isLoading ? (
            <DashboardChartsSkeleton />
          ) : (
            <>
              <AssetUploadTrendChart data={uploadTrendData} />
              <div className="grid gap-6 lg:grid-cols-2">
                <ProjectAssetDistributionChart data={projectAssetData} />
                <AssetCategoryChart data={categoryData} />
              </div>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-6 xl:col-span-4">
          {isLoading ? (
            <>
              <Skeleton className="h-56 rounded-lg" />
              <Skeleton className="h-52 rounded-lg" />
              <Skeleton className="h-64 rounded-lg" />
            </>
          ) : (
            <>
              <StorageUsageCard status={serverStatus} />
              <ServerStatusCard status={serverStatus} hideStorage />
              <AiExtensionPreview />
            </>
          )}
        </aside>
      </div>

      <DashboardSection
        title="최근 등록 자산"
        description="최근 업데이트된 자산 목록"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(APP_ROUTES.search)}>
            검색으로 이동
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        }
        contentClassName="p-0"
        padded={false}
      >
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 rounded-md" />
            ))}
          </div>
        ) : (
          <DashboardRecentAssetsTable assets={recentAssets} />
        )}
      </DashboardSection>

      <DashboardSection
        title="최근 프로젝트"
        description="최근 업데이트된 프로젝트 개요"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(APP_ROUTES.projects)}>
            전체 보기
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        }
        contentClassName="p-0"
        padded={false}
      >
        {isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <DashboardProjectList projects={recentProjects} />
        )}
      </DashboardSection>
    </div>
  )
}
