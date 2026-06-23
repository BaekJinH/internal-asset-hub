import type {
  GithubSyncOptions,
  GitHubSyncResult,
  GitHubVerifyResult,
  FigmaImportOptions,
  FigmaImportResult,
  FigmaLinkResult,
  FigmaSyncOptions,
  FigmaSyncResult,
  FigmaVerifyResult,
  IntegrationHealth,
  LinkProjectsResult,
  NotionVerifyResult,
} from '@/shared/types/integration-types'

const API_BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })

  const data = (await res.json().catch(() => ({}))) as T & { error?: string }

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `API error ${res.status}`)
  }

  return data
}

export const integrationService = {
  async getHealth(): Promise<IntegrationHealth> {
    return request<IntegrationHealth>('/health')
  },

  async verifyNotion(databaseId?: string): Promise<NotionVerifyResult> {
    return request<NotionVerifyResult>('/integrations/notion/verify', {
      method: 'POST',
      body: JSON.stringify(databaseId ? { databaseId } : {}),
    })
  },

  async verifyGithub(options?: GithubSyncOptions): Promise<GitHubVerifyResult> {
    const params = new URLSearchParams()
    if (options?.org) params.set('org', options.org)
    if (options?.teamCategory) params.set('teamCategory', options.teamCategory)
    const query = params.toString() ? `?${params.toString()}` : ''
    return request<GitHubVerifyResult>(`/integrations/github/verify${query}`)
  },

  async syncGithubProjects(options?: GithubSyncOptions): Promise<GitHubSyncResult> {
    return request<GitHubSyncResult>('/integrations/github/sync-projects', {
      method: 'POST',
      body: JSON.stringify(options ?? {}),
    })
  },

  async linkNotionProjects(): Promise<LinkProjectsResult> {
    return request<LinkProjectsResult>('/integrations/github/link-notion', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  async verifyFigma(options?: FigmaSyncOptions): Promise<FigmaVerifyResult> {
    const params = new URLSearchParams()
    if (options?.teamId) params.set('teamId', options.teamId)
    if (options?.activeDays != null) params.set('activeDays', String(options.activeDays))
    const query = params.toString() ? `?${params.toString()}` : ''
    return request<FigmaVerifyResult>(`/integrations/figma/verify${query}`)
  },

  async syncFigmaProjects(options?: FigmaSyncOptions): Promise<FigmaSyncResult> {
    return request<FigmaSyncResult>('/integrations/figma/sync-projects', {
      method: 'POST',
      body: JSON.stringify(options ?? {}),
    })
  },

  async importFigmaFile(options: FigmaImportOptions): Promise<FigmaImportResult> {
    return request<FigmaImportResult>('/integrations/figma/import-file', {
      method: 'POST',
      body: JSON.stringify(options),
    })
  },

  async linkFigmaProject(options: FigmaImportOptions): Promise<FigmaLinkResult> {
    return request<FigmaLinkResult>('/integrations/figma/link-project', {
      method: 'POST',
      body: JSON.stringify(options),
    })
  },
}
