import type { AssetSearchFilters } from '@/features/asset-search'
import { FilterToolbar } from '@/shared/ui/filter-toolbar'

interface SearchFilterPanelProps {
  filters: AssetSearchFilters
  onChange: (filters: AssetSearchFilters) => void
}

export function SearchFilterPanel({ filters, onChange }: SearchFilterPanelProps) {
  return <FilterToolbar filters={filters} onChange={onChange} />
}
