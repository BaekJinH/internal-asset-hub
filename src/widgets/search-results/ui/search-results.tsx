import type { Asset } from '@/entities/asset'
import { AssetCard } from '@/entities/asset'
import { EmptyState } from '@/shared/ui/empty-state'

interface SearchResultsProps {
  assets: Asset[]
  selectedAssetId?: string
  onSelectAsset?: (assetId: string) => void
}

export function SearchResults({ assets, selectedAssetId, onSelectAsset }: SearchResultsProps) {
  if (assets.length === 0) {
    return <EmptyState title="검색 결과 없음" description="조건을 변경해 다시 검색해 주세요." />
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {assets.map((asset) => (
        <button
          key={asset.id}
          type="button"
          onClick={() => onSelectAsset?.(asset.id)}
          className={asset.id === selectedAssetId ? 'rounded-xl ring-2 ring-primary' : ''}
        >
          <AssetCard asset={asset} />
        </button>
      ))}
    </div>
  )
}
