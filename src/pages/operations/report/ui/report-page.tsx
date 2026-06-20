import { useMemo } from 'react'
import { AlertTriangle, Briefcase, Clock } from 'lucide-react'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { useWorkUsers } from '@/features/operations-data/model/use-work-user'
import { getOpsProjects } from '@/entities/project/lib/project-ops-adapter'
import { computeProjectMetrics } from '@/entities/project/lib/project-metrics'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell, PageShellSkeleton } from '@/shared/ui/page-shell'
import { SectionHeader } from '@/shared/ui/section-header'
import { PageSection } from '@/shared/ui/page-section'
import { StatCard } from '@/shared/ui/stat-card'
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

  if (loading) {
    return (
      <PageShellSkeleton
        title="주간 임원 리포트"
        description={`${weekId} · 확정 실적 기준`}
      />
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="주간 임원 리포트"
        description={`${weekId} · 확정 실적 기준`}
      />

      <section className="grid gap-5 sm:grid-cols-3">
        <StatCard title="확정 실적 시간" value={fmtMD(totalHours)} icon={Clock} />
        <StatCard title="활성 프로젝트" value={String(projectSummaries.length)} icon={Briefcase} />
        <StatCard
          title="위험 프로젝트"
          value={String(projectSummaries.filter((p) => p.metrics.risks.length > 0).length)}
          icon={AlertTriangle}
        />
      </section>

      <section className="space-y-6">
        <SectionHeader title="프로젝트별 요약" />
        <div className="flex flex-col gap-6">
          {projectSummaries.map(({ project, metrics }) => (
            <PageSection
              key={project.id}
              title={`${project.clientName} · ${project.projectName}`}
              actions={
                <span className="text-sm text-muted-foreground">{fmtPercent(metrics.progress)}</span>
              }
            >
              <div className="grid gap-2 text-sm md:grid-cols-4">
                <div>계약 {fmtKRW(metrics.revenue)}</div>
                <div>실제 원가 {fmtKRW(metrics.actualCost)}</div>
                <div>이익률 {fmtPercent(metrics.actualMargin)}</div>
                <div>
                  MD {fmtMD(metrics.actualHours)} / {fmtMD(metrics.contractHours)}
                </div>
              </div>
            </PageSection>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
