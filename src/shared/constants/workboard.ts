import type { JobType } from '@/entities/project/model/project-types'
import type { WorkConfig } from '@/entities/work-config/model/work-config-types'

export const JOB_TYPES: { id: JobType; name: string; color: string }[] = [
  { id: 'planning', name: '기획', color: '#3182F6' },
  { id: 'design', name: '디자인', color: '#FF9500' },
  { id: 'publishing', name: '퍼블리싱', color: '#AF52DE' },
  { id: 'dev', name: '개발', color: '#00C73C' },
]

export const JOB_MAP = Object.fromEntries(JOB_TYPES.map((j) => [j.id, j])) as Record<
  JobType,
  (typeof JOB_TYPES)[number]
>

export const DEFAULT_WORK_CONFIG: WorkConfig = {
  defaultMonthlyCost: 7_500_000,
  workDaysPerMonth: 22,
  hoursPerDay: 8,
  weeklyHours: 40,
}

export const SCHEDULE_STATUS = {
  draft: { label: '임시', tone: 'default' as const },
  submitted: { label: '검토 중', tone: 'warning' as const },
  approved: { label: '승인됨', tone: 'success' as const },
  confirmed: { label: '확정', tone: 'success' as const },
  rejected: { label: '반려', tone: 'danger' as const },
}

export const RISK_LABEL = {
  overrun: 'MD 초과',
  schedule: '일정 위험',
  eac: '원가 초과',
  margin: '이익률 하락',
} as const

export const ALLOCATION_OPTIONS = [0.25, 0.5, 0.75, 1] as const
