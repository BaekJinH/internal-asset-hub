import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Asset } from '../types.js'
import { seedAssets } from './seed-assets.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const DATA_FILE = join(DATA_DIR, 'assets.json')

let cache: Asset[] | null = null

function ensureDataFile(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, JSON.stringify(seedAssets, null, 2), 'utf-8')
  }
}

function loadFromDisk(): Asset[] {
  ensureDataFile()
  const raw = readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw) as Asset[]
}

function persist(assets: Asset[]): void {
  ensureDataFile()
  writeFileSync(DATA_FILE, JSON.stringify(assets, null, 2), 'utf-8')
  cache = assets
}

export const assetStore = {
  getAll(): Asset[] {
    if (!cache) {
      cache = loadFromDisk()
    }
    return [...cache]
  },

  saveAll(assets: Asset[]): Asset[] {
    persist(assets)
    return [...assets]
  },

  saveOne(asset: Asset): Asset {
    const assets = this.getAll()
    const idx = assets.findIndex((a) => a.id === asset.id)
    const saved = { ...asset, updatedAt: asset.updatedAt ?? new Date().toISOString() }
    if (idx >= 0) assets[idx] = saved
    else assets.push(saved)
    persist(assets)
    return saved
  },

  findById(assetId: string): Asset | undefined {
    return this.getAll().find((a) => a.id === assetId)
  },

  findByProjectId(projectId: string): Asset[] {
    return this.getAll().filter((a) => a.projectId === projectId)
  },

  findByFigmaFileKey(fileKey: string): Asset | undefined {
    const normalized = fileKey.toLowerCase()
    return this.getAll().find(
      (a) =>
        a.externalIds?.figmaFileKey?.toLowerCase() === normalized ||
        a.id === `asset-figma-${fileKey}`,
    )
  },

  countByProjectId(projectId: string): number {
    return this.findByProjectId(projectId).length
  },
}
