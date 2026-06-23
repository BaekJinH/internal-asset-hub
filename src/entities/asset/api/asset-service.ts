import { fetchAssets, fetchAssetById, fetchAssetsByProject } from '@/entities/asset/api/asset-api'
import type { Asset } from '@/entities/asset/model/asset-types'

export const assetService = {
  async getAssets(): Promise<Asset[]> {
    return fetchAssets()
  },
  async getAssetById(assetId: string): Promise<Asset | undefined> {
    return fetchAssetById(assetId)
  },
  async getAssetsByProject(projectId: string): Promise<Asset[]> {
    return fetchAssetsByProject(projectId)
  },
}
