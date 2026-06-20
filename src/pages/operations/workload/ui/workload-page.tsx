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
import { PageShell, PageShellSkeleton } from '@/shared/ui/page-shell'
import { PageSection } from '@/shared/ui/page-section'
import { Heading } from '@/shared/ui/typography'
import { Button } from '@/shared/ui/button'
import { Progress } from '@/shared/ui/progress'
import { EmptyState } from '@/shared/ui/empty-state'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { pageCardListRowClassName, pageCardShellClassName } from '@/shared/constants/page-card-styles'
import { Card } from '@/shared/ui/card'
import { cn } from '@/shared/lib/cn'
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const [detail, setDetail] = useState<{ user: WorkUser; weekId: string } | null>(null)

  const handleOpenDetail = (user: WorkUser) => {
    setDetail({ user, weekId })
    setSheetOpen(true)
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      window.setTimeout(() => setDetail(null), 350)
    }
  }

  const opsProjects = useMemo(() => getOpsProjects(projects), [projects])

  if (loading) {
    return (
      <PageShellSkeleton
        title="주간 부하"
        description={`${weekId} 기준 팀원별 계획 시간과 가동률`}
      />
    )
  }

  return (
    <PageShell>
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
      <div className="grid gap-6">
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
              className={cn(pageCardShellClassName, 'cursor-pointer transition-colors hover:border-primary/30')}
              onClick={() => handleOpenDetail(user)}
            >
              <div className="flex flex-row items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
                <Heading variant="card">{user.name}</Heading>
                <span className="text-sm text-muted-foreground">{fmtHours(hours)}</span>
              </div>
              <div className="space-y-3 px-6 py-5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">가동률</span>
                  <span className="font-medium">{fmtPercent(utilization)}</span>
                </div>
                <Progress value={Math.min(utilization, 100)} />
                <Sparkline data={trend} height={48} />
              </div>
            </Card>
          )
        })}
      </div>

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          {detail ? (
            <>
              <SheetHeader>
                <SheetTitle>{detail.user.name}</SheetTitle>
                <SheetDescription>{detail.weekId} · 주간 계획 및 실적</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <ScheduleDetailContent
                  schedules={schedules}
                  userId={detail.user.id}
                  weekId={detail.weekId}
                  projects={opsProjects}
                />
              </SheetBody>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </PageShell>
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

  if (!weekSchedules.length) {
    return (
      <EmptyState title="데이터 없음" description="해당 주차 데이터가 없습니다." />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {weekSchedules.map((s) => (
        <PageSection
          key={s.id}
          title={s.type === 'plan' ? '계획' : '실적'}
          padded={false}
          contentClassName="p-0"
        >
          <ul className="divide-y divide-border/60">
            {s.tasks.map((t, i) => {
              const p = projects.find((pp) => pp.id === t.projectId)
              return (
                <li
                  key={i}
                  className={cn(
                    pageCardListRowClassName,
                    'flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3',
                  )}
                >
                  <span className="font-medium text-foreground">{p?.projectName ?? t.projectId}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {t.date} · {fmtHours(t.hours)}
                  </span>
                </li>
              )
            })}
          </ul>
        </PageSection>
      ))}
    </div>
  )
}
