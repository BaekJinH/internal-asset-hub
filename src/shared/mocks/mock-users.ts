import { ROLE_IDS } from '@/entities/role/model/role-types'
import type { User } from '@/entities/user/model/user-types'
import { TEAM_IDS } from '@/shared/mocks/mock-org-structure'

export const mockUsers: User[] = [
  {
    id: 'u-001',
    name: '최준연',
    email: 'zunion@tinto.co.kr',
    jobTitle: '대표',
    teamId: TEAM_IDS.EXECUTIVE,
    roleId: ROLE_IDS.MASTER,
    department: '경영',
  },
  {
    id: 'u-002',
    name: '최지니',
    email: 'jinnychoi@tinto.co.kr',
    jobTitle: '이사',
    teamId: TEAM_IDS.EXECUTIVE,
    roleId: ROLE_IDS.MASTER,
    department: '경영',
  },
  {
    id: 'u-003',
    name: '유지아',
    email: 'yja201109@tinto.co.kr',
    jobTitle: '본부장',
    teamId: TEAM_IDS.EXECUTIVE,
    roleId: ROLE_IDS.MASTER,
    department: '전략팀',
  },
  {
    id: 'u-004',
    name: '장가영',
    email: 'yeong_2@tinto.co.kr',
    jobTitle: 'UX팀장',
    teamId: TEAM_IDS.UX,
    roleId: ROLE_IDS.MEMBER,
    department: '디자인2팀',
  },
  {
    id: 'u-005',
    name: '허승',
    email: 'umain9436@tinto.co.kr',
    jobTitle: 'Lead Designer',
    teamId: TEAM_IDS.UX,
    roleId: ROLE_IDS.MASTER,
    department: '디자인3팀',
  },
  {
    id: 'u-006',
    name: '김성재',
    email: 'nuc@tinto.co.kr',
    jobTitle: 'Lead Planner',
    teamId: TEAM_IDS.UX,
    roleId: ROLE_IDS.MEMBER,
    department: '기획팀',
  },
  {
    id: 'u-007',
    name: '박새임',
    email: 'parksaeim92@tinto.co.kr',
    jobTitle: 'Designer',
    teamId: TEAM_IDS.UX,
    roleId: ROLE_IDS.MEMBER,
    department: '디자인3팀',
  },
  {
    id: 'u-008',
    name: '이가원',
    email: '0915lgw@tinto.co.kr',
    jobTitle: 'Designer',
    teamId: TEAM_IDS.UX,
    roleId: ROLE_IDS.MEMBER,
    department: '디자인2팀',
  },
  {
    id: 'u-009',
    name: '이건희',
    email: '2kunhee94@tinto.co.kr',
    jobTitle: '팀장',
    teamId: TEAM_IDS.DEV,
    roleId: ROLE_IDS.MASTER,
    department: '개발팀',
  },
  {
    id: 'u-010',
    name: '윤진영',
    email: 'wls6482@tinto.co.kr',
    jobTitle: 'Lead Publisher',
    teamId: TEAM_IDS.DEV,
    roleId: ROLE_IDS.MEMBER,
    department: '개발팀',
  },
  {
    id: 'u-011',
    name: '최은영',
    email: 'eychoi@tinto.co.kr',
    jobTitle: 'Lead Publisher',
    teamId: TEAM_IDS.DEV,
    roleId: ROLE_IDS.MEMBER,
    department: '개발팀',
  },
  {
    id: 'u-012',
    name: '황범진',
    email: 'praise159@tinto.co.kr',
    jobTitle: 'Lead B/E Developer',
    teamId: TEAM_IDS.DEV,
    roleId: ROLE_IDS.MEMBER,
    department: '개발팀',
  },
  {
    id: 'u-013',
    name: '최지원',
    email: 'jiwon94k@tinto.co.kr',
    jobTitle: 'F/E Developer',
    teamId: TEAM_IDS.DEV,
    roleId: ROLE_IDS.MEMBER,
    department: '개발팀',
  },
  {
    id: 'u-014',
    name: '백진혁',
    email: 'bjh1234@tinto.co.kr',
    jobTitle: 'Publisher',
    teamId: TEAM_IDS.DEV,
    roleId: ROLE_IDS.MEMBER,
    department: '개발팀',
  },
  {
    id: 'u-015',
    name: '강동호',
    email: 'donghooridge@tinto.co.kr',
    jobTitle: 'Publisher',
    teamId: TEAM_IDS.DEV,
    roleId: ROLE_IDS.MEMBER,
    department: '개발팀',
  },
]

export function getUserById(userId: string): User | undefined {
  return mockUsers.find((user) => user.id === userId)
}

export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

const EXCLUDED_OPERATIONS_TEAM_JOB_TITLES = new Set(['대표', '이사'])

/** 운영 설정 팀원 목록: 대표·이사 제외 전체 */
export function getOperationsTeamMembers(): User[] {
  return mockUsers.filter((user) => !EXCLUDED_OPERATIONS_TEAM_JOB_TITLES.has(user.jobTitle))
}
