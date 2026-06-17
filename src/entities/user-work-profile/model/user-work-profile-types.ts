import type { JobType } from '@/entities/project/model/project-types'

export interface UserWorkProfile {
  userId: string
  jobType: JobType
  monthlyCost: number
  favoriteProjectIds: string[]
}
