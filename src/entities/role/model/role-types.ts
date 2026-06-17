export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  PROJECTS_VIEW: 'projects.view',
  PROJECTS_CREATE: 'projects.create',
  ASSETS_VIEW: 'assets.view',
  ASSETS_CREATE: 'assets.create',
  SEARCH_VIEW: 'search.view',
  AI_VIEW: 'ai.view',
  SETTINGS_VIEW: 'settings.view',
  ACCESS_CONTROL_VIEW: 'access-control.view',
  ACCESS_CONTROL_MANAGE: 'access-control.manage',
  SCHEDULE_VIEW: 'schedule.view',
  SCHEDULE_MANAGE: 'schedule.manage',
  OPERATIONS_VIEW: 'operations.view',
  OPERATIONS_MANAGE: 'operations.manage',
  FINANCIAL_VIEW: 'financial.view',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export interface Role {
  id: string
  name: string
  label: string
  permissions: Permission[]
}

export const ROLE_IDS = {
  MASTER: 'role-master',
  MEMBER: 'role-member',
} as const

export type RoleId = (typeof ROLE_IDS)[keyof typeof ROLE_IDS]

export const PERMISSION_LABELS: Record<Permission, string> = {
  'dashboard.view': '대시보드 조회',
  'projects.view': '프로젝트 조회',
  'projects.create': '프로젝트 생성',
  'assets.view': '자산 조회',
  'assets.create': '자산 등록',
  'search.view': '통합 검색',
  'ai.view': 'AI 확장',
  'settings.view': '설정',
  'access-control.view': '접근 제어 조회',
  'access-control.manage': '접근 제어 관리',
  'schedule.view': '주간 업무 조회',
  'schedule.manage': '주간 업무 관리',
  'operations.view': '운영 조회',
  'operations.manage': '운영 관리',
  'financial.view': '재무 정보 조회',
}
