import type { Project, ProjectTeamCategory } from '@/entities/project/model/project-types'

export function resolveProjectTeamCategory(project: Project): ProjectTeamCategory {
  if (project.teamCategory) return project.teamCategory
  if (
    project.syncMeta?.figmaLinked ||
    project.externalIds?.figmaFileKey ||
    (project.links.figma && !project.links.github)
  ) {
    return 'design'
  }
  if (project.syncMeta?.githubLinked || project.links.github || project.externalIds?.githubRepoFullName) {
    return 'dev'
  }
  return 'dev'
}

export function filterProjectsByTeam(projects: Project[], team: ProjectTeamCategory): Project[] {
  if (team === 'dev') {
    return projects.filter((project) => resolveProjectTeamCategory(project) === 'dev')
  }
  return projects.filter((project) => resolveProjectTeamCategory(project) === team)
}

export function isGithubManagedProject(project: Project): boolean {
  return Boolean(
    project.externalIds?.githubRepoFullName ||
      project.syncMeta?.syncSource === 'github' ||
      project.syncMeta?.syncSource === 'link',
  )
}
