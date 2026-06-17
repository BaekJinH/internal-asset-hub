import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PanelRightOpen, PlusCircle } from 'lucide-react'
import { mockAssets } from '@/shared/mocks/mock-assets'
import { mockProjects } from '@/shared/mocks/mock-projects'
import { useAssetSearch, AssetSearchInput } from '@/features/asset-search'
import { SearchFilterPanel } from '@/widgets/search-filter'
import { buildActiveFilterChips, clearAllFilters } from '@/widgets/search-filter/lib/build-active-filter-chips'
import { SearchResults } from '@/widgets/search-results'
import { AssetInspectorPanel, AssetInspectorSheet } from '@/widgets/asset-inspector'
import { SearchCommandPalette } from '@/widgets/search-command-palette'
import { PageHeader } from '@/shared/ui/page-header'
import { SectionHeader } from '@/shared/ui/section-header'
import { ActiveFilterChips } from '@/shared/ui/active-filter-chips'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { APP_ROUTES } from '@/shared/config/routes'
import { useMediaQuery } from '@/shared/lib/use-media-query'
import type { Asset } from '@/entities/asset'
import type { Project } from '@/entities/project'

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

  const handleSelectAsset = useCallback(
    (assetId: string) => {
      setSelectedAssetId(assetId)
      if (!isDesktop) {
        setInspectorOpen(true)
      }
    },
    [isDesktop],
  )

  return (
    <div className="flex flex-col gap-4 pb-24 md:gap-6 xl:pb-0">
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

      <Card className="space-y-3 border-border/80 p-4 shadow-sm">
        <AssetSearchInput value={query} onChange={setQuery} />
        <SearchFilterPanel filters={filters} onChange={setFilters} />
        <ActiveFilterChips
          chips={activeFilterChips}
          onClearAll={activeFilterChips.length > 0 ? () => clearAllFilters(setFilters) : undefined}
        />
      </Card>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0">
          <SectionHeader
            title="검색 결과"
            description={isLoading ? '검색 중…' : `${results.length}개의 자산이 검색되었습니다.`}
            actions={
              !isLoading && results.length > 0 ? (
                <Badge tone="default" className="font-normal">
                  {results.length}건
                </Badge>
              ) : null
            }
          />
          <SearchResults
            assets={results}
            selectedAssetId={selectedAsset?.id}
            onSelectAsset={handleSelectAsset}
            isLoading={isLoading}
          />
        </section>

        <aside className="hidden min-w-0 xl:block xl:sticky xl:top-[calc(var(--header-height)+1rem)] xl:self-start">
          <SectionHeader title="인스펙터" description="선택한 자산의 상세 정보" />
          <AssetInspectorPanel asset={selectedAsset} relatedAssets={relatedAssets} />
        </aside>
      </div>

      {!isDesktop && selectedAsset ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 xl:hidden">
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
