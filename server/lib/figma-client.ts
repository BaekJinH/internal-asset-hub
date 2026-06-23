import { env } from '../env.js'
import { buildFigmaFileUrl } from './parse-figma-url.js'
import {
  figmaGet,
  getCachedTeamFiles,
  setCachedTeamFiles,
  teamFilesCacheKey,
} from './figma-request.js'
import type { FigmaFilePreview, FigmaTeamFile, FigmaVerifyResult } from '../types.js'

interface FigmaFileMetaResponse {
  file: {
    name: string
    last_touched_at?: string
    thumbnail_url?: string
    creator?: { handle?: string; id?: string }
  }
}

interface FigmaTeamProjectResponse {
  projects: Array<{ id: string; name: string }>
}

interface FigmaProjectFilesResponse {
  files: Array<{
    key: string
    name: string
    thumbnail_url?: string
    last_modified?: string
  }>
}

function toPreview(fileKey: string, meta: FigmaFileMetaResponse['file']): FigmaFilePreview {
  return {
    fileKey,
    name: meta.name,
    lastTouchedAt: meta.last_touched_at,
    thumbnailUrl: meta.thumbnail_url,
    creatorHandle: meta.creator?.handle,
  }
}

function isActiveFile(lastModified: string | undefined, activeDays: number): boolean {
  if (activeDays <= 0) return true
  if (!lastModified) return false
  const touched = new Date(lastModified).getTime()
  if (Number.isNaN(touched)) return false
  const cutoff = Date.now() - activeDays * 24 * 60 * 60 * 1000
  return touched >= cutoff
}

async function loadTeamDesignFiles(
  token: string,
  teamId: string,
  activeDays: number,
): Promise<FigmaTeamFile[]> {
  const { projects } = await figmaGet<FigmaTeamProjectResponse>(
    token,
    `/teams/${encodeURIComponent(teamId)}/projects`,
  )

  const files: FigmaTeamFile[] = []

  for (const project of projects) {
    const { files: projectFiles } = await figmaGet<FigmaProjectFilesResponse>(
      token,
      `/projects/${encodeURIComponent(project.id)}/files`,
    )

    for (const file of projectFiles) {
      if (!isActiveFile(file.last_modified, activeDays)) continue

      files.push({
        fileKey: file.key,
        name: file.name,
        figmaProjectId: project.id,
        figmaProjectName: project.name,
        lastModified: file.last_modified,
        thumbnailUrl: file.thumbnail_url,
        htmlUrl: buildFigmaFileUrl(file.key),
      })
    }
  }

  files.sort((a, b) => {
    const aTime = a.lastModified ? new Date(a.lastModified).getTime() : 0
    const bTime = b.lastModified ? new Date(b.lastModified).getTime() : 0
    return bTime - aTime
  })

  return files
}

export async function fetchTeamDesignFiles(
  token: string,
  teamId: string,
  activeDays = env.figmaSyncActiveDays,
  options?: { useCache?: boolean },
): Promise<FigmaTeamFile[]> {
  if (!token) {
    throw new Error('Figma PAT가 설정되지 않았습니다. FIGMA_PAT를 확인하세요.')
  }
  if (!teamId) {
    throw new Error('FIGMA_TEAM_ID가 필요합니다.')
  }

  const useCache = options?.useCache !== false
  const cacheKey = teamFilesCacheKey(teamId, activeDays)

  if (useCache) {
    const cached = getCachedTeamFiles<FigmaTeamFile[]>(cacheKey)
    if (cached) return cached
  }

  const files = await loadTeamDesignFiles(token, teamId, activeDays)

  if (useCache) {
    setCachedTeamFiles(cacheKey, files)
  }

  return files
}

export async function fetchFileMeta(
  token: string,
  fileKey: string,
): Promise<FigmaFilePreview> {
  if (!token) {
    throw new Error('Figma PAT가 설정되지 않았습니다. FIGMA_PAT를 확인하세요.')
  }

  const data = await figmaGet<FigmaFileMetaResponse>(
    token,
    `/files/${encodeURIComponent(fileKey)}/meta`,
  )
  return toPreview(fileKey, data.file)
}

export async function verifyFigmaConnection(): Promise<FigmaVerifyResult> {
  const token = env.figmaPat

  if (!token) {
    return {
      ok: false,
      mode: 'token_only',
      error: 'FIGMA_PAT가 설정되지 않았습니다.',
    }
  }

  const teamId = env.figmaTeamId
  const activeDays = env.figmaSyncActiveDays

  if (teamId) {
    try {
      const files = await fetchTeamDesignFiles(token, teamId, activeDays)
      const projectNames = new Set(files.map((f) => f.figmaProjectName))
      return {
        ok: true,
        mode: 'team',
        teamId,
        fileCount: files.length,
        projectCount: projectNames.size,
        files: files.slice(0, 20),
        activeDays,
        warning:
          files.length === 0
            ? `최근 ${activeDays}일 이내 수정된 Figma 파일이 없습니다. FIGMA_SYNC_ACTIVE_DAYS=0 으로 전체 sync를 시도하세요.`
            : undefined,
      }
    } catch (error) {
      return {
        ok: false,
        mode: 'team',
        teamId,
        error: error instanceof Error ? error.message : 'Figma 팀 조회 실패',
      }
    }
  }

  const testFileKey = env.figmaTestFileKey
  if (!testFileKey) {
    return {
      ok: true,
      mode: 'token_only',
      warning: 'FIGMA_TEAM_ID 또는 FIGMA_TEST_FILE_KEY 없음 — PAT 존재만 확인했습니다.',
    }
  }

  try {
    const file = await fetchFileMeta(token, testFileKey)
    return {
      ok: true,
      mode: 'meta',
      fileKey: testFileKey,
      file,
    }
  } catch (error) {
    return {
      ok: false,
      mode: 'meta',
      fileKey: testFileKey,
      error: error instanceof Error ? error.message : 'Figma 연결 실패',
    }
  }
}
