import type { AssetSearchFilters } from '@/features/asset-search'
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '@/entities/asset'
import { mockProjects } from '@/shared/mocks/mock-projects'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'

interface SearchFilterPanelProps {
  filters: AssetSearchFilters
  onChange: (filters: AssetSearchFilters) => void
}

export function SearchFilterPanel({ filters, onChange }: SearchFilterPanelProps) {
  return (
    <Card className="grid gap-2 md:grid-cols-3">
      <Select value={filters.project} onChange={(event) => onChange({ ...filters, project: event.target.value })}>
        <option value="all">전체 프로젝트</option>
        {mockProjects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </Select>
      <Select value={filters.category} onChange={(event) => onChange({ ...filters, category: event.target.value })}>
        <option value="all">전체 카테고리</option>
        {Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Select value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value })}>
        <option value="all">전체 상태</option>
        {Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Input value={filters.owner} onChange={(event) => onChange({ ...filters, owner: event.target.value })} placeholder="담당자" />
      <Input value={filters.tags} onChange={(event) => onChange({ ...filters, tags: event.target.value })} placeholder="태그" />
      <Input type="date" value={filters.date} onChange={(event) => onChange({ ...filters, date: event.target.value })} />
    </Card>
  )
}
