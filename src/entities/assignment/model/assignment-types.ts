import type { JobType } from '@/entities/project/model/project-types'

export interface Assignment {
  id: string
  employeeId: string
  jobType: JobType
  startDate: string
  endDate: string
  allocation: number
}
