import { mockAssets } from '@/shared/mocks/mock-assets'
import type { Asset } from '@/entities/asset/model/asset-types'

export const assetService = {
  async getAssets(): Promise<Asset[]> {
    return Promise.resolve(mockAssets as Asset[])
  },
  async getAssetById(assetId: string): Promise<Asset | undefined> {
    return Promise.resolve((mockAssets as Asset[]).find((asset) => asset.id === assetId))
  },
  async getAssetsByProject(projectId: string): Promise<Asset[]> {
    return Promise.resolve((mockAssets as Asset[]).filter((asset) => asset.projectId === projectId))
  },
}
