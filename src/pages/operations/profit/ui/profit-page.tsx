import { useMemo, useState } from 'react'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { useWorkUsers } from '@/features/operations-data/model/use-work-user'
import { getOpsProjects } from '@/entities/project/lib/project-ops-adapter'
import {
  computeProjectMetrics,
  getRiskDescription,
} from '@/entities/project/lib/project-metrics'
import { computeEmployeePL } from '@/entities/schedule/lib/employee-pl'
import { RISK_LABEL } from '@/shared/constants/workboard'
import { PageHeader } from '@/shared/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Skeleton } from '@/shared/ui/skeleton'
import { fmtKRW, fmtMD, fmtPercent } from '@/shared/lib/format-utils'

export function ProfitPage() {
  useOperationsInit()
  const loading = useOperationsStore((s) => s.loading)
  const schedules = useOperationsStore((s) => s.schedules)
  const projects = useOperationsStore((s) => s.projects)
  const config = useOperationsStore((s) => s.config)
  const workUsers = useWorkUsers()
  const [view, setView] = useState<'amount' | 'md'>('amount')

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

  const riskProjects = projectMetrics.filter((pm) => pm.metrics.risks.length > 0)

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader title="이익률" description="프로젝트 P/L 및 위험 프로젝트" />

      <TabsRoot value={view} onValueChange={(v: string) => setView(v as 'amount' | 'md')}>
        <TabsList>
          <TabsTrigger value="amount">금액</TabsTrigger>
          <TabsTrigger value="md">MD</TabsTrigger>
        </TabsList>
        <TabsContent value="amount" className="space-y-4">
          {projectMetrics.map(({ project, metrics }) => (
            <Card key={project.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  {project.clientName} · {project.projectName}
                </CardTitle>
                <Badge tone={metrics.actualMargin >= metrics.expectedMargin ? 'success' : 'warning'}>
                  {fmtPercent(metrics.actualMargin)}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm md:grid-cols-4">
                <div>계약 {fmtKRW(metrics.revenue)}</div>
                <div>실제 원가 {fmtKRW(metrics.actualCost)}</div>
                <div>이익 {fmtKRW(metrics.actualProfit)}</div>
                <div>진행률 {fmtPercent(metrics.progress)}</div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="md" className="space-y-4">
          {projectMetrics.map(({ project, metrics }) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="text-base">{project.projectName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>계약 {fmtMD(metrics.contractHours)}</span>
                  <span>실투입 {fmtMD(metrics.actualHours)}</span>
                </div>
                <Progress value={Math.min(metrics.progress, 100)} />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </TabsRoot>

      {riskProjects.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-medium">위험 프로젝트</h3>
          {riskProjects.map(({ project, metrics }) => (
            <Card key={project.id} className="border-danger/30">
              <CardContent className="space-y-2 pt-4">
                <div className="font-medium">{project.projectName}</div>
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
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h3 className="font-medium">직원별 P/L</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {employeePL.map((pl) => (
            <Card key={pl.user.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{pl.user.name}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div>매출 {fmtKRW(pl.revenue)}</div>
                <div>원가 {fmtKRW(pl.cost)}</div>
                <div>기여 {fmtKRW(pl.contribution)}</div>
                <div>이익률 {fmtPercent(pl.margin)}</div>
                <div>가동률 {fmtPercent(pl.utilization)}</div>
                <div>배정 MD {pl.assignedMD.toFixed(1)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
