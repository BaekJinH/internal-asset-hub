import type { AssetStatus } from '@/entities/asset/model/asset-types'
import { getAssetStatusLabel } from '@/entities/asset/model/asset-mappers'
import { Badge } from '@/shared/ui/badge'

const ASSET_STATUS_TONE_MAP: Record<AssetStatus, 'default' | 'warning' | 'success' | 'info' | 'danger'> = {
  draft: 'default',
  review: 'warning',
  confirmed: 'success',
  archived: 'info',
  discarded: 'danger',
}

interface AssetStatusBadgeProps {
  status: AssetStatus
}

export function AssetStatusBadge({ status }: AssetStatusBadgeProps) {
  return <Badge tone={ASSET_STATUS_TONE_MAP[status]}>{getAssetStatusLabel(status)}</Badge>
}
