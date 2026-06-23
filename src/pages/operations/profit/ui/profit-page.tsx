import { useMemo } from 'react'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { useWorkUsers } from '@/features/operations-data/model/use-work-user'
import { getOpsProjects } from '@/entities/project/lib/project-ops-adapter'
import {
  computeProjectMetrics,
  getRiskDescription,
} from '@/entities/project/lib/project-metrics'
import { computeEmployeePL, computeTeamPL } from '@/entities/schedule/lib/employee-pl'
import { mockTeams, TEAM_IDS } from '@/shared/mocks/mock-org-structure'
import { RISK_LABEL } from '@/shared/constants/workboard'
import { QUERY_PARAMS } from '@/shared/constants/query-param-keys'
import { PROFIT_VIEW_VALUES } from '@/shared/lib/query-param-validators'
import { useQueryParamEnum } from '@/shared/lib/use-query-param'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell, PageShellSkeleton } from '@/shared/ui/page-shell'
import { SectionHeader } from '@/shared/ui/section-header'
import { PageSection } from '@/shared/ui/page-section'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { EmptyState } from '@/shared/ui/empty-state'
import { fmtKRW, fmtMD, fmtPercent } from '@/shared/lib/format-utils'

export function ProfitPage() {
  useOperationsInit()
  const loading = useOperationsStore((s) => s.loading)
  const schedules = useOperationsStore((s) => s.schedules)
  const projects = useOperationsStore((s) => s.projects)
  const config = useOperationsStore((s) => s.config)
  const workUsers = useWorkUsers()
  const [view, setView] = useQueryParamEnum(QUERY_PARAMS.view, 'amount', PROFIT_VIEW_VALUES)

  const opsProjects = useMemo(
    () => getOpsProjects(projects).filter((p) => p.status !== 'cancelled'),
    [projects],
  )

  const projectMetrics = useMemo(
    () =>
      opsProjects.map((p) => ({
        project: p,
        metrics: computeProjectMetrics(p, schedules, workUsers, config),
      })),
    [opsProjects, schedules, workUsers, config],
  )

  const employeePL = useMemo(
    () => workUsers.map((u) => computeEmployeePL(u, opsProjects, schedules, config)),
    [workUsers, opsProjects, schedules, config],
  )

  const teamPL = useMemo(() => {
    const operationalTeams = mockTeams.filter((team) => team.id !== TEAM_IDS.EXECUTIVE)
    return operationalTeams.map((team) => {
      const members = employeePL.filter((pl) => pl.user.teamId === team.id)
      return computeTeamPL(team.id, team.label, members, config)
    })
  }, [employeePL, config])

  const riskProjects = projectMetrics.filter((pm) => pm.metrics.risks.length > 0)

  if (loading) {
    return <PageShellSkeleton title="이익률" description="프로젝트·팀·직원 P/L 및 위험 프로젝트" />
  }

  return (
    <PageShell>
      <PageHeader title="이익률" description="프로젝트·팀·직원 P/L 및 위험 프로젝트" />

      <TabsRoot value={view} onValueChange={(v: string) => setView(v as 'amount' | 'md')}>
        <TabsList>
          <TabsTrigger value="amount">금액</TabsTrigger>
          <TabsTrigger value="md">MD</TabsTrigger>
        </TabsList>
        <TabsContent value="amount" className="space-y-6">
          <div className="flex flex-col gap-6">
            {projectMetrics.map(({ project, metrics }) => (
              <PageSection
                key={project.id}
                title={`${project.clientName} · ${project.projectName}`}
                actions={
                  <Badge tone={metrics.actualMargin >= metrics.expectedMargin ? 'success' : 'warning'}>
                    {fmtPercent(metrics.actualMargin)}
                  </Badge>
                }
              >
                <div className="grid gap-2 text-sm md:grid-cols-4">
                  <div>계약 {fmtKRW(metrics.revenue)}</div>
                  <div>실제 원가 {fmtKRW(metrics.actualCost)}</div>
                  <div>이익 {fmtKRW(metrics.actualProfit)}</div>
                  <div>진행률 {fmtPercent(metrics.progress)}</div>
                </div>
              </PageSection>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="md" className="space-y-6">
          <div className="flex flex-col gap-6">
            {projectMetrics.map(({ project, metrics }) => (
              <PageSection key={project.id} title={project.projectName}>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>계약 {fmtMD(metrics.contractHours)}</span>
                    <span>실투입 {fmtMD(metrics.actualHours)}</span>
                  </div>
                  <Progress value={Math.min(metrics.progress, 100)} />
                </div>
              </PageSection>
            ))}
          </div>
        </TabsContent>
      </TabsRoot>

      <section className="space-y-6">
        <SectionHeader title="위험 프로젝트" />
        {riskProjects.length > 0 ? (
          <div className="flex flex-col gap-6">
            {riskProjects.map(({ project, metrics }) => (
              <PageSection key={project.id} title={project.projectName} className="border-danger/30">
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
            ))}
          </div>
        ) : (
          <EmptyState title="위험 프로젝트 없음" description="현재 위험으로 분류된 프로젝트가 없습니다." />
        )}
      </section>

      <section className="space-y-6">
        <SectionHeader title="팀별 P/L" />
        <div className="grid gap-6 md:grid-cols-2">
          {teamPL.map((pl) => (
            <PageSection
              key={pl.teamId}
              title={pl.teamLabel}
              actions={<Badge tone={pl.margin >= 0 ? 'success' : 'danger'}>{fmtPercent(pl.margin)}</Badge>}
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>팀원 {pl.memberCount}명</div>
                <div>매출 {fmtKRW(pl.revenue)}</div>
                <div>원가 {fmtKRW(pl.cost)}</div>
                <div>기여 {fmtKRW(pl.contribution)}</div>
                <div>가동률 {fmtPercent(pl.utilization)}</div>
                <div>배정 MD {pl.assignedMD.toFixed(1)}</div>
              </div>
            </PageSection>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="직원별 P/L" />
        <div className="grid gap-6 md:grid-cols-2">
          {employeePL.map((pl) => (
            <PageSection key={pl.user.id} title={pl.user.name}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>매출 {fmtKRW(pl.revenue)}</div>
                <div>원가 {fmtKRW(pl.cost)}</div>
                <div>기여 {fmtKRW(pl.contribution)}</div>
                <div>이익률 {fmtPercent(pl.margin)}</div>
                <div>가동률 {fmtPercent(pl.utilization)}</div>
                <div>배정 MD {pl.assignedMD.toFixed(1)}</div>
              </div>
            </PageSection>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
