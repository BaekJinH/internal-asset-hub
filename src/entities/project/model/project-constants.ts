import type { ProjectStatus } from '@/entities/project/model/project-types'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: '진행중',
  completed: '완료',
  paused: '보류',
  internal: '내부 프로젝트',
}
