import type { Assignment } from '@/entities/assignment/model/assignment-types'

export type ProjectStatus = 'active' | 'completed' | 'paused' | 'internal' | 'cancelled'

/** 프로젝트 목록 팀(카테고리) 탭 */
export type ProjectTeamCategory = 'dev' | 'publishing' | 'design'

export type JobType = 'planning' | 'design' | 'publishing' | 'dev'

export interface ProjectLinks {
  figma?: string
  github?: string
  notion?: string
  deployUrl?: string
}

export interface ProjectExternalIds {
  notionPageId?: string
  githubRepoFullName?: string
  figmaFileKey?: string
}

export interface ProjectSyncMeta {
  notionLinked: boolean
  githubLinked: boolean
  figmaLinked?: boolean
  lastSyncedAt?: string
  syncSource?: 'manual' | 'github' | 'notion' | 'link' | 'figma'
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
  externalIds?: ProjectExternalIds
  syncMeta?: ProjectSyncMeta
  /** 프로젝트 목록 팀 탭 (개발/퍼블리싱/UX) */
  teamCategory?: ProjectTeamCategory
  operations?: ProjectOperations
}
