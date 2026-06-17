import type { ProjectStatus } from '@/entities/project/model/project-types'
import { getProjectStatusLabel } from '@/entities/project/model/project-mappers'
import { Badge } from '@/shared/ui/badge'

const PROJECT_STATUS_TONE_MAP: Record<ProjectStatus, 'success' | 'info' | 'warning' | 'default' | 'danger'> = {
  active: 'success',
  completed: 'info',
  paused: 'warning',
  internal: 'default',
  cancelled: 'danger',
}

interface ProjectStatusBadgeProps {
  status: ProjectStatus
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return <Badge tone={PROJECT_STATUS_TONE_MAP[status]}>{getProjectStatusLabel(status)}</Badge>
}
