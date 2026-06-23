import type { Project } from '@/entities/project/model/project-types'
import type { ProjectOpsFormValues } from '@/features/project-ops-form/model/project-ops-form-schema'

const emptyMDs = () => ({
  planning: 0,
  design: 0,
  publishing: 0,
  dev: 0,
})

const DEFAULT_END_DATE = '2026-09-30'

export function toProjectOpsFormValues(project: Project): ProjectOpsFormValues {
  return {
    name: project.name,
    description: project.description,
    owner: project.owner,
    status: project.status,
    teamCategory: project.teamCategory,
    operations: project.operations ?? {
      clientName: '',
      startDate: '2026-01-01',
      endDate: DEFAULT_END_DATE,
      contractAmount: 0,
      contractMDs: emptyMDs(),
      contractRates: emptyMDs(),
      assignments: [],
    },
  }
}

export function mergeProjectOpsFormValues(project: Project, values: ProjectOpsFormValues): Project {
  return {
    ...project,
    name: values.name,
    description: values.description,
    owner: values.owner,
    status: values.status,
    teamCategory: values.teamCategory ?? project.teamCategory,
    operations: values.operations,
  }
}
