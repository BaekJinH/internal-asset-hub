export type AssetCategory =
  | 'planning'
  | 'design'
  | 'development'
  | 'meeting'
  | 'media'
  | 'ai-output'
  | 'delivery'

export type AssetStatus = 'draft' | 'review' | 'confirmed' | 'archived' | 'discarded'

export interface Asset {
  id: string
  name: string
  projectId: string
  projectName: string
  category: AssetCategory
  status: AssetStatus
  owner: string
  tags: string[]
  filePath?: string
  externalUrl?: string
  fileSize?: string
  extension?: string
  description: string
  createdAt: string
  updatedAt: string
  relatedAssetIds: string[]
  externalIds?: {
    figmaFileKey?: string
  }
  syncSource?: 'manual' | 'figma'
  syncMeta?: {
    lastSyncedAt?: string
  }
  thumbnailUrl?: string
}
