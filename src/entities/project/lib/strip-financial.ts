import type { Project, ProjectOperations } from '@/entities/project/model/project-types'

const EMPTY_JOB_RECORD = {
  planning: 0,
  design: 0,
  publishing: 0,
  dev: 0,
} as const

/** 멤버에게 노출하면 안 되는 재무 필드를 제거합니다. */
export function stripFinancialFromOperations(
  operations: ProjectOperations,
): Pick<
  ProjectOperations,
  'clientName' | 'startDate' | 'endDate' | 'assignments' | 'legacy'
> {
  return {
    clientName: operations.clientName,
    startDate: operations.startDate,
    endDate: operations.endDate,
    assignments: operations.assignments,
    legacy: operations.legacy,
  }
}

export function stripFinancialFromProject(project: Project): Project {
  if (!project.operations) return project
  const safe = stripFinancialFromOperations(project.operations)
  return {
    ...project,
    operations: {
      ...safe,
      contractAmount: 0,
      contractMDs: { ...EMPTY_JOB_RECORD },
      contractRates: { ...EMPTY_JOB_RECORD },
    },
  }
}
