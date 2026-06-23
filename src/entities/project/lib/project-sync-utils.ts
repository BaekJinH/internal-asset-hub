import type { Project } from '@/entities/project/model/project-types'

export function getProjectSyncSummary(project: Project): string {
  const notionLinked = project.syncMeta?.notionLinked ?? Boolean(project.links.notion)
  const githubLinked = project.syncMeta?.githubLinked ?? Boolean(project.links.github)
  const figmaLinked = project.syncMeta?.figmaLinked ?? Boolean(project.links.figma)
  const links = [
    notionLinked ? 'Notion' : null,
    githubLinked ? 'GitHub' : null,
    figmaLinked ? 'Figma' : null,
  ].filter(Boolean)

  if (links.length === 0) return '외부 연동 없음'
  return `${links.join(' · ')} 연결됨`
}

export function resolveProjectSyncMeta(project: Project) {
  return {
    notionLinked: project.syncMeta?.notionLinked ?? Boolean(project.links.notion),
    githubLinked: project.syncMeta?.githubLinked ?? Boolean(project.links.github),
    figmaLinked: project.syncMeta?.figmaLinked ?? Boolean(project.links.figma),
  }
}
