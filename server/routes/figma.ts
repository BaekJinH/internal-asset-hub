import { Router } from 'express'
import { env } from '../env.js'
import { fetchTeamDesignFiles, verifyFigmaConnection } from '../lib/figma-client.js'
import { importFigmaFileToAsset, linkFigmaToProject } from '../lib/figma-import.js'
import { syncFigmaFilesToProjects } from '../lib/figma-sync.js'
import type { FigmaSyncResult } from '../types.js'

export const figmaRouter = Router()

figmaRouter.get('/verify', async (req, res) => {
  const teamId = (req.query.teamId as string | undefined) ?? env.figmaTeamId
  const activeDaysRaw = req.query.activeDays as string | undefined
  const activeDays = activeDaysRaw != null ? Number(activeDaysRaw) : env.figmaSyncActiveDays

  if (teamId && env.figmaPat) {
    try {
      const files = await fetchTeamDesignFiles(env.figmaPat, teamId, activeDays)
      const projectNames = new Set(files.map((f) => f.figmaProjectName))
      res.json({
        ok: true,
        mode: 'team',
        teamId,
        fileCount: files.length,
        projectCount: projectNames.size,
        files: files.slice(0, 20),
        activeDays,
        warning:
          files.length === 0
            ? `최근 ${activeDays}일 이내 수정된 Figma 파일이 없습니다.`
            : undefined,
      })
      return
    } catch (error) {
      res.status(400).json({
        ok: false,
        mode: 'team',
        teamId,
        error: error instanceof Error ? error.message : 'Figma 팀 조회 실패',
      })
      return
    }
  }

  const result = await verifyFigmaConnection()
  res.status(result.ok ? 200 : 400).json(result)
})

figmaRouter.get('/files', async (req, res) => {
  const teamId = (req.query.teamId as string | undefined) ?? env.figmaTeamId
  const activeDaysRaw = req.query.activeDays as string | undefined
  const activeDays = activeDaysRaw != null ? Number(activeDaysRaw) : env.figmaSyncActiveDays

  if (!env.figmaPat) {
    res.status(400).json({ error: 'FIGMA_PAT가 설정되지 않았습니다.' })
    return
  }
  if (!teamId) {
    res.status(400).json({ error: 'FIGMA_TEAM_ID가 필요합니다.' })
    return
  }

  try {
    const files = await fetchTeamDesignFiles(env.figmaPat, teamId, activeDays)
    res.json({ teamId, activeDays, files })
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Figma 파일 목록 조회 실패',
    })
  }
})

figmaRouter.post('/sync-projects', async (req, res) => {
  const teamId = (req.body?.teamId as string | undefined) ?? env.figmaTeamId
  const activeDays =
    req.body?.activeDays != null ? Number(req.body.activeDays) : env.figmaSyncActiveDays

  if (!env.figmaPat) {
    res.status(400).json({ error: 'FIGMA_PAT가 설정되지 않았습니다.' })
    return
  }
  if (!teamId) {
    res.status(400).json({ error: 'FIGMA_TEAM_ID가 필요합니다.' })
    return
  }

  try {
    const result = await syncFigmaFilesToProjects(teamId, activeDays)
    res.json(result)
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Figma 프로젝트 동기화 실패',
    })
  }
})

figmaRouter.post('/import-file', async (req, res) => {
  const projectId = req.body?.projectId as string | undefined
  const figmaUrl = req.body?.figmaUrl as string | undefined

  if (!projectId?.trim() || !figmaUrl?.trim()) {
    res.status(400).json({ error: 'projectId와 figmaUrl이 필요합니다.' })
    return
  }

  try {
    const result = await importFigmaFileToAsset(projectId.trim(), figmaUrl.trim())
    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Figma 파일 import 실패'
    const status = message.includes('다른 프로젝트') ? 409 : 400
    res.status(status).json({ error: message })
  }
})

figmaRouter.post('/link-project', async (req, res) => {
  const projectId = req.body?.projectId as string | undefined
  const figmaUrl = req.body?.figmaUrl as string | undefined

  if (!projectId?.trim() || !figmaUrl?.trim()) {
    res.status(400).json({ error: 'projectId와 figmaUrl이 필요합니다.' })
    return
  }

  try {
    const result = await linkFigmaToProject(projectId.trim(), figmaUrl.trim(), true)
    res.json(result)
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Figma 프로젝트 연결 실패',
    })
  }
})
