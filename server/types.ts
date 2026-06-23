export type ProjectStatus = 'active' | 'completed' | 'paused' | 'internal' | 'cancelled'

export type ProjectTeamCategory = 'dev' | 'publishing' | 'design'

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
  teamCategory?: ProjectTeamCategory
  operations?: Record<string, unknown>
}

export interface NotionVerifyResult {
  ok: boolean
  integrationName?: string
  databaseTitle?: string
  propertyNames?: string[]
  rowCount?: number
  sampleRow?: {
    pageId: string
    title: string
    githubRepoUrl?: string
    notionUrl: string
  }
  error?: string
  step?: string
}

export interface NotionProjectRow {
  pageId: string
  title: string
  notionUrl: string
  githubRepoUrl?: string
}

export interface GitHubRepoPreview {
  id: number
  fullName: string
  name: string
  description: string | null
  htmlUrl: string
  pushedAt: string
  archived: boolean
}

export interface GitHubSyncResult {
  created: number
  updated: number
  skipped: number
  projects: Project[]
}

export interface LinkProjectsResult {
  matched: number
  updated: number
  unmatchedNotion: number
  unmatchedGithub: number
  projects: Project[]
}

export type AssetCategory =
  | 'planning'
  | 'design'
  | 'development'
  | 'meeting'
  | 'media'
  | 'ai-output'
  | 'delivery'

export type AssetStatus = 'draft' | 'review' | 'confirmed' | 'archived' | 'discarded'

export interface AssetExternalIds {
  figmaFileKey?: string
}

export interface AssetSyncMeta {
  lastSyncedAt?: string
}

export interface Asset {
  id: string
  name: string
  projectId: string
  projectName: string
  category: AssetCategory
  status: AssetStatus
  owner: string
  tags: string[]
  filePath?: string
  externalUrl?: string
  fileSize?: string
  extension?: string
  description: string
  createdAt: string
  updatedAt: string
  relatedAssetIds: string[]
  externalIds?: AssetExternalIds
  syncSource?: 'manual' | 'figma'
  syncMeta?: AssetSyncMeta
  thumbnailUrl?: string
}

export interface FigmaFilePreview {
  fileKey: string
  name: string
  lastTouchedAt?: string
  thumbnailUrl?: string
  creatorHandle?: string
}

export interface FigmaVerifyResult {
  ok: boolean
  mode: 'meta' | 'token_only' | 'team'
  fileKey?: string
  file?: FigmaFilePreview
  teamId?: string
  fileCount?: number
  projectCount?: number
  files?: FigmaTeamFile[]
  activeDays?: number
  error?: string
  warning?: string
}

export interface FigmaImportResult {
  action: 'created' | 'updated'
  fileKey: string
  asset: Asset
  project: Project
}

export interface FigmaLinkResult {
  project: Project
  fileKey: string
  validated: boolean
  meta?: Pick<FigmaFilePreview, 'name' | 'lastTouchedAt'>
}

export interface FigmaTeamFile {
  fileKey: string
  name: string
  figmaProjectId: string
  figmaProjectName: string
  lastModified?: string
  thumbnailUrl?: string
  htmlUrl: string
}

export interface FigmaSyncResult {
  created: number
  updated: number
  skipped: number
  assetsCreated: number
  assetsUpdated: number
  projects: Project[]
  teamId: string
  fileCount: number
  activeDays: number
}
