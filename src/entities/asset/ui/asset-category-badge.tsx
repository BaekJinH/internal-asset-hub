import type { AssetCategory } from '@/entities/asset/model/asset-types'
import { getAssetCategoryLabel } from '@/entities/asset/model/asset-mappers'
import { Badge } from '@/shared/ui/badge'

interface AssetCategoryBadgeProps {
  category: AssetCategory
}

export function AssetCategoryBadge({ category }: AssetCategoryBadgeProps) {
  return <Badge tone="info">{getAssetCategoryLabel(category)}</Badge>
}
