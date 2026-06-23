import { Router } from 'express'
import { assetStore } from '../lib/asset-store.js'

export const assetsRouter = Router()

assetsRouter.get('/', (req, res) => {
  const projectId = req.query.projectId as string | undefined

  if (projectId) {
    res.json(assetStore.findByProjectId(projectId))
    return
  }

  res.json(assetStore.getAll())
})

assetsRouter.get('/:assetId', (req, res) => {
  const asset = assetStore.findById(req.params.assetId)
  if (!asset) {
    res.status(404).json({ error: '자산을 찾을 수 없습니다.' })
    return
  }
  res.json(asset)
})
