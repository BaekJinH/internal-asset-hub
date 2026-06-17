import type { JobType } from '@/entities/project/model/project-types'

export type ScheduleType = 'plan' | 'actual'

export type ScheduleStatus = 'draft' | 'submitted' | 'approved' | 'confirmed' | 'rejected'

export interface ScheduleTask {
  date: string
  projectId: string
  jobType: JobType
  hours: number
  costSnapshot?: number
  rateSnapshot?: number
}

export interface Schedule {
  id: string
  employeeId: string
  weekId: string
  type: ScheduleType
  status: ScheduleStatus
  tasks: ScheduleTask[]
  submittedAt: string | null
  reviewedAt: string | null
  employeeComment: string
  reviewerComment: string
}
