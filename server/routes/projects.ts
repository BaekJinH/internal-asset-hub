import { Router } from 'express'
import { projectStore } from '../lib/project-store.js'
import type { Project } from '../types.js'

export const projectsRouter = Router()

projectsRouter.get('/', (_req, res) => {
  res.json(projectStore.getAll())
})

projectsRouter.get('/:projectId', (req, res) => {
  const project = projectStore.getAll().find((p) => p.id === req.params.projectId)
  if (!project) {
    res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' })
    return
  }
  res.json(project)
})

projectsRouter.post('/', (req, res) => {
  const project = req.body as Project
  if (!project?.id || !project?.name) {
    res.status(400).json({ error: 'id와 name이 필요합니다.' })
    return
  }
  res.json(projectStore.saveOne(project))
})

projectsRouter.put('/:projectId', (req, res) => {
  const project = req.body as Project
  if (project.id !== req.params.projectId) {
    res.status(400).json({ error: 'project id가 일치하지 않습니다.' })
    return
  }
  res.json(projectStore.saveOne(project))
})
