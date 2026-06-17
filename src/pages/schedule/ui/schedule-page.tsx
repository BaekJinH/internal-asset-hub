import { useMemo, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { useCurrentWorkUser, useIsManager } from '@/features/operations-data/model/use-work-user'
import { getOpsProjects } from '@/entities/project/lib/project-ops-adapter'
import { clonePlanTasksForActual, canDeleteSchedule, getEndingAssignments } from '@/entities/schedule/lib/schedule-rules'
import { ScheduleStatusBadge } from '@/entities/schedule/ui/schedule-status-badge'
import { ScheduleEditor } from '@/widgets/schedule-editor'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { Skeleton } from '@/shared/ui/skeleton'
import { getISOWeekId, shiftWeek, getWeekRange } from '@/shared/lib/week-utils'
import { fmtDate, fmtHours } from '@/shared/lib/format-utils'
import type { Schedule } from '@/entities/schedule/model/schedule-types'
import { uid } from '@/shared/lib/id-utils'

export function SchedulePage() {
  useOperationsInit()
  const loading = useOperationsStore((s) => s.loading)
  const schedules = useOperationsStore((s) => s.schedules)
  const projects = useOperationsStore((s) => s.projects)
  const saveEmployeeSchedules = useOperationsStore((s) => s.saveEmployeeSchedules)
  const toggleFavorite = useOperationsStore((s) => s.toggleFavorite)
  const previewUserId = useOperationsStore((s) => s.previewUserId)
  const setPreviewUserId = useOperationsStore((s) => s.setPreviewUserId)
  const user = useCurrentWorkUser()
  const isManager = useIsManager()

  const [weekId, setWeekId] = useState(getISOWeekId(new Date()))
  const [editMode, setEditMode] = useState<'plan' | 'actual' | null>(null)

  const opsProjects = useMemo(() => getOpsProjects(projects), [projects])

  const mySchedules = useMemo(
    () => (user ? schedules.filter((s) => s.employeeId === user.id) : []),
    [schedules, user],
  )

  const planSch = mySchedules.find((s) => s.weekId === weekId && s.type === 'plan')
  const actualSch = mySchedules.find((s) => s.weekId === weekId && s.type === 'actual')

  const alerts = useMemo(() => {
    if (!user) return []
    const items: string[] = []
    const cur = getISOWeekId(new Date())
    if (!schedules.find((s) => s.employeeId === user.id && s.weekId === cur && s.type === 'plan' && s.status !== 'draft'))
      items.push('이번 주 계획을 제출해 주세요.')
    const prev = shiftWeek(cur, -1)
    const prevActual = schedules.find(
      (s) => s.employeeId === user.id && s.weekId === prev && s.type === 'actual',
    )
    if (prevActual && prevActual.status !== 'confirmed')
      items.push('지난주 실적을 확정해 주세요.')
    const rejected = schedules.filter((s) => s.employeeId === user.id && s.status === 'rejected')
    if (rejected.length) items.push(`반려된 제출 ${rejected.length}건이 있습니다.`)
    return items
  }, [schedules, user])

  const handleSave = (sch: Schedule) => {
    const others = schedules.filter((s) => s.id !== sch.id)
    saveEmployeeSchedules([...others, sch])
    setEditMode(null)
  }

  const handleStartActualFromPlan = () => {
    if (!user || !planSch) return
    const newActual: Schedule = {
      id: actualSch?.id ?? uid('s_'),
      employeeId: user.id,
      weekId,
      type: 'actual',
      status: 'draft',
      tasks: clonePlanTasksForActual(planSch.tasks),
      submittedAt: null,
      reviewedAt: null,
      employeeComment: '',
      reviewerComment: '',
    }
    handleSave(newActual)
    setEditMode('actual')
  }

  const handleDelete = (sch: Schedule) => {
    if (!canDeleteSchedule(sch)) return
    saveEmployeeSchedules(schedules.filter((s) => s.id !== sch.id))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!user) {
    return <EmptyState title="사용자 없음" description="로그인 후 이용해 주세요." />
  }

  const { start, end } = getWeekRange(weekId)
  const ending = getEndingAssignments(opsProjects, user.id)

  if (editMode) {
    const existing = editMode === 'plan' ? planSch : actualSch
    return (
      <div className="space-y-4">
        <PageHeader
          title={editMode === 'plan' ? '주간 계획 편집' : '주간 실적 편집'}
          description={`${weekId} · ${fmtDate(start)} ~ ${fmtDate(end)}`}
        />
        <ScheduleEditor
          user={user}
          weekId={weekId}
          mode={editMode}
          projects={opsProjects}
          existing={existing}
          onSave={handleSave}
          onToggleFavorite={(pid) => toggleFavorite(user.id, pid)}
          onCancel={() => setEditMode(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {previewUserId && isManager && (
        <div className="flex items-center justify-between rounded-lg border border-warning/40 bg-warning-muted px-4 py-2 text-sm">
          <span>관리자 프리뷰 모드</span>
          <Button variant="outline" size="sm" onClick={() => setPreviewUserId(null)}>
            종료
          </Button>
        </div>
      )}

      <PageHeader title="내 주간 업무" description="주간 계획과 실적을 관리합니다." />

      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setWeekId(shiftWeek(weekId, -1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <div className="font-semibold">{weekId}</div>
          <div className="text-sm text-muted-foreground">
            {fmtDate(start)} ~ {fmtDate(end)}
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => setWeekId(shiftWeek(weekId, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {alerts.map((msg) => (
        <div key={msg} className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning-muted px-4 py-2 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {msg}
        </div>
      ))}

      <div className="grid gap-4 md:grid-cols-2">
        <ScheduleHeroCard
          title="주간 계획"
          schedule={planSch}
          onEdit={() => setEditMode('plan')}
          onDelete={planSch ? () => handleDelete(planSch) : undefined}
        />
        <ScheduleHeroCard
          title="주간 실적"
          schedule={actualSch}
          onEdit={() => setEditMode('actual')}
          onDelete={actualSch ? () => handleDelete(actualSch) : undefined}
          extraAction={
            planSch?.status === 'approved' && !actualSch ? (
              <Button variant="outline" size="sm" onClick={handleStartActualFromPlan}>
                승인된 계획에서 복제
              </Button>
            ) : null
          }
        />
      </div>

      {ending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">곧 종료되는 할당</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ending.map(({ project, assignment }) => (
              <div key={assignment.id} className="text-sm">
                {project.clientName} · {project.projectName} — {assignment.endDate}까지
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <section className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">최근 제출 내역</h3>
        <div className="space-y-2">
          {mySchedules
            .filter((s) => s.status !== 'draft')
            .sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''))
            .slice(0, 12)
            .map((s) => (
              <button
                key={s.id}
                type="button"
                className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left hover:bg-accent/50"
                onClick={() => {
                  setWeekId(s.weekId)
                  setEditMode(s.type)
                }}
              >
                <span>
                  {s.weekId} · {s.type === 'plan' ? '계획' : '실적'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {fmtHours(s.tasks.reduce((a, t) => a + Number(t.hours), 0))}
                  </span>
                  <ScheduleStatusBadge status={s.status} />
                </div>
              </button>
            ))}
        </div>
      </section>
    </div>
  )
}

function ScheduleHeroCard({
  title,
  schedule,
  onEdit,
  onDelete,
  extraAction,
}: {
  title: string
  schedule?: Schedule
  onEdit: () => void
  onDelete?: () => void
  extraAction?: React.ReactNode
}) {
  const hours = schedule?.tasks?.reduce((a, t) => a + Number(t.hours), 0) ?? 0
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        {schedule && <ScheduleStatusBadge status={schedule.status} />}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-semibold">{fmtHours(hours)}</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onEdit}>
            {schedule ? '편집' : '작성'}
          </Button>
          {onDelete && (
            <Button variant="outline" size="sm" onClick={onDelete}>
              삭제
            </Button>
          )}
          {extraAction}
        </div>
      </CardContent>
    </Card>
  )
}
