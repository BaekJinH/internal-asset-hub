import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { CircleDollarSign, Clock, Percent, TrendingUp } from 'lucide-react'
import { useAssetsByProjectQuery } from '@/entities/asset/api/asset-queries'
import { useProjectQuery, useProjectsQuery } from '@/entities/project/api/project-queries'
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
import { PageShell } from '@/shared/ui/page-shell'
import { SectionHeader } from '@/shared/ui/section-header'
import { PageSection } from '@/shared/ui/page-section'
import { StatCard } from '@/shared/ui/stat-card'
import { ProjectStatusBadge } from '@/entities/project'
import { getProjectSyncSummary } from '@/entities/project/lib/project-sync-utils'
import {
  getProjectListMetadataSchema,
  getProjectMetadataValues,
} from '@/entities/project/lib/project-list-metadata'
import { resolveProjectTeamCategory } from '@/entities/project/lib/project-team-utils'
import { ProjectSyncBadges } from '@/entities/project/ui/project-sync-badges'
import { AssetCategoryTabs, useAssetCategoryFilter } from '@/features/asset-category-filter'
import { FigmaImportPanel } from '@/features/figma-import'
import { AssetTable } from '@/widgets/asset-table'
import { AiExtensionPreview } from '@/widgets/ai-extension-preview'
import { DescriptionList } from '@/shared/ui/description-list'
import { Tag } from '@/shared/ui/tag'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { Text } from '@/shared/ui/typography'
import { fmtKRW, fmtMD, fmtPercent } from '@/shared/lib/format-utils'
import { QUERY_PARAMS } from '@/shared/constants/query-param-keys'
import { PROJECT_DETAIL_TAB_VALUES } from '@/shared/lib/query-param-validators'
import { useQueryParamEnum } from '@/shared/lib/use-query-param'

export function ProjectDetailPage() {
  useOperationsInit()
  const { projectId } = useParams<{ projectId: string }>()
  const { data: projectFromQuery } = useProjectQuery(projectId)
  const { data: projects = [] } = useProjectsQuery()
  const schedules = useOperationsStore((s) => s.schedules)
  const config = useOperationsStore((s) => s.config)
  const workUsers = useWorkUsers()
  const { checkPermission } = usePermission()
  const { data: projectAssets = [] } = useAssetsByProjectQuery(projectId)
  const project = useMemo(
    () => projectFromQuery ?? projects.find((item) => item.id === projectId),
    [projectFromQuery, projects, projectId],
  )
  const { category, setCategory, filteredAssets } = useAssetCategoryFilter(projectAssets)
  const [tab, setTab] = useQueryParamEnum(QUERY_PARAMS.tab, 'overview', PROJECT_DETAIL_TAB_VALUES)

  const opsView = project ? toOpsProjectView(project) : null
  const metrics = useMemo(() => {
    if (!opsView) return null
    return computeProjectMetrics(opsView, schedules, workUsers, config)
  }, [opsView, schedules, workUsers, config])

  const canViewOps =
    checkPermission(PERMISSIONS.OPERATIONS_VIEW) &&
    checkPermission(PERMISSIONS.FINANCIAL_VIEW) &&
    opsView != null

  const activeTab = useMemo(() => {
    if (tab === 'operations' && !canViewOps) return 'overview'
    return tab
  }, [tab, canViewOps])

  const teamCategory = project ? resolveProjectTeamCategory(project) : 'dev'
  const metadataSchema = getProjectListMetadataSchema(teamCategory)
  const metadataValues = project ? getProjectMetadataValues(project, teamCategory) : {}

  const overviewItems = useMemo(() => {
    if (!project) return []
    const syncedFields = metadataSchema
      .filter((field) => metadataValues[field.key] && metadataValues[field.key] !== '—')
      .map((field) => ({ label: field.label, value: metadataValues[field.key] }))

    return [
      ...syncedFields,
      { label: '연동 상태', value: getProjectSyncSummary(project) },
      ...(opsView
        ? [
            { label: '클라이언트', value: opsView.clientName },
            { label: '계약 기간', value: `${opsView.startDate} ~ ${opsView.endDate}` },
          ]
        : []),
    ]
  }, [project, metadataSchema, metadataValues, opsView])

  if (!project) {
    return (
      <PageShell>
        <PageHeader title="프로젝트 상세" description="프로젝트 상세 정보, 자산 및 운영" />
        <EmptyState title="프로젝트 없음" description="요청한 프로젝트를 찾을 수 없습니다." />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader title={project.name} description="프로젝트 상세 정보, 자산 및 운영" />

      <TabsRoot
        value={activeTab}
        onValueChange={(value) => setTab(value as (typeof PROJECT_DETAIL_TAB_VALUES)[number])}
      >
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="assets">자산</TabsTrigger>
          {canViewOps && <TabsTrigger value="operations">운영</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PageSection
            title="프로젝트 정보"
            actions={<ProjectStatusBadge status={project.status} />}
          >
            <div className="space-y-4">
              <DescriptionList items={overviewItems} />
              <div className="flex flex-wrap items-center gap-2">
                <ProjectSyncBadges project={project} />
                {Object.entries(project.links).map(([name, url]) =>
                  url ? (
                    <Tag key={name} as="a" href={url}>
                      {name}
                    </Tag>
                  ) : null,
                )}
              </div>
            </div>
          </PageSection>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <PageSection title="Figma 연동" description="Figma 파일 URL을 프로젝트에 연결하거나 design 자산으로 가져옵니다.">
            <FigmaImportPanel projectId={project.id} initialUrl={project.links.figma} />
          </PageSection>
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
          <TabsContent value="operations" className="space-y-6">
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard title="계약 금액" value={fmtKRW(metrics.revenue)} icon={CircleDollarSign} />
              <StatCard title="실제 원가" value={fmtKRW(metrics.actualCost)} icon={TrendingUp} />
              <StatCard title="이익률" value={fmtPercent(metrics.actualMargin)} icon={Percent} />
              <StatCard title="MD 진행률" value={fmtPercent(metrics.progress)} icon={Clock} />
            </section>

            <PageSection title="MD 소진">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>실투입 {fmtMD(metrics.actualHours)}</span>
                  <span>계약 {fmtMD(metrics.contractHours)}</span>
                </div>
                <Progress value={Math.min(metrics.progress, 100)} />
              </div>
            </PageSection>

            {metrics.risks.length > 0 && (
              <PageSection title="리스크">
                <div className="space-y-2">
                  {metrics.risks.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge tone={r.severity === 'high' ? 'danger' : 'warning'}>
                        {RISK_LABEL[r.type]}
                      </Badge>
                      <span>{getRiskDescription(r, metrics)}</span>
                    </div>
                  ))}
                </div>
              </PageSection>
            )}

            <PageSection title={`할당 (${opsView.assignments.length})`}>
              {opsView.assignments.length > 0 ? (
                <div className="space-y-2">
                  {opsView.assignments.map((a) => (
                    <Text key={a.id} as="p" size="body">
                      {a.employeeId} · {a.jobType} · {a.startDate}~{a.endDate} · {a.allocation * 100}%
                    </Text>
                  ))}
                </div>
              ) : (
                <Text as="p" tone="muted" size="body">
                  할당 없음
                </Text>
              )}
            </PageSection>
          </TabsContent>
        )}
      </TabsRoot>
    </PageShell>
  )
}
