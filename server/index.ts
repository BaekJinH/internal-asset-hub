import './load-env.js'
import express from 'express'
import cors from 'cors'
import { env, getIntegrationHealth } from './env.js'
import { notionRouter } from './routes/notion.js'
import { githubRouter } from './routes/github.js'
import { figmaRouter } from './routes/figma.js'
import { projectsRouter } from './routes/projects.js'
import { assetsRouter } from './routes/assets.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json(getIntegrationHealth())
})

app.use('/api/integrations/notion', notionRouter)
app.use('/api/integrations/github', githubRouter)
app.use('/api/integrations/figma', figmaRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/assets', assetsRouter)

app.post('/api/integrations/issues/sync', (_req, res) => {
  res.status(501).json({
    error: 'Issue/Task 양방향 sync는 후속 단계에서 구현 예정입니다.',
    status: 'not_implemented',
  })
})

app.listen(env.port, () => {
  console.log(`API server listening on http://localhost:${env.port}`)
  if (!env.githubTokenDevelopment && !env.githubTokenPublishing) {
    console.warn('[warn] GitHub PAT 없음 — public repo만 동기화 가능')
  }
  console.log(`[info] GitHub dev org: ${env.githubOrg} (token: ${env.githubTokenDevelopment ? 'ok' : 'missing'})`)
  console.log(
    `[info] GitHub publishing org: ${env.githubOrgPublishing} (token: ${env.githubTokenPublishing ? 'ok' : 'missing'})`,
  )
  console.log(`[info] Figma PAT: ${env.figmaPat ? 'ok' : 'missing'}`)
  if (env.figmaTeamId) {
    console.log(`[info] Figma team: ${env.figmaTeamId} (active days: ${env.figmaSyncActiveDays})`)
  }
})
