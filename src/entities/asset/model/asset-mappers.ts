import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '@/entities/asset/model/asset-constants'
import type { AssetCategory, AssetStatus } from '@/entities/asset/model/asset-types'

export function getAssetCategoryLabel(category: AssetCategory) {
  return ASSET_CATEGORY_LABELS[category]
}

export function getAssetStatusLabel(status: AssetStatus) {
  return ASSET_STATUS_LABELS[status]
}
