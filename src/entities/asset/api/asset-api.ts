import { mockAssets } from '@/shared/mocks/mock-assets'
import { fetchApi, isApiAvailable } from '@/shared/api/api-client'
import type { Asset } from '@/entities/asset/model/asset-types'

let apiAvailable: boolean | null = null

async function useApi(): Promise<boolean> {
  if (apiAvailable === null) {
    apiAvailable = await isApiAvailable()
  }
  return apiAvailable
}

export function resetAssetApiCache(): void {
  apiAvailable = null
}

export async function fetchAssets(): Promise<Asset[]> {
  if (await useApi()) {
    return fetchApi<Asset[]>('/assets')
  }
  return [...(mockAssets as Asset[])]
}

export async function fetchAssetById(assetId: string): Promise<Asset | undefined> {
  if (await useApi()) {
    try {
      return await fetchApi<Asset>(`/assets/${assetId}`)
    } catch {
      return (mockAssets as Asset[]).find((asset) => asset.id === assetId)
    }
  }
  return (mockAssets as Asset[]).find((asset) => asset.id === assetId)
}

export async function fetchAssetsByProject(projectId: string): Promise<Asset[]> {
  if (await useApi()) {
    const apiAssets = await fetchApi<Asset[]>(`/assets?projectId=${encodeURIComponent(projectId)}`)
    if (apiAssets.length > 0) {
      return apiAssets
    }
    return (mockAssets as Asset[]).filter((asset) => asset.projectId === projectId)
  }
  return (mockAssets as Asset[]).filter((asset) => asset.projectId === projectId)
}
