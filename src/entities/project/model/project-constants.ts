import type { ProjectStatus, ProjectTeamCategory } from '@/entities/project/model/project-types'

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: '진행중',
  completed: '완료',
  paused: '보류',
  internal: '내부 프로젝트',
  cancelled: '취소',
}

export const PROJECT_TEAM_LABELS: Record<ProjectTeamCategory, string> = {
  dev: '개발팀',
  publishing: '퍼블리싱팀',
  design: 'UX팀',
}

export const PROJECT_TEAM_TABS: ProjectTeamCategory[] = ['dev', 'publishing', 'design']
