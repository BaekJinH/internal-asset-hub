import { useMemo, useState } from 'react'
import { mockAssets } from '@/shared/mocks/mock-assets'
import { useAssetSearch, AssetSearchInput } from '@/features/asset-search'
import { SearchFilterPanel } from '@/widgets/search-filter'
import { SearchResults } from '@/widgets/search-results'
import { PageHeader } from '@/shared/ui/page-header'
import { Card } from '@/shared/ui/card'
import type { Asset } from '@/entities/asset'

export function SearchPage() {
  const assets = mockAssets as Asset[]
  const { query, setQuery, filters, setFilters, results } = useAssetSearch(assets)
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>()
  const selectedAsset = useMemo(
    () => results.find((asset) => asset.id === selectedAssetId) ?? results[0],
    [results, selectedAssetId],
  )

  return (
    <div className="space-y-4">
      <PageHeader title="통합 검색" description="자산, 프로젝트, 태그, 경로를 검색합니다." />
      <AssetSearchInput value={query} onChange={setQuery} />
      <SearchFilterPanel filters={filters} onChange={setFilters} />
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <SearchResults assets={results} selectedAssetId={selectedAsset?.id} onSelectAsset={setSelectedAssetId} />
        <Card className="space-y-2">
          <h2 className="text-base font-semibold">결과 미리보기</h2>
          {selectedAsset ? (
            <>
              <p className="text-sm font-semibold">{selectedAsset.name}</p>
              <p className="text-sm text-text-secondary">{selectedAsset.projectName}</p>
              <p className="text-sm">태그: {selectedAsset.tags.join(', ')}</p>
              <p className="text-sm">상태: {selectedAsset.status}</p>
              <p className="text-sm">담당자: {selectedAsset.owner}</p>
              <p className="text-sm text-text-secondary">{selectedAsset.filePath ?? selectedAsset.externalUrl ?? '-'}</p>
            </>
          ) : (
            <p className="text-sm text-text-secondary">선택된 검색 결과가 없습니다.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
