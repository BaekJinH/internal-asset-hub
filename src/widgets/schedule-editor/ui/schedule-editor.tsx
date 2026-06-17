import { useState } from 'react'
import { Plus, Star, Trash2 } from 'lucide-react'
import type { OpsProjectView } from '@/entities/project/lib/project-ops-adapter'
import type { WorkUser } from '@/entities/project/lib/project-ops-adapter'
import type { Schedule, ScheduleTask } from '@/entities/schedule/model/schedule-types'
import { getProjectsForDate } from '@/entities/schedule/lib/schedule-rules'
import { JobTypeBadge } from '@/entities/schedule/ui/job-type-badge'
import { JOB_TYPES } from '@/shared/constants/workboard'
import { fmtMD_short, dayOfWeekKR } from '@/shared/lib/format-utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { getWeekDates } from '@/shared/lib/week-utils'
import { uid } from '@/shared/lib/id-utils'

export interface TaskDraft {
  date: string
  projectId: string
  jobType: ScheduleTask['jobType']
  hours: number | string
}

interface ScheduleEditorProps {
  user: WorkUser
  weekId: string
  mode: 'plan' | 'actual'
  projects: OpsProjectView[]
  existing?: Schedule
  onSave: (schedule: Schedule) => void
  onToggleFavorite: (projectId: string) => void
  onCancel: () => void
}

export function ScheduleEditor({
  user,
  weekId,
  mode,
  projects,
  existing,
  onSave,
  onToggleFavorite,
  onCancel,
}: ScheduleEditorProps) {
  const weekDates = getWeekDates(weekId)
  const [showWeekend, setShowWeekend] = useState(false)
  const [comment, setComment] = useState(existing?.employeeComment ?? '')
  const [tasks, setTasks] = useState<TaskDraft[]>(
    existing?.tasks?.map((t) => ({ ...t })) ?? [],
  )
  const [activeDate, setActiveDate] = useState(weekDates[0])

  const visibleDates = showWeekend ? weekDates : weekDates.slice(0, 5)
  const readonly = existing?.status === 'approved' || existing?.status === 'confirmed'

  const validTasks = tasks.filter(
    (t) => t.projectId && t.jobType && Number(t.hours) > 0 && t.date,
  )
  const canSubmit =
    validTasks.length > 0 &&
    tasks.every((t) => t.projectId && t.jobType && Number(t.hours) > 0 && t.date)

  const handleSave = (status: Schedule['status']) => {
    const cleanTasks = validTasks.map((t) => ({
      date: t.date,
      projectId: t.projectId,
      jobType: t.jobType,
      hours: Number(t.hours),
    }))
    onSave({
      id: existing?.id ?? uid('s_'),
      employeeId: user.id,
      weekId,
      type: mode,
      tasks: cleanTasks,
      status,
      submittedAt: status === 'submitted' ? new Date().toISOString() : existing?.submittedAt ?? null,
      reviewedAt: null,
      employeeComment: comment,
      reviewerComment:
        status === 'submitted' && existing?.status === 'rejected'
          ? ''
          : existing?.reviewerComment ?? '',
    })
  }

  const dayTasks = tasks
    .map((t, i) => ({ ...t, _idx: i }))
    .filter((t) => t.date === activeDate)
  const dayProjects = getProjectsForDate(projects, user, activeDate)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          닫기
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowWeekend((v) => !v)}>
            {showWeekend ? '주말 숨기기' : '주말 표시'}
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {visibleDates.map((date) => (
          <Button
            key={date}
            variant={activeDate === date ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveDate(date)}
          >
            {fmtMD_short(date)} ({dayOfWeekKR(date)})
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {fmtMD_short(activeDate)} ({dayOfWeekKR(activeDate)})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dayTasks.map((task) => (
            <TaskRow
              key={task._idx}
              task={task}
              projects={dayProjects}
              readonly={readonly}
              onChange={(patch) =>
                setTasks((prev) =>
                  prev.map((t, i) => (i === task._idx ? { ...t, ...patch } : t)),
                )
              }
              onRemove={() => setTasks((prev) => prev.filter((_, i) => i !== task._idx))}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
          {!readonly && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                setTasks((prev) => [
                  ...prev,
                  { date: activeDate, projectId: '', jobType: user.jobType, hours: '' },
                ])
              }
            >
              <Plus className="mr-2 h-4 w-4" /> 업무 추가
            </Button>
          )}
        </CardContent>
      </Card>

      {!readonly && (
        <div className="space-y-2">
          <label className="text-sm font-medium">코멘트</label>
          <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="선택 사항" />
        </div>
      )}

      {!readonly && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')}>
            임시 저장
          </Button>
          <Button disabled={!canSubmit} onClick={() => handleSave('submitted')}>
            제출
          </Button>
        </div>
      )}
    </div>
  )
}

function TaskRow({
  task,
  projects,
  readonly,
  onChange,
  onRemove,
  onToggleFavorite,
}: {
  task: TaskDraft & { _idx?: number }
  projects: OpsProjectView[]
  readonly: boolean
  onChange: (patch: Partial<TaskDraft>) => void
  onRemove: () => void
  onToggleFavorite: (projectId: string) => void
}) {
  return (
    <div className="grid gap-2 rounded-lg border p-3 md:grid-cols-[1fr_auto_auto_auto]">
      <Select
        value={task.projectId}
        onValueChange={(v) => onChange({ projectId: v })}
        disabled={readonly}
      >
        <SelectTrigger>
          <SelectValue placeholder="프로젝트 선택" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-yellow-500"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onToggleFavorite(p.id)
                  }}
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                {p.clientName} · {p.projectName}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={task.jobType}
        onValueChange={(v) => onChange({ jobType: v as ScheduleTask['jobType'] })}
        disabled={readonly}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {JOB_TYPES.map((j) => (
            <SelectItem key={j.id} value={j.id}>
              {j.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        className="w-20"
        value={task.hours}
        onChange={(e) => onChange({ hours: e.target.value })}
        disabled={readonly}
        min={0}
        step={0.5}
      />
      {!readonly && (
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {task.jobType && <JobTypeBadge jobType={task.jobType} className="md:hidden" />}
    </div>
  )
}