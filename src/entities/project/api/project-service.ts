import { mockProjects } from '@/shared/mocks/mock-projects'
import type { Project } from '@/entities/project/model/project-types'

export const projectService = {
  async getProjects(): Promise<Project[]> {
    return Promise.resolve(mockProjects as Project[])
  },
  async getProjectById(projectId: string): Promise<Project | undefined> {
    return Promise.resolve((mockProjects as Project[]).find((project) => project.id === projectId))
  },
}
