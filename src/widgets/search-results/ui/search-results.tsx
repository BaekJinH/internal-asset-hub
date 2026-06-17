import { Search, SearchX } from 'lucide-react'
import type { Asset } from '@/entities/asset'
import { SearchResultItem } from '@/widgets/search-results/ui/search-result-item'
import { EmptyState } from '@/shared/ui/empty-state'
import { SearchResultsSkeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/cn'

interface SearchResultsProps {
  assets: Asset[]
  selectedAssetId?: string
  onSelectAsset?: (assetId: string) => void
  isLoading?: boolean
  hasActiveSearch?: boolean
  className?: string
}

export function SearchResults({
  assets,
  selectedAssetId,
  onSelectAsset,
  isLoading = false,
  hasActiveSearch = false,
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
        description={
          hasActiveSearch
            ? '검색어나 필터 조건을 변경해 다시 시도해 주세요.'
            : '등록된 자산이 없습니다. 자산을 등록한 뒤 다시 검색해 보세요.'
        }
        className={className}
      />
    )
  }

  return (
    <div
      role="listbox"
      aria-label="검색 결과"
      aria-busy={isLoading}
      className={cn('flex flex-col gap-1.5', className)}
    >
      {!hasActiveSearch ? (
        <div className="mb-1 flex items-center gap-2 rounded-md border border-dashed border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>검색어를 입력하거나 필터를 적용해 자산을 빠르게 찾아보세요.</span>
        </div>
      ) : null}

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
            <SearchResultItem asset={asset} selected={isSelected} />
          </div>
        )
      })}
    </div>
  )
}
