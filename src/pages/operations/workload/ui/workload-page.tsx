import { useMemo, useState } from 'react'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '@/shared/config/routes'
import { getOpsProjects } from '@/entities/project/lib/project-ops-adapter'
import { computeEmployeeWeeklyTrend } from '@/entities/schedule/lib/employee-pl'
import { Sparkline } from '@/widgets/sparkline'
import { useWorkUsers } from '@/features/operations-data/model/use-work-user'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'
import { fmtHours, fmtPercent } from '@/shared/lib/format-utils'
import { getISOWeekId } from '@/shared/lib/week-utils'
import type { WorkUser } from '@/entities/project/lib/project-ops-adapter'
import type { Schedule } from '@/entities/schedule/model/schedule-types'

export function WorkloadPage() {
  useOperationsInit()
  const loading = useOperationsStore((s) => s.loading)
  const schedules = useOperationsStore((s) => s.schedules)
  const projects = useOperationsStore((s) => s.projects)
  const config = useOperationsStore((s) => s.config)
  const workUsers = useWorkUsers()
  const navigate = useNavigate()
  const setPreviewUserId = useOperationsStore((s) => s.setPreviewUserId)
  const weekId = getISOWeekId(new Date())
  const [detail, setDetail] = useState<{ user: WorkUser; weekId: string } | null>(null)

  const opsProjects = useMemo(() => getOpsProjects(projects), [projects])

  if (loading) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-6">
      <PageHeader
        title="주간 부하"
        description={`${weekId} 기준 팀원별 계획 시간과 가동률`}
        actions={
          <Button
            variant="outline"
            size="sm"
              onClick={() => {
                setPreviewUserId(detail?.user.id ?? workUsers[0]?.id ?? null)
                navigate(APP_ROUTES.schedule)
              }}
          >
            직원 모드 프리뷰
          </Button>
        }
      />
      <div className="grid gap-4">
        {workUsers.map((user) => {
          const trend = computeEmployeeWeeklyTrend(schedules, user.id)
          const plan = schedules.find(
            (s) => s.employeeId === user.id && s.weekId === weekId && s.type === 'plan',
          )
          const hours = plan?.tasks?.reduce((a, t) => a + Number(t.hours), 0) ?? 0
          const utilization = config.weeklyHours > 0 ? (hours / config.weeklyHours) * 100 : 0
          return (
            <Card
              key={user.id}
              className="cursor-pointer transition-colors hover:border-primary/30"
              onClick={() => setDetail({ user, weekId })}
            >
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{user.name}</CardTitle>
                <span className="text-sm text-muted-foreground">{fmtHours(hours)}</span>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">가동률</span>
                  <span className="font-medium">{fmtPercent(utilization)}</span>
                </div>
                <Progress value={Math.min(utilization, 100)} />
                <Sparkline data={trend} height={48} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Sheet open={!!detail} onOpenChange={() => setDetail(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {detail.user.name} · {detail.weekId}
                </SheetTitle>
              </SheetHeader>
              <ScheduleDetailContent
                schedules={schedules}
                userId={detail.user.id}
                weekId={detail.weekId}
                projects={opsProjects}
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function ScheduleDetailContent({
  schedules,
  userId,
  weekId,
  projects,
}: {
  schedules: Schedule[]
  userId: string
  weekId: string
  projects: ReturnType<typeof getOpsProjects>
}) {
  const weekSchedules = schedules.filter((s) => s.employeeId === userId && s.weekId === weekId)
  return (
    <div className="mt-4 space-y-4">
      {weekSchedules.map((s) => (
        <div key={s.id} className="space-y-2">
          <div className="font-medium">{s.type === 'plan' ? '계획' : '실적'}</div>
          {s.tasks.map((t, i) => {
            const p = projects.find((pp) => pp.id === t.projectId)
            return (
              <div key={i} className="text-sm text-muted-foreground">
                {t.date} · {p?.projectName ?? t.projectId} · {fmtHours(t.hours)}
              </div>
            )
          })}
        </div>
      ))}
      {!weekSchedules.length && <p className="text-sm text-muted-foreground">데이터 없음</p>}
    </div>
  )
}
