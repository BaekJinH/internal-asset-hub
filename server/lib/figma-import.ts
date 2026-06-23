import { env } from '../env.js'
import { assetStore } from './asset-store.js'
import { fetchFileMeta } from './figma-client.js'
import { parseFigmaFileKey, toFigmaAssetId } from './parse-figma-url.js'
import { projectStore } from './project-store.js'
import type { Asset, FigmaFilePreview, FigmaImportResult, FigmaLinkResult, Project } from '../types.js'

function applyFigmaLinkToProject(
  project: Project,
  fileKey: string,
  normalizedUrl: string,
): Project {
  const now = new Date().toISOString()
  return {
    ...project,
    links: { ...project.links, figma: normalizedUrl },
    externalIds: { ...project.externalIds, figmaFileKey: fileKey },
    syncMeta: {
      notionLinked: Boolean(project.links.notion ?? project.externalIds?.notionPageId),
      githubLinked: Boolean(
        project.syncMeta?.githubLinked ?? project.links.github ?? project.externalIds?.githubRepoFullName,
      ),
      figmaLinked: true,
      lastSyncedAt: now,
      syncSource: 'figma',
    },
    updatedAt: now,
  }
}

function buildAssetFromFigma(
  project: Project,
  fileKey: string,
  figmaUrl: string,
  meta: FigmaFilePreview,
  existing?: Asset,
): Asset {
  const now = new Date().toISOString()
  const updatedAt = meta.lastTouchedAt ?? now

  return {
    id: toFigmaAssetId(fileKey),
    name: meta.name,
    projectId: project.id,
    projectName: project.name,
    category: 'design',
    status: 'confirmed',
    owner: meta.creatorHandle ?? 'UX Team',
    tags: ['figma', 'design'],
    externalUrl: figmaUrl,
    extension: 'figma',
    description: 'Figma design file synced from Figma',
    createdAt: existing?.createdAt ?? now,
    updatedAt,
    relatedAssetIds: existing?.relatedAssetIds ?? [],
    externalIds: { figmaFileKey: fileKey },
    syncSource: 'figma',
    syncMeta: { lastSyncedAt: now },
    thumbnailUrl: meta.thumbnailUrl,
  }
}

function hasAssetChanges(existing: Asset, next: Asset): boolean {
  return (
    existing.name !== next.name ||
    existing.externalUrl !== next.externalUrl ||
    existing.updatedAt !== next.updatedAt ||
    existing.owner !== next.owner ||
    existing.thumbnailUrl !== next.thumbnailUrl
  )
}

export async function linkFigmaToProject(
  projectId: string,
  figmaUrl: string,
  validate = true,
): Promise<FigmaLinkResult> {
  const parsed = parseFigmaFileKey(figmaUrl)
  if (!parsed) {
    throw new Error('유효하지 않은 Figma URL 또는 file key입니다.')
  }

  const project = projectStore.getAll().find((p) => p.id === projectId)
  if (!project) {
    throw new Error('프로젝트를 찾을 수 없습니다.')
  }

  let meta: FigmaFilePreview | undefined
  if (validate) {
    meta = await fetchFileMeta(env.figmaPat, parsed.fileKey)
  }

  const linked = applyFigmaLinkToProject(project, parsed.fileKey, parsed.normalizedUrl)
  const saved = projectStore.saveOne(linked)

  return {
    project: saved,
    fileKey: parsed.fileKey,
    validated: validate,
    meta: meta
      ? { name: meta.name, lastTouchedAt: meta.lastTouchedAt }
      : undefined,
  }
}

export async function importFigmaFileToAsset(
  projectId: string,
  figmaUrl: string,
): Promise<FigmaImportResult> {
  const parsed = parseFigmaFileKey(figmaUrl)
  if (!parsed) {
    throw new Error('유효하지 않은 Figma URL 또는 file key입니다.')
  }

  const project = projectStore.getAll().find((p) => p.id === projectId)
  if (!project) {
    throw new Error('프로젝트를 찾을 수 없습니다.')
  }

  const existingAsset = assetStore.findByFigmaFileKey(parsed.fileKey)
  if (existingAsset && existingAsset.projectId !== projectId) {
    throw new Error('이 Figma 파일은 다른 프로젝트에 이미 연결되어 있습니다.')
  }

  const meta = await fetchFileMeta(env.figmaPat, parsed.fileKey)
  const nextAsset = buildAssetFromFigma(
    project,
    parsed.fileKey,
    parsed.normalizedUrl,
    meta,
    existingAsset,
  )

  let action: 'created' | 'updated'
  if (existingAsset) {
    if (!hasAssetChanges(existingAsset, nextAsset)) {
      action = 'updated'
    } else {
      action = 'updated'
    }
    assetStore.saveOne(nextAsset)
  } else {
    action = 'created'
    assetStore.saveOne(nextAsset)
  }

  const linked = applyFigmaLinkToProject(project, parsed.fileKey, parsed.normalizedUrl)
  const savedProject = projectStore.saveOne({
    ...linked,
    assetCount: assetStore.countByProjectId(projectId),
  })

  return {
    action,
    fileKey: parsed.fileKey,
    asset: nextAsset,
    project: savedProject,
  }
}
