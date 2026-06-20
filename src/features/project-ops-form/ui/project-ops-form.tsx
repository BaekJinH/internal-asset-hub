import { useState } from 'react'
import type { Project, JobType, ProjectStatus } from '@/entities/project/model/project-types'
import type { Assignment } from '@/entities/assignment/model/assignment-types'
import { hasOverlappingAssignment } from '@/entities/schedule/lib/schedule-rules'
import { JOB_TYPES, ALLOCATION_OPTIONS } from '@/shared/constants/workboard'
import { uid } from '@/shared/lib/id-utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { mockUsers } from '@/shared/mocks/mock-users'
import { ROLE_IDS } from '@/entities/role/model/role-types'
import { toast } from 'sonner'
import { FinancialGate } from '@/features/auth/ui/financial-gate'

interface ProjectOpsFormProps {
  project: Project
  onSave: (project: Project) => void
  onCancel: () => void
}

const emptyMDs = (): Record<JobType, number> => ({
  planning: 0,
  design: 0,
  publishing: 0,
  dev: 0,
})

const DEFAULT_END_DATE = '2026-09-30'

export function ProjectOpsForm({ project, onSave, onCancel }: ProjectOpsFormProps) {
  const [form, setForm] = useState<Project>({
    ...project,
    operations: project.operations ?? {
      clientName: '',
      startDate: '2026-01-01',
      endDate: DEFAULT_END_DATE,
      contractAmount: 0,
      contractMDs: emptyMDs(),
      contractRates: emptyMDs(),
      assignments: [],
    },
  })

  const ops = form.operations!
  const members = mockUsers.filter((u) => u.roleId === ROLE_IDS.MEMBER)

  const updateOps = (patch: Partial<typeof ops>) => {
    setForm({ ...form, operations: { ...ops, ...patch } })
  }

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('프로젝트명을 입력해 주세요')
      return
    }
    onSave(form)
  }

  const addAssignment = () => {
    const candidate: Assignment = {
      id: uid('a_'),
      employeeId: members[0]?.id ?? '',
      jobType: 'planning',
      startDate: ops.startDate,
      endDate: ops.endDate,
      allocation: 0.5,
    }
    updateOps({ assignments: [...ops.assignments, candidate] })
  }

  const updateAssignment = (id: string, patch: Partial<Assignment>) => {
    const updated = ops.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a))
    const candidate = updated.find((a) => a.id === id)!
    if (hasOverlappingAssignment(updated, candidate, id)) {
      toast.error('겹치는 할당이 있습니다')
      return
    }
    updateOps({ assignments: updated })
  }

  const removeAssignment = (id: string) => {
    updateOps({ assignments: ops.assignments.filter((a) => a.id !== id) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>프로젝트명</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>설명</Label>
        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>담당자</Label>
        <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>상태</Label>
        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">진행중</SelectItem>
            <SelectItem value="paused">보류</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="cancelled">취소</SelectItem>
            <SelectItem value="internal">내부</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>클라이언트</Label>
        <Input value={ops.clientName} onChange={(e) => updateOps({ clientName: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>시작일</Label>
          <Input type="date" value={ops.startDate} onChange={(e) => updateOps({ startDate: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>종료일</Label>
          <Input type="date" value={ops.endDate} onChange={(e) => updateOps({ endDate: e.target.value })} />
        </div>
      </div>
      <FinancialGate>
        <div className="space-y-2">
          <Label>계약 금액</Label>
          <Input
            type="number"
            value={ops.contractAmount}
            onChange={(e) => updateOps({ contractAmount: Number(e.target.value) })}
          />
        </div>
      </FinancialGate>

      <FinancialGate>
        <div className="space-y-2">
          <Label className="font-medium">계약 MD</Label>
          {JOB_TYPES.map((j) => (
            <div key={j.id} className="flex items-center gap-2">
              <span className="w-16 text-sm">{j.name}</span>
              <Input
                type="number"
                className="flex-1"
                value={ops.contractMDs[j.id]}
                onChange={(e) =>
                  updateOps({ contractMDs: { ...ops.contractMDs, [j.id]: Number(e.target.value) } })
                }
              />
            </div>
          ))}
        </div>
      </FinancialGate>

      <FinancialGate>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="font-medium">할당</Label>
          <Button type="button" variant="outline" size="sm" onClick={addAssignment}>
            추가
          </Button>
        </div>
        {ops.assignments.map((a) => (
          <div key={a.id} className="space-y-2 rounded-lg border p-3">
            <Select value={a.employeeId} onValueChange={(v) => updateAssignment(a.id, { employeeId: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={a.jobType} onValueChange={(v) => updateAssignment(a.id, { jobType: v as JobType })}>
              <SelectTrigger>
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
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={a.startDate} onChange={(e) => updateAssignment(a.id, { startDate: e.target.value })} />
              <Input type="date" value={a.endDate} onChange={(e) => updateAssignment(a.id, { endDate: e.target.value })} />
            </div>
            <Select
              value={String(a.allocation)}
              onValueChange={(v) => updateAssignment(a.id, { allocation: Number(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALLOCATION_OPTIONS.map((o) => (
                  <SelectItem key={o} value={String(o)}>
                    {o * 100}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeAssignment(a.id)}>
              삭제
            </Button>
          </div>
        ))}
      </div>
      </FinancialGate>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit}>저장</Button>
        <Button variant="outline" onClick={onCancel}>
          취소
        </Button>
      </div>
    </div>
  )
}
