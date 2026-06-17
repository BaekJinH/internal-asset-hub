import { SearchX } from 'lucide-react'
import type { Asset } from '@/entities/asset'
import { AssetCard } from '@/entities/asset'
import { EmptyState } from '@/shared/ui/empty-state'
import { SearchResultsSkeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/cn'

interface SearchResultsProps {
  assets: Asset[]
  selectedAssetId?: string
  onSelectAsset?: (assetId: string) => void
  isLoading?: boolean
  className?: string
}

export function SearchResults({
  assets,
  selectedAssetId,
  onSelectAsset,
  isLoading = false,
  className,
}: SearchResultsProps) {
  if (isLoading) {
    return <SearchResultsSkeleton className={className} />
  }

  if (assets.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="검색 결과 없음"
        description="검색어나 필터 조건을 변경해 다시 시도해 주세요."
        className={className}
      />
    )
  }

  return (
    <div
      role="listbox"
      aria-label="검색 결과"
      aria-busy={isLoading}
      className={cn('space-y-2', className)}
    >
      {assets.map((asset) => {
        const isSelected = asset.id === selectedAssetId

        return (
          <div
            key={asset.id}
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            onClick={() => onSelectAsset?.(asset.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectAsset?.(asset.id)
              }
            }}
            className="cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <AssetCard asset={asset} interactive selected={isSelected} />
          </div>
        )
      })}
    </div>
  )
}
