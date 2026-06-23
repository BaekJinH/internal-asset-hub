import type { AssetSearchFilters } from '@/features/asset-search'
import { AssetSearchInput } from '@/features/asset-search'
import { SearchFilterPanel } from '@/widgets/search-filter'
import type { ActiveFilterChip } from '@/shared/ui/active-filter-chips'
import { ActiveFilterChips } from '@/shared/ui/active-filter-chips'
import { Card, CardContent } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/cn'

interface SearchWorkspaceProps {
  query: string
  onQueryChange: (value: string) => void
  filters: AssetSearchFilters
  onFiltersChange: (filters: AssetSearchFilters) => void
  activeFilterChips: ActiveFilterChip[]
  projects?: Array<{ id: string; name: string }>
  onClearAllFilters?: () => void
  className?: string
}

export function SearchWorkspace({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  activeFilterChips,
  projects,
  onClearAllFilters,
  className,
}: SearchWorkspaceProps) {
  return (
    <Card className={cn('overflow-hidden p-0 shadow-sm', className)}>
      <CardContent className="flex flex-col gap-0 p-0">
        <div className="border-b border-border px-4 py-4">
          <AssetSearchInput value={query} onChange={onQueryChange} showShortcut />
        </div>

        <div className="px-4 py-3">
          <SearchFilterPanel
            filters={filters}
            onChange={onFiltersChange}
            projects={projects}
            variant="inline"
          />
          {activeFilterChips.length > 0 ? (
            <>
              <Separator className="my-3" />
              <ActiveFilterChips chips={activeFilterChips} onClearAll={onClearAllFilters} />
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
