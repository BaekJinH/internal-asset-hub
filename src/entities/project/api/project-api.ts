import { fetchApi, isApiAvailable } from '@/shared/api/api-client'
import type { Project, ProjectTeamCategory } from '@/entities/project/model/project-types'
import { uid } from '@/shared/lib/id-utils'

let localProjectsCache: Project[] | null = null
let apiAvailable: boolean | null = null

function getLocalProjects(): Project[] {
  if (!localProjectsCache) {
    localProjectsCache = []
  }
  return localProjectsCache
}

async function useApi(): Promise<boolean> {
  if (apiAvailable === null) {
    apiAvailable = await isApiAvailable()
  }
  return apiAvailable
}

export function resetProjectApiCache(): void {
  apiAvailable = null
  localProjectsCache = null
}

export async function fetchProjects(): Promise<Project[]> {
  if (await useApi()) {
    return fetchApi<Project[]>('/projects')
  }
  return [...getLocalProjects()]
}

export async function fetchProjectById(projectId: string): Promise<Project | undefined> {
  if (await useApi()) {
    try {
      return await fetchApi<Project>(`/projects/${projectId}`)
    } catch {
      return undefined
    }
  }
  return getLocalProjects().find((project) => project.id === projectId)
}

export async function saveProject(project: Project): Promise<Project> {
  const saved = { ...project, updatedAt: new Date().toISOString() }

  if (await useApi()) {
    const exists = await fetchProjectById(project.id)
    if (exists) {
      return fetchApi<Project>(`/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify(saved),
      })
    }
    return fetchApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(saved),
    })
  }

  const cache = getLocalProjects()
  const idx = cache.findIndex((p) => p.id === project.id)
  if (idx >= 0) cache[idx] = saved
  else cache.push(saved)
  return saved
}

export function createEmptyProject(teamCategory: ProjectTeamCategory = 'dev'): Project {
  return {
    id: uid('project-'),
    name: '',
    description: '',
    status: 'active',
    owner: '',
    assetCount: 0,
    updatedAt: new Date().toISOString(),
    links: {},
    teamCategory,
    syncMeta: { notionLinked: false, githubLinked: false, syncSource: 'manual' },
    operations: {
      clientName: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      contractAmount: 0,
      contractMDs: { planning: 0, design: 0, publishing: 0, dev: 0 },
      contractRates: { planning: 0, design: 0, publishing: 0, dev: 0 },
      assignments: [],
    },
  }
}
