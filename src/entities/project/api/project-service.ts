/**
 * @deprecated project-api / project-queries 사용을 권장합니다.
 */
import {
  createEmptyProject,
  fetchProjectById,
  fetchProjects,
  resetProjectApiCache,
  saveProject,
} from '@/entities/project/api/project-api'

/** @deprecated use fetchProjects + useProjectsQuery */
export const projectService = {
  getProjects: fetchProjects,
  getProjectById: fetchProjectById,
  getProjectsWithOperations: async () => {
    const projects = await fetchProjects()
    return projects.filter((p) => p.operations != null)
  },
  saveProject,
  deleteProject: async () => Promise.resolve(),
  resetApiMode: resetProjectApiCache,
  createEmptyProject,
}
