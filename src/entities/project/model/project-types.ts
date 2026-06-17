import type { Assignment } from '@/entities/assignment/model/assignment-types'

export type ProjectStatus = 'active' | 'completed' | 'paused' | 'internal' | 'cancelled'

export type JobType = 'planning' | 'design' | 'publishing' | 'dev'

export interface ProjectLinks {
  figma?: string
  github?: string
  notion?: string
  deployUrl?: string
}

export interface ProjectOperations {
  clientName: string
  startDate: string
  endDate: string
  contractAmount: number
  contractMDs: Record<JobType, number>
  contractRates: Record<JobType, number>
  assignments: Assignment[]
  legacy?: boolean
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  owner: string
  assetCount: number
  updatedAt: string
  links: ProjectLinks
  operations?: ProjectOperations
}
