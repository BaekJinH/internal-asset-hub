import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Project } from '@/entities/project/model/project-types'
import type { JobType } from '@/entities/project/model/project-types'
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
import {
  projectOpsFormSchema,
  type ProjectOpsFormValues,
} from '@/features/project-ops-form/model/project-ops-form-schema'
import {
  mergeProjectOpsFormValues,
  toProjectOpsFormValues,
} from '@/features/project-ops-form/model/project-ops-form-mapper'

interface ProjectOpsFormProps {
  project: Project
  onSave: (project: Project) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ProjectOpsForm({ project, onSave, onCancel, isSubmitting = false }: ProjectOpsFormProps) {
  const members = mockUsers.filter((u) => u.roleId === ROLE_IDS.MEMBER)

  const form = useForm<ProjectOpsFormValues>({
    resolver: zodResolver(projectOpsFormSchema),
    defaultValues: toProjectOpsFormValues(project),
  })

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'operations.assignments',
  })

  const addAssignment = () => {
    const ops = form.getValues('operations')
    append({
      id: uid('a_'),
      employeeId: members[0]?.id ?? '',
      jobType: 'planning',
      startDate: ops.startDate,
      endDate: ops.endDate,
      allocation: 0.5,
    })
  }

  const updateAssignment = (index: number, patch: Partial<ProjectOpsFormValues['operations']['assignments'][number]>) => {
    const current = fields[index]
    if (!current) return

    const next = { ...current, ...patch }
    const assignments = form.getValues('operations.assignments').map((item, i) =>
      i === index ? next : item,
    )

    if (hasOverlappingAssignment(assignments, next, next.id)) {
      toast.error('겹치는 할당이 있습니다')
      return
    }

    update(index, next)
  }

  const onSubmit = (values: ProjectOpsFormValues) => {
    for (const assignment of values.operations.assignments) {
      if (
        hasOverlappingAssignment(values.operations.assignments, assignment, assignment.id)
      ) {
        toast.error('겹치는 할당이 있습니다')
        return
      }
    }

    onSave(mergeProjectOpsFormValues(project, values))
  }

  const opsErrors = form.formState.errors.operations

  return (
    <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="project-name">프로젝트명</Label>
        <Input id="project-name" {...form.register('name')} aria-invalid={Boolean(form.formState.errors.name)} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="project-description">설명</Label>
        <Input id="project-description" {...form.register('description')} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="project-owner">담당자</Label>
        <Input id="project-owner" {...form.register('owner')} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>상태</Label>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
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
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="client-name">클라이언트</Label>
        <Input id="client-name" {...form.register('operations.clientName')} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="start-date">시작일</Label>
          <Input id="start-date" type="date" {...form.register('operations.startDate')} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="end-date">종료일</Label>
          <Input id="end-date" type="date" {...form.register('operations.endDate')} />
        </div>
      </div>

      <FinancialGate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contract-amount">계약 금액</Label>
          <Input
            id="contract-amount"
            type="number"
            {...form.register('operations.contractAmount', { valueAsNumber: true })}
          />
        </div>
      </FinancialGate>

      <FinancialGate>
        <div className="flex flex-col gap-2">
          <Label className="font-medium">계약 MD</Label>
          {JOB_TYPES.map((j) => (
            <div key={j.id} className="flex items-center gap-2">
              <span className="w-16 text-sm">{j.name}</span>
              <Input
                type="number"
                className="flex-1"
                {...form.register(`operations.contractMDs.${j.id as JobType}`, { valueAsNumber: true })}
              />
            </div>
          ))}
        </div>
      </FinancialGate>

      <FinancialGate>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="font-medium">할당</Label>
            <Button type="button" variant="outline" size="sm" onClick={addAssignment}>
              추가
            </Button>
          </div>
          {opsErrors?.assignments?.message ? (
            <p className="text-sm text-destructive">{opsErrors.assignments.message}</p>
          ) : null}
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2 rounded-lg border p-3">
              <Controller
                control={form.control}
                name={`operations.assignments.${index}.employeeId`}
                render={({ field: employeeField }) => (
                  <Select value={employeeField.value} onValueChange={employeeField.onChange}>
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
                )}
              />
              <Controller
                control={form.control}
                name={`operations.assignments.${index}.jobType`}
                render={({ field: jobField }) => (
                  <Select
                    value={jobField.value}
                    onValueChange={(value) => updateAssignment(index, { jobType: value as JobType })}
                  >
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
                )}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  {...form.register(`operations.assignments.${index}.startDate`)}
                  onChange={(e) => updateAssignment(index, { startDate: e.target.value })}
                />
                <Input
                  type="date"
                  {...form.register(`operations.assignments.${index}.endDate`)}
                  onChange={(e) => updateAssignment(index, { endDate: e.target.value })}
                />
              </div>
              <Controller
                control={form.control}
                name={`operations.assignments.${index}.allocation`}
                render={({ field: allocationField }) => (
                  <Select
                    value={String(allocationField.value)}
                    onValueChange={(value) => updateAssignment(index, { allocation: Number(value) })}
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
                )}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                삭제
              </Button>
            </div>
          ))}
        </div>
      </FinancialGate>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          저장
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
      </div>
    </form>
  )
}
