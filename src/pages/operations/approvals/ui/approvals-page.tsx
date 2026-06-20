import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { useWorkUsers } from '@/features/operations-data/model/use-work-user'
import { getOpsProjects } from '@/entities/project/lib/project-ops-adapter'
import { freezeTaskSnapshots } from '@/entities/schedule/lib/schedule-calc'
import { computePendingRisks } from '@/entities/project/lib/project-metrics'
import { ScheduleStatusBadge } from '@/entities/schedule/ui/schedule-status-badge'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell, PageShellSkeleton } from '@/shared/ui/page-shell'
import { PageSection } from '@/shared/ui/page-section'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Badge } from '@/shared/ui/badge'
import { EmptyState } from '@/shared/ui/empty-state'
import { Text } from '@/shared/ui/typography'
import { fmtHours } from '@/shared/lib/format-utils'
import { getUserById } from '@/shared/mocks/mock-users'
import { pageCardShellClassName } from '@/shared/constants/page-card-styles'
import { Card } from '@/shared/ui/card'
import { cn } from '@/shared/lib/cn'
import type { Schedule } from '@/entities/schedule/model/schedule-types'

export function ApprovalsPage() {
  useOperationsInit()
  const loading = useOperationsStore((s) => s.loading)
  const schedules = useOperationsStore((s) => s.schedules)
  const setSchedules = useOperationsStore((s) => s.setSchedules)
  const config = useOperationsStore((s) => s.config)
  const projects = useOperationsStore((s) => s.projects)
  const workUsers = useWorkUsers()
  const [selected, setSelected] = useState<Schedule | null>(null)
  const [taskHours, setTaskHours] = useState<Record<number, number>>({})
  const [reviewerComment, setReviewerComment] = useState('')

  const opsProjects = useMemo(() => getOpsProjects(projects), [projects])
  const pending = useMemo(() => schedules.filter((s) => s.status === 'submitted'), [schedules])
  const stale = useMemo(() => computePendingRisks(schedules), [schedules])

  const openDetail = (sch: Schedule) => {
    setSelected(sch)
    setReviewerComment(sch.reviewerComment ?? '')
    const hours: Record<number, number> = {}
    sch.tasks.forEach((t, i) => {
      hours[i] = Number(t.hours)
    })
    setTaskHours(hours)
  }

  const applyReview = (status: Schedule['status']) => {
    if (!selected) return
    const user = workUsers.find((u) => u.id === selected.employeeId)
    const updatedTasks = selected.tasks.map((t, i) => ({
      ...t,
      hours: taskHours[i] ?? t.hours,
    }))
    let finalTasks = updatedTasks
    let finalStatus = status
    if (status === 'approved' || status === 'confirmed') {
      finalTasks = freezeTaskSnapshots(updatedTasks, user!, opsProjects, config)
      finalStatus = selected.type === 'plan' ? 'approved' : 'confirmed'
    }
    const updated: Schedule = {
      ...selected,
      tasks: finalTasks,
      status: finalStatus,
      reviewedAt: new Date().toISOString(),
      reviewerComment,
    }
    setSchedules(schedules.map((s) => (s.id === updated.id ? updated : s)))
    toast.success(status === 'rejected' ? '반려되었습니다' : '승인되었습니다')
    setSelected(null)
  }

  if (loading) {
    return <PageShellSkeleton title="승인" description="검토 대기 항목을 확인하고 승인합니다." />
  }

  return (
    <PageShell>
      <PageHeader
        title="승인"
        description={`검토 대기 ${pending.length}건`}
        actions={
          stale.length > 0 ? (
            <Badge tone="danger">{stale.length}건 3일+ 적체</Badge>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          {pending.map((s) => {
            const emp = getUserById(s.employeeId)
            const hours = s.tasks.reduce((a, t) => a + Number(t.hours), 0)
            const isStale = stale.some((x) => x.id === s.id)
            return (
              <Card
                key={s.id}
                className={cn(pageCardShellClassName, 'cursor-pointer transition-colors hover:border-primary/30')}
                onClick={() => openDetail(s)}
              >
                <div className="flex flex-row items-center justify-between gap-4 border-b border-border/60 px-6 py-5">
                  <div className="min-w-0">
                    <Text as="p" size="body" className="font-semibold">
                      {emp?.name} · {s.weekId} · {s.type === 'plan' ? '계획' : '실적'}
                    </Text>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isStale && <Badge tone="danger">적체</Badge>}
                    <ScheduleStatusBadge status={s.status} />
                  </div>
                </div>
                <div className="px-6 py-5 text-sm text-muted-foreground">
                  {fmtHours(hours)} · {s.employeeComment || '코멘트 없음'}
                </div>
              </Card>
            )
          })}
          {!pending.length && (
            <EmptyState title="검토 대기 없음" description="검토 대기 항목이 없습니다." />
          )}
        </div>

        {selected && (
          <PageSection title="승인 상세">
            <div className="space-y-4">
              {selected.tasks.map((t, i) => {
                const p = opsProjects.find((pp) => pp.id === t.projectId)
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">
                      {t.date} · {p?.projectName ?? t.projectId}
                    </span>
                    <Input
                      type="number"
                      className="w-20"
                      value={taskHours[i] ?? t.hours}
                      onChange={(e) =>
                        setTaskHours((prev) => ({ ...prev, [i]: Number(e.target.value) }))
                      }
                    />
                  </div>
                )
              })}
              <Textarea
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                placeholder="검토 코멘트"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => applyReview(selected.type === 'plan' ? 'approved' : 'confirmed')}>
                  {selected.type === 'plan' ? '승인' : '확정'}
                </Button>
                <Button variant="outline" onClick={() => applyReview('rejected')}>
                  반려
                </Button>
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  닫기
                </Button>
              </div>
            </div>
          </PageSection>
        )}
      </div>
    </PageShell>
  )
}
