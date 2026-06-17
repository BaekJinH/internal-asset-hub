export type ProjectStatus = 'active' | 'completed' | 'paused' | 'internal'

export interface ProjectLinks {
  figma?: string
  github?: string
  notion?: string
  deployUrl?: string
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
}
