import { Router } from 'express'
import { env } from '../env.js'
import { verifyNotionConnection, fetchNotionProjectRows } from '../lib/notion-client.js'

export const notionRouter = Router()

notionRouter.post('/verify', async (req, res) => {
  const databaseId =
    (req.body?.databaseId as string | undefined) ?? env.notionProjectsDatabaseId

  const result = await verifyNotionConnection(env.notionToken, databaseId)
  res.status(result.ok ? 200 : 400).json(result)
})

notionRouter.get('/projects', async (_req, res) => {
  if (!env.notionToken || !env.notionProjectsDatabaseId) {
    res.status(400).json({ error: 'NOTION_TOKEN 또는 NOTION_PROJECTS_DATABASE_ID가 없습니다.' })
    return
  }

  try {
    const rows = await fetchNotionProjectRows(env.notionToken, env.notionProjectsDatabaseId)
    res.json({ rows })
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Notion 프로젝트 조회 실패',
    })
  }
})
