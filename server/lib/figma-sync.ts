import { env } from '../env.js'
import { assetStore } from './asset-store.js'
import { fetchTeamDesignFiles } from './figma-client.js'
import {
  buildFigmaFileUrl,
  toFigmaAssetId,
  toFigmaProjectId,
} from './parse-figma-url.js'
import { projectStore } from './project-store.js'
import type { Asset, FigmaTeamFile, FigmaSyncResult, Project } from '../types.js'

function buildProjectFromFigmaFile(file: FigmaTeamFile, existing?: Project): Project {
  const now = new Date().toISOString()
  const updatedAt = file.lastModified ?? now

  return {
    id: existing?.id ?? toFigmaProjectId(file.fileKey),
    name: file.name,
    description: `Figma · ${file.figmaProjectName}`,
    status: existing?.status ?? 'active',
    owner: existing?.owner ?? 'Figma',
    assetCount: existing?.assetCount ?? 0,
    updatedAt,
    links: {
      ...existing?.links,
      figma: file.htmlUrl,
    },
    externalIds: {
      ...existing?.externalIds,
      figmaFileKey: file.fileKey,
    },
    syncMeta: {
      notionLinked: Boolean(existing?.links.notion ?? existing?.externalIds?.notionPageId),
      githubLinked: Boolean(
        existing?.syncMeta?.githubLinked ??
          existing?.links.github ??
          existing?.externalIds?.githubRepoFullName,
      ),
      figmaLinked: true,
      lastSyncedAt: now,
      syncSource: 'figma',
    },
    teamCategory: 'design',
  }
}

function buildAssetFromFigmaFile(project: Project, file: FigmaTeamFile, existing?: Asset): Asset {
  const now = new Date().toISOString()
  const updatedAt = file.lastModified ?? now

  return {
    id: toFigmaAssetId(file.fileKey),
    name: file.name,
    projectId: project.id,
    projectName: project.name,
    category: 'design',
    status: 'confirmed',
    owner: project.owner === 'Figma' ? 'UX Team' : project.owner,
    tags: ['figma', 'design', file.figmaProjectName],
    externalUrl: file.htmlUrl,
    extension: 'figma',
    description: `Figma design file · ${file.figmaProjectName}`,
    createdAt: existing?.createdAt ?? now,
    updatedAt,
    relatedAssetIds: existing?.relatedAssetIds ?? [],
    externalIds: { figmaFileKey: file.fileKey },
    syncSource: 'figma',
    syncMeta: { lastSyncedAt: now },
    thumbnailUrl: file.thumbnailUrl,
  }
}

function projectHasChanges(existing: Project, next: Project): boolean {
  return (
    existing.name !== next.name ||
    existing.description !== next.description ||
    existing.links.figma !== next.links.figma ||
    existing.externalIds?.figmaFileKey !== next.externalIds?.figmaFileKey ||
    existing.updatedAt !== next.updatedAt
  )
}

function assetHasChanges(existing: Asset, next: Asset): boolean {
  return (
    existing.name !== next.name ||
    existing.externalUrl !== next.externalUrl ||
    existing.updatedAt !== next.updatedAt ||
    existing.thumbnailUrl !== next.thumbnailUrl
  )
}

export async function syncFigmaFilesToProjects(
  teamId: string,
  activeDays?: number,
): Promise<FigmaSyncResult> {
  const token = env.figmaPat
  const days = activeDays ?? env.figmaSyncActiveDays
  const files = await fetchTeamDesignFiles(token, teamId, days)

  const projects = projectStore.getAll()
  let created = 0
  let updated = 0
  let skipped = 0
  let assetsCreated = 0
  let assetsUpdated = 0

  for (const file of files) {
    const fileKey = file.fileKey.toLowerCase()
    const existingProject =
      projects.find((p) => p.externalIds?.figmaFileKey?.toLowerCase() === fileKey) ??
      projects.find((p) => p.id === toFigmaProjectId(file.fileKey))

    const nextProject = buildProjectFromFigmaFile(file, existingProject)

    if (existingProject) {
      if (!projectHasChanges(existingProject, nextProject)) {
        skipped += 1
      } else {
        const idx = projects.findIndex((p) => p.id === existingProject.id)
        if (idx >= 0) projects[idx] = nextProject
        updated += 1
      }
    } else {
      projects.push(nextProject)
      created += 1
    }

    const savedProject =
      projects.find((p) => p.id === nextProject.id) ??
      projects.find((p) => p.externalIds?.figmaFileKey?.toLowerCase() === fileKey) ??
      nextProject

    const existingAsset = assetStore.findByFigmaFileKey(file.fileKey)
    const nextAsset = buildAssetFromFigmaFile(savedProject, file, existingAsset)

    if (existingAsset) {
      if (assetHasChanges(existingAsset, nextAsset)) {
        assetStore.saveOne(nextAsset)
        assetsUpdated += 1
      }
    } else {
      assetStore.saveOne(nextAsset)
      assetsCreated += 1
    }

    const projectIdx = projects.findIndex((p) => p.id === savedProject.id)
    if (projectIdx >= 0) {
      projects[projectIdx] = {
        ...savedProject,
        assetCount: assetStore.countByProjectId(savedProject.id),
      }
    }
  }

  projectStore.saveAll(projects)

  return {
    created,
    updated,
    skipped,
    assetsCreated,
    assetsUpdated,
    projects: projectStore.getAll(),
    teamId,
    fileCount: files.length,
    activeDays: days,
  }
}
