import type { Asset } from '@/entities/asset/model/asset-types'
import { AssetCategoryBadge } from '@/entities/asset/ui/asset-category-badge'
import { AssetStatusBadge } from '@/entities/asset/ui/asset-status-badge'
import { formatDate } from '@/shared/lib/format-date'
import { Card } from '@/shared/ui/card'

interface AssetCardProps {
  asset: Asset
}

export function AssetCard({ asset }: AssetCardProps) {
  return (
    <Card className="space-y-2">
      <h3 className="text-base font-semibold">{asset.name}</h3>
      <p className="text-sm text-text-secondary">{asset.projectName}</p>
      <div className="flex flex-wrap gap-2">
        <AssetCategoryBadge category={asset.category} />
        <AssetStatusBadge status={asset.status} />
      </div>
      <p className="text-sm">담당자: {asset.owner}</p>
      <p className="text-xs text-text-secondary">업데이트: {formatDate(asset.updatedAt)}</p>
      <div className="flex flex-wrap gap-1 text-xs">
        {asset.tags.map((tag) => (
          <span key={tag} className="rounded bg-slate-100 px-2 py-1">#{tag}</span>
        ))}
      </div>
    </Card>
  )
}
