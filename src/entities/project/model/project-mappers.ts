import { PROJECT_STATUS_LABELS } from '@/entities/project/model/project-constants'
import type { ProjectStatus } from '@/entities/project/model/project-types'

export function getProjectStatusLabel(status: ProjectStatus) {
  return PROJECT_STATUS_LABELS[status]
}
