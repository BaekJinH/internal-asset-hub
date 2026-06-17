import { useMemo } from 'react'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { useWorkUsers } from '@/features/operations-data/model/use-work-user'
import { getOpsProjects } from '@/entities/project/lib/project-ops-adapter'
import { computeProjectMetrics } from '@/entities/project/lib/project-metrics'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { fmtKRW, fmtMD, fmtPercent } from '@/shared/lib/format-utils'
import { getISOWeekId } from '@/shared/lib/week-utils'

export function ReportPage() {
  useOperationsInit()
  const loading = useOperationsStore((s) => s.loading)
  const schedules = useOperationsStore((s) => s.schedules)
  const projects = useOperationsStore((s) => s.projects)
  const config = useOperationsStore((s) => s.config)
  const workUsers = useWorkUsers()
  const weekId = getISOWeekId(new Date())

  const opsProjects = useMemo(() => getOpsProjects(projects), [projects])

  const confirmedThisWeek = useMemo(
    () =>
      schedules.filter(
        (s) => s.type === 'actual' && s.status === 'confirmed' && s.weekId === weekId,
      ),
    [schedules, weekId],
  )

  const totalHours = confirmedThisWeek.reduce(
    (a, s) => a + s.tasks.reduce((b, t) => b + Number(t.hours), 0),
    0,
  )

  const projectSummaries = useMemo(
    () =>
      opsProjects
        .filter((p) => p.status === 'active')
        .map((p) => ({
          project: p,
          metrics: computeProjectMetrics(p, schedules, workUsers, config),
        })),
    [opsProjects, schedules, workUsers, config],
  )

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="주간 임원 리포트"
        description={`${weekId} · 확정 실적 기준`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">확정 실적 시간</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{fmtMD(totalHours)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">활성 프로젝트</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{projectSummaries.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">위험 프로젝트</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {projectSummaries.filter((p) => p.metrics.risks.length > 0).length}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h3 className="font-medium">프로젝트별 요약</h3>
        {projectSummaries.map(({ project, metrics }) => (
          <Card key={project.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">
                {project.clientName} · {project.projectName}
              </CardTitle>
              <span className="text-sm text-muted-foreground">{fmtPercent(metrics.progress)}</span>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm md:grid-cols-4">
              <div>계약 {fmtKRW(metrics.revenue)}</div>
              <div>실제 원가 {fmtKRW(metrics.actualCost)}</div>
              <div>이익률 {fmtPercent(metrics.actualMargin)}</div>
              <div>MD {fmtMD(metrics.actualHours)} / {fmtMD(metrics.contractHours)}</div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
