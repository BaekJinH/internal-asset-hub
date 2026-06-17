import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { mockAssets } from '@/shared/mocks/mock-assets'
import type { Asset } from '@/entities/asset'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { usePermission } from '@/features/auth/model/use-auth'
import { PERMISSIONS } from '@/entities/role/model/role-types'
import { toOpsProjectView } from '@/entities/project/lib/project-ops-adapter'
import {
  computeProjectMetrics,
  getRiskDescription,
} from '@/entities/project/lib/project-metrics'
import { useWorkUsers } from '@/features/operations-data/model/use-work-user'
import { RISK_LABEL } from '@/shared/constants/workboard'
import { EmptyState } from '@/shared/ui/empty-state'
import { PageHeader } from '@/shared/ui/page-header'
import { SectionHeader } from '@/shared/ui/section-header'
import { ProjectStatusBadge } from '@/entities/project'
import { AssetCategoryTabs, useAssetCategoryFilter } from '@/features/asset-category-filter'
import { AssetTable } from '@/widgets/asset-table'
import { AiExtensionPreview } from '@/widgets/ai-extension-preview'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DescriptionList } from '@/shared/ui/description-list'
import { Tag } from '@/shared/ui/tag'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { fmtKRW, fmtMD, fmtPercent } from '@/shared/lib/format-utils'

export function ProjectDetailPage() {
  useOperationsInit()
  const projects = useOperationsStore((s) => s.projects)
  const schedules = useOperationsStore((s) => s.schedules)
  const config = useOperationsStore((s) => s.config)
  const workUsers = useWorkUsers()
  const { checkPermission } = usePermission()
  const assets = mockAssets as Asset[]
  const { projectId } = useParams<{ projectId: string }>()
  const project = useMemo(
    () => projects.find((item) => item.id === projectId),
    [projects, projectId],
  )
  const projectAssets = useMemo(
    () => assets.filter((asset) => asset.projectId === projectId),
    [assets, projectId],
  )
  const { category, setCategory, filteredAssets } = useAssetCategoryFilter(projectAssets)

  const opsView = project ? toOpsProjectView(project) : null
  const metrics = useMemo(() => {
    if (!opsView) return null
    return computeProjectMetrics(opsView, schedules, workUsers, config)
  }, [opsView, schedules, workUsers, config])

  const canViewOps =
    checkPermission(PERMISSIONS.OPERATIONS_VIEW) &&
    checkPermission(PERMISSIONS.FINANCIAL_VIEW) &&
    opsView != null

  if (!project) {
    return <EmptyState title="프로젝트 없음" description="요청한 프로젝트를 찾을 수 없습니다." />
  }

  return (
    <div className="space-y-6">
      <PageHeader title={project.name} description="프로젝트 상세 정보, 자산 및 운영" />

      <TabsRoot defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="assets">자산</TabsTrigger>
          {canViewOps && <TabsTrigger value="operations">운영</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-0">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">프로젝트 정보</CardTitle>
                <ProjectStatusBadge status={project.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <DescriptionList
                items={[
                  { label: '담당자', value: project.owner },
                  { label: '자산 수', value: `${project.assetCount}개` },
                  { label: '설명', value: project.description },
                  ...(opsView
                    ? [
                        { label: '클라이언트', value: opsView.clientName },
                        { label: '계약 기간', value: `${opsView.startDate} ~ ${opsView.endDate}` },
                      ]
                    : []),
                ]}
              />
              <div className="flex flex-wrap gap-2">
                {Object.entries(project.links).map(([name, url]) =>
                  url ? (
                    <Tag key={name} as="a" href={url}>
                      {name}
                    </Tag>
                  ) : null,
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <section>
            <SectionHeader title="자산 목록" description="카테고리별로 자산을 필터링합니다." />
            <AssetCategoryTabs value={category} onChange={setCategory} />
            <div className="mt-4">
              <AssetTable assets={filteredAssets} />
            </div>
          </section>
          <AiExtensionPreview />
        </TabsContent>

        {canViewOps && metrics && opsView && (
          <TabsContent value="operations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">계약 금액</CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold">{fmtKRW(metrics.revenue)}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">실제 원가</CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold">{fmtKRW(metrics.actualCost)}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">이익률</CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold">{fmtPercent(metrics.actualMargin)}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">MD 진행률</CardTitle>
                </CardHeader>
                <CardContent className="text-xl font-semibold">{fmtPercent(metrics.progress)}</CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">MD 소진</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>실투입 {fmtMD(metrics.actualHours)}</span>
                  <span>계약 {fmtMD(metrics.contractHours)}</span>
                </div>
                <Progress value={Math.min(metrics.progress, 100)} />
              </CardContent>
            </Card>

            {metrics.risks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">리스크</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {metrics.risks.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge tone={r.severity === 'high' ? 'danger' : 'warning'}>
                        {RISK_LABEL[r.type]}
                      </Badge>
                      <span>{getRiskDescription(r, metrics)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">할당 ({opsView.assignments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {opsView.assignments.map((a) => (
                  <div key={a.id} className="text-sm">
                    {a.employeeId} · {a.jobType} · {a.startDate}~{a.endDate} · {a.allocation * 100}%
                  </div>
                ))}
                {!opsView.assignments.length && (
                  <p className="text-sm text-muted-foreground">할당 없음</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </TabsRoot>
    </div>
  )
}
