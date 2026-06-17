import type { AssetCategory, AssetStatus } from '@/entities/asset'

export interface AssetRegisterSchema {
  name: string
  projectId: string
  category: AssetCategory
  externalUrl?: string
  tags: string[]
  owner: string
  status: AssetStatus
  description: string
}
