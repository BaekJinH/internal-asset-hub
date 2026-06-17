import type { AssetSearchFilters } from '@/features/asset-search'
import { FilterToolbar } from '@/shared/ui/filter-toolbar'

interface SearchFilterPanelProps {
  filters: AssetSearchFilters
  onChange: (filters: AssetSearchFilters) => void
  variant?: 'card' | 'inline'
  className?: string
}

export function SearchFilterPanel({ filters, onChange, variant = 'card', className }: SearchFilterPanelProps) {
  return <FilterToolbar filters={filters} onChange={onChange} variant={variant} className={className} />
}
