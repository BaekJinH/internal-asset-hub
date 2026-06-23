import type { GitHubRepoPreview, LinkProjectsResult, NotionProjectRow, Project, ProjectTeamCategory } from '../types.js'
import { parseGithubFullName, toGithubRepoUrl } from './parse-github-url.js'
import { projectStore } from './project-store.js'

function slugifyRepo(fullName: string): string {
  return `project-${fullName.replace('/', '-')}`
}

function mapRepoStatus(archived: boolean): Project['status'] {
  return archived ? 'paused' : 'active'
}

export function syncGithubReposToProjects(
  repos: GitHubRepoPreview[],
  teamCategory: ProjectTeamCategory = 'dev',
  defaultOwner = 'GitHub',
): { created: number; updated: number; skipped: number; projects: Project[] } {
  const projects = projectStore.getAll()
  let created = 0
  let updated = 0
  let skipped = 0
  const now = new Date().toISOString()

  for (const repo of repos) {
    const fullName = repo.fullName.toLowerCase()
    const existing =
      projects.find((p) => p.externalIds?.githubRepoFullName?.toLowerCase() === fullName) ??
      projects.find((p) => parseGithubFullName(p.links.github) === fullName)

    if (existing) {
      const hasChanges =
        existing.name !== repo.name ||
        existing.description !== (repo.description ?? '') ||
        existing.links.github !== repo.htmlUrl ||
        existing.externalIds?.githubRepoFullName !== repo.fullName

      if (!hasChanges) {
        skipped += 1
        continue
      }

      existing.name = repo.name
      existing.description = repo.description ?? existing.description
      existing.updatedAt = repo.pushedAt || now
      existing.links.github = repo.htmlUrl
      existing.externalIds = {
        ...existing.externalIds,
        githubRepoFullName: repo.fullName,
      }
      existing.syncMeta = {
        notionLinked: Boolean(existing.links.notion ?? existing.externalIds?.notionPageId),
        githubLinked: true,
        lastSyncedAt: now,
        syncSource: 'github',
      }
      existing.teamCategory = teamCategory
      if (repo.archived && existing.status === 'active') {
        existing.status = mapRepoStatus(true)
      }
      updated += 1
      continue
    }

    projects.push({
      id: slugifyRepo(fullName),
      name: repo.name,
      description: repo.description ?? '',
      status: mapRepoStatus(repo.archived),
      owner: defaultOwner,
      assetCount: 0,
      updatedAt: repo.pushedAt || now,
      links: { github: repo.htmlUrl },
      externalIds: { githubRepoFullName: repo.fullName },
      syncMeta: {
        notionLinked: false,
        githubLinked: true,
        lastSyncedAt: now,
        syncSource: 'github',
      },
      teamCategory,
    })
    created += 1
  }

  projectStore.saveAll(projects)
  return { created, updated, skipped, projects: projectStore.getAll() }
}

export function linkNotionRowsToProjects(notionRows: NotionProjectRow[]): LinkProjectsResult {
  const projects = projectStore.getAll()
  let matched = 0
  let updated = 0
  const now = new Date().toISOString()
  const matchedNotionIds = new Set<string>()
  const matchedGithubNames = new Set<string>()

  for (const row of notionRows) {
    const notionRepo = parseGithubFullName(row.githubRepoUrl)
    if (!notionRepo) continue

    const project = projects.find((p) => {
      const hubRepo =
        p.externalIds?.githubRepoFullName?.toLowerCase() ?? parseGithubFullName(p.links.github)
      return hubRepo === notionRepo
    })

    if (!project) continue

    matched += 1
    matchedNotionIds.add(row.pageId)
    matchedGithubNames.add(notionRepo)

    const nextLinks = {
      ...project.links,
      notion: row.notionUrl,
      github: project.links.github ?? toGithubRepoUrl(notionRepo),
    }

    const hasChanges =
      project.links.notion !== nextLinks.notion ||
      project.externalIds?.notionPageId !== row.pageId

    project.links = nextLinks
    project.externalIds = {
      ...project.externalIds,
      notionPageId: row.pageId,
      githubRepoFullName: project.externalIds?.githubRepoFullName ?? notionRepo,
    }
    project.syncMeta = {
      notionLinked: true,
      githubLinked: true,
      lastSyncedAt: now,
      syncSource: 'link',
    }

    if (hasChanges) updated += 1
  }

  projectStore.saveAll(projects)

  const unmatchedNotion = notionRows.filter(
    (row) => row.githubRepoUrl && !matchedNotionIds.has(row.pageId),
  ).length

  const unmatchedGithub = projects.filter(
    (p) =>
      p.syncMeta?.githubLinked &&
      p.externalIds?.githubRepoFullName &&
      !matchedGithubNames.has(p.externalIds.githubRepoFullName.toLowerCase()),
  ).length

  return {
    matched,
    updated,
    unmatchedNotion,
    unmatchedGithub,
    projects: projectStore.getAll(),
  }
}
