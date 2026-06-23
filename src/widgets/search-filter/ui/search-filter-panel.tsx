import type { AssetSearchFilters } from '@/features/asset-search'
import { FilterToolbar } from '@/shared/ui/filter-toolbar'

interface SearchFilterPanelProps {
  filters: AssetSearchFilters
  onChange: (filters: AssetSearchFilters) => void
  projects?: Array<{ id: string; name: string }>
  variant?: 'card' | 'inline'
  className?: string
}

export function SearchFilterPanel({
  filters,
  onChange,
  projects,
  variant = 'card',
  className,
}: SearchFilterPanelProps) {
  return (
    <FilterToolbar
      filters={filters}
      onChange={onChange}
      projects={projects}
      variant={variant}
      className={className}
    />
  )
}
