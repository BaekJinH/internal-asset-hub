import { Router } from 'express'
import { env } from '../env.js'
import {
  fetchOrgReposWithFallback,
  verifyGithubConnection,
} from '../lib/github-client.js'
import { resolveGithubOrg, resolveGithubToken } from '../lib/github-org.js'
import { syncGithubReposToProjects, linkNotionRowsToProjects } from '../lib/link-matcher.js'
import { fetchNotionProjectRows } from '../lib/notion-client.js'
import type { ProjectTeamCategory } from '../types.js'

function parseTeamCategory(value: unknown): ProjectTeamCategory {
  if (value === 'publishing' || value === 'design' || value === 'dev') return value
  return 'dev'
}

export const githubRouter = Router()

githubRouter.get('/verify', async (req, res) => {
  const teamCategory = parseTeamCategory(req.query.teamCategory)
  const org =
    (req.query.org as string | undefined) ?? resolveGithubOrg(teamCategory)
  const token = resolveGithubToken(teamCategory)
  const result = await verifyGithubConnection(token, org)
  res.status(result.ok ? 200 : 400).json({ ...result, teamCategory })
})

githubRouter.get('/repos', async (req, res) => {
  const teamCategory = parseTeamCategory(req.query.teamCategory)
  const org =
    (req.query.org as string | undefined) ?? resolveGithubOrg(teamCategory)

  try {
    const token = resolveGithubToken(teamCategory)
    const { repos, mode, warning } = await fetchOrgReposWithFallback(token, org)
    res.json({ org, teamCategory, repos, mode, warning })
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'GitHub repo 목록 조회 실패',
    })
  }
})

githubRouter.post('/sync-projects', async (req, res) => {
  const teamCategory = parseTeamCategory(req.body?.teamCategory)
  const org =
    (req.body?.org as string | undefined) ?? resolveGithubOrg(teamCategory)

  try {
    const token = resolveGithubToken(teamCategory)
    const { repos, mode, warning } = await fetchOrgReposWithFallback(token, org)
    const result = syncGithubReposToProjects(repos, teamCategory)
    res.json({ ...result, org, teamCategory, mode, warning })
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'GitHub 프로젝트 동기화 실패',
    })
  }
})

githubRouter.post('/link-notion', async (_req, res) => {
  if (!env.notionToken || !env.notionProjectsDatabaseId) {
    res.status(400).json({ error: 'Notion 연동 설정이 없습니다.' })
    return
  }

  try {
    const notionRows = await fetchNotionProjectRows(env.notionToken, env.notionProjectsDatabaseId)
    const result = linkNotionRowsToProjects(notionRows)
    res.json(result)
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Notion-GitHub 교차 연결 실패',
    })
  }
})
