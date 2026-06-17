import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PanelRightOpen, PlusCircle } from 'lucide-react'
import { mockAssets } from '@/shared/mocks/mock-assets'
import { mockProjects } from '@/shared/mocks/mock-projects'
import { useAssetSearch } from '@/features/asset-search'
import { buildActiveFilterChips, clearAllFilters } from '@/widgets/search-filter/lib/build-active-filter-chips'
import { SearchResults } from '@/widgets/search-results'
import { AssetInspectorPanel, AssetInspectorSheet } from '@/widgets/asset-inspector'
import { SearchCommandPalette } from '@/widgets/search-command-palette'
import { SearchWorkspace } from '@/widgets/search-workspace'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { APP_ROUTES } from '@/shared/config/routes'
import { useMediaQuery } from '@/shared/lib/use-media-query'
import type { Asset } from '@/entities/asset'
import type { Project } from '@/entities/project'

function hasActiveSearchState(query: string, filters: ReturnType<typeof useAssetSearch>['filters']) {
  return (
    query.trim().length > 0 ||
    filters.project !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    Boolean(filters.owner.trim()) ||
    Boolean(filters.tags.trim()) ||
    Boolean(filters.date)
  )
}

export function SearchPage() {
  const assets = mockAssets as Asset[]
  const projects = mockProjects as Project[]
  const { query, setQuery, filters, setFilters, results, isLoading } = useAssetSearch(assets)
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>()
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1280px)')

  const selectedAsset = useMemo(
    () => results.find((asset) => asset.id === selectedAssetId) ?? results[0],
    [results, selectedAssetId],
  )
  const relatedAssets = useMemo(() => {
    if (!selectedAsset) {
      return []
    }

    return selectedAsset.relatedAssetIds
      .map((id) => assets.find((asset) => asset.id === id))
      .filter((asset): asset is Asset => Boolean(asset))
  }, [assets, selectedAsset])
  const activeFilterChips = useMemo(
    () => buildActiveFilterChips(filters, setFilters),
    [filters, setFilters],
  )
  const hasActiveSearch = hasActiveSearchState(query, filters)

  const handleSelectAsset = useCallback(
    (assetId: string) => {
      setSelectedAssetId(assetId)
      if (!isDesktop) {
        setInspectorOpen(true)
      }
    },
    [isDesktop],
  )

  const resultsDescription = isLoading
    ? '검색 중…'
    : hasActiveSearch
      ? `${results.length}개의 자산이 검색되었습니다.`
      : `전체 ${results.length}개 자산 · 검색어나 필터로 좁혀 보세요`

  return (
    <div className="flex flex-col gap-5 pb-24 xl:gap-6 xl:pb-0">
      <PageHeader
        title="통합 검색"
        description="자산, 프로젝트, 태그, 경로를 한곳에서 검색하고 바로 확인하세요."
        actions={
          <div className="flex items-center gap-2">
            <SearchCommandPalette assets={assets} projects={projects} onSelectAsset={handleSelectAsset} />
            <Button variant="outline" size="sm" asChild>
              <Link to={APP_ROUTES.assetNew} className="no-underline">
                <PlusCircle className="h-4 w-4" />
                자산 등록
              </Link>
            </Button>
          </div>
        }
      />

      <SearchWorkspace
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={setFilters}
        activeFilterChips={activeFilterChips}
        onClearAllFilters={activeFilterChips.length > 0 ? () => clearAllFilters(setFilters) : undefined}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
        <section className="min-w-0 xl:col-span-8">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2 xl:mb-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">검색 결과</h2>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{resultsDescription}</p>
            </div>
            {!isLoading && results.length > 0 ? (
              <Badge tone="default" className="shrink-0 font-normal tabular-nums">
                {results.length}건
              </Badge>
            ) : null}
          </div>
          <SearchResults
            assets={results}
            selectedAssetId={selectedAsset?.id}
            onSelectAsset={handleSelectAsset}
            isLoading={isLoading}
            hasActiveSearch={hasActiveSearch}
          />
        </section>

        <aside className="hidden min-w-0 xl:col-span-4 xl:block">
          <div className="sticky top-[calc(var(--header-height)+1.25rem)] flex flex-col gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">인스펙터</h2>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {selectedAsset ? selectedAsset.name : '선택한 자산의 상세 정보'}
              </p>
            </div>
            <AssetInspectorPanel asset={selectedAsset} relatedAssets={relatedAssets} />
          </div>
        </aside>
      </div>

      {!isDesktop && selectedAsset ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background p-3 xl:hidden">
          <Button className="w-full" onClick={() => setInspectorOpen(true)}>
            <PanelRightOpen className="h-4 w-4" />
            <span className="truncate">{selectedAsset.name} 상세 보기</span>
          </Button>
        </div>
      ) : null}

      <AssetInspectorSheet
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        asset={selectedAsset}
        relatedAssets={relatedAssets}
      />
    </div>
  )
}
