import { mockProjects } from '@/shared/mocks/mock-projects'
import type { Project } from '@/entities/project/model/project-types'
import { uid } from '@/shared/lib/id-utils'

let projectsCache: Project[] | null = null

function getProjectsCache(): Project[] {
  if (!projectsCache) projectsCache = [...(mockProjects as Project[])]
  return projectsCache
}

export const projectService = {
  async getProjects(): Promise<Project[]> {
    return Promise.resolve([...getProjectsCache()])
  },

  async getProjectById(projectId: string): Promise<Project | undefined> {
    return Promise.resolve(getProjectsCache().find((project) => project.id === projectId))
  },

  async getProjectsWithOperations(): Promise<Project[]> {
    return Promise.resolve(getProjectsCache().filter((p) => p.operations != null))
  },

  async saveProject(project: Project): Promise<Project> {
    const cache = getProjectsCache()
    const idx = cache.findIndex((p) => p.id === project.id)
    const saved = { ...project, updatedAt: new Date().toISOString() }
    if (idx >= 0) cache[idx] = saved
    else cache.push(saved)
    return Promise.resolve(saved)
  },

  async deleteProject(projectId: string): Promise<void> {
    const cache = getProjectsCache()
    const idx = cache.findIndex((p) => p.id === projectId)
    if (idx >= 0) cache.splice(idx, 1)
    return Promise.resolve()
  },

  createEmptyProject(): Project {
    return {
      id: uid('project-'),
      name: '',
      description: '',
      status: 'active',
      owner: '',
      assetCount: 0,
      updatedAt: new Date().toISOString(),
      links: {},
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
  },
}
