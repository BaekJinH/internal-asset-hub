import type { AssetSearchFilters } from '@/features/asset-search'
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '@/entities/asset'
import type { ActiveFilterChip } from '@/shared/ui/active-filter-chips'

export function buildActiveFilterChips(
  filters: AssetSearchFilters,
  onChange: (filters: AssetSearchFilters) => void,
  projects: Array<{ id: string; name: string }> = [],
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  if (filters.project !== 'all') {
    const project = projects.find((item) => item.id === filters.project)
    chips.push({
      id: 'project',
      label: project?.name ?? filters.project,
      onRemove: () => onChange({ ...filters, project: 'all' }),
    })
  }

  if (filters.category !== 'all') {
    chips.push({
      id: 'category',
      label: ASSET_CATEGORY_LABELS[filters.category as keyof typeof ASSET_CATEGORY_LABELS] ?? filters.category,
      onRemove: () => onChange({ ...filters, category: 'all' }),
    })
  }

  if (filters.status !== 'all') {
    chips.push({
      id: 'status',
      label: ASSET_STATUS_LABELS[filters.status as keyof typeof ASSET_STATUS_LABELS] ?? filters.status,
      onRemove: () => onChange({ ...filters, status: 'all' }),
    })
  }

  if (filters.owner.trim()) {
    chips.push({
      id: 'owner',
      label: `담당자: ${filters.owner}`,
      onRemove: () => onChange({ ...filters, owner: '' }),
    })
  }

  if (filters.tags.trim()) {
    chips.push({
      id: 'tags',
      label: `태그: ${filters.tags}`,
      onRemove: () => onChange({ ...filters, tags: '' }),
    })
  }

  if (filters.date) {
    chips.push({
      id: 'date',
      label: `날짜: ${filters.date}`,
      onRemove: () => onChange({ ...filters, date: '' }),
    })
  }

  return chips
}

export function clearAllFilters(onChange: (filters: AssetSearchFilters) => void) {
  onChange({
    project: 'all',
    category: 'all',
    owner: '',
    status: 'all',
    date: '',
    tags: '',
  })
}
