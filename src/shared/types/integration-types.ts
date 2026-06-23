export interface ProjectExternalIds {
  notionPageId?: string
  githubRepoFullName?: string
}

export interface ProjectSyncMeta {
  notionLinked: boolean
  githubLinked: boolean
  lastSyncedAt?: string
  syncSource?: 'manual' | 'github' | 'notion' | 'link'
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
  projects: unknown[]
  org?: string
  teamCategory?: 'dev' | 'publishing' | 'design'
  mode?: 'authenticated' | 'public'
  warning?: string
}

export interface GitHubVerifyResult {
  ok: boolean
  org: string
  repoCount: number
  repos: GitHubRepoPreview[]
  mode: 'authenticated' | 'public'
  error?: string
  warning?: string
}

export interface LinkProjectsResult {
  matched: number
  updated: number
  unmatchedNotion: number
  unmatchedGithub: number
  projects: unknown[]
}

export interface IntegrationHealth {
  ok: boolean
  integrations: {
    notion: boolean
    github: boolean
    githubDevelopment?: boolean
    githubPublishing?: boolean
    notionDatabaseId: boolean
    githubOrg: string
    githubOrgPublishing?: string
    githubOrgDesign?: string
    figma?: boolean
    figmaTestFileKey?: boolean
    figmaTeamId?: boolean
    figmaSyncActiveDays?: number
  }
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
  projects: unknown[]
  teamId: string
  fileCount: number
  activeDays: number
}

export interface FigmaSyncOptions {
  teamId?: string
  activeDays?: number
}

export interface FigmaImportResult {
  action: 'created' | 'updated'
  fileKey: string
  asset: import('@/entities/asset/model/asset-types').Asset
  project: import('@/entities/project/model/project-types').Project
}

export interface FigmaLinkResult {
  project: import('@/entities/project/model/project-types').Project
  fileKey: string
  validated: boolean
  meta?: Pick<FigmaFilePreview, 'name' | 'lastTouchedAt'>
}

export interface FigmaImportOptions {
  projectId: string
  figmaUrl: string
}

export interface GithubSyncOptions {
  org?: string
  teamCategory?: 'dev' | 'publishing' | 'design'
}
