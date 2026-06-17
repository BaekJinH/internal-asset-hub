import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import type { AssetSearchFilters } from '@/features/asset-search'
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '@/entities/asset'
import { mockProjects } from '@/shared/mocks/mock-projects'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { SimpleSelect } from '@/shared/ui/select'
import { cn } from '@/shared/lib/cn'

interface FilterToolbarProps {
  filters: AssetSearchFilters
  onChange: (filters: AssetSearchFilters) => void
  className?: string
}

export function FilterToolbar({ filters, onChange, className }: FilterToolbarProps) {
  const [expanded, setExpanded] = useState(false)
  const hasAdvancedFilters = Boolean(filters.owner || filters.tags || filters.date)

  return (
    <div
      className={cn(
        'rounded-lg border border-border/80 bg-card/60 p-3 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 pr-1 text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-xs font-medium">필터</span>
        </div>
        <SimpleSelect
          value={filters.project}
          onChange={(value) => onChange({ ...filters, project: value })}
          options={[
            { value: 'all', label: '전체 프로젝트' },
            ...mockProjects.map((project) => ({ value: project.id, label: project.name })),
          ]}
          className="h-9 w-auto min-w-[148px] border-border/60 bg-background text-sm"
        />
        <SimpleSelect
          value={filters.category}
          onChange={(value) => onChange({ ...filters, category: value })}
          options={[
            { value: 'all', label: '전체 카테고리' },
            ...Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
          ]}
          className="h-9 w-auto min-w-[132px] border-border/60 bg-background text-sm"
        />
        <SimpleSelect
          value={filters.status}
          onChange={(value) => onChange({ ...filters, status: value })}
          options={[
            { value: 'all', label: '전체 상태' },
            ...Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => ({ value, label })),
          ]}
          className="h-9 w-auto min-w-[120px] border-border/60 bg-background text-sm"
        />
        <Button
          type="button"
          variant={expanded || hasAdvancedFilters ? 'secondary' : 'ghost'}
          size="sm"
          className="h-9 text-xs"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? '간단히' : '상세 필터'}
          {hasAdvancedFilters && !expanded ? (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              !
            </span>
          ) : null}
        </Button>
      </div>
      {expanded ? (
        <div className="mt-3 grid gap-2 border-t border-border/60 pt-3 sm:grid-cols-3">
          <Input
            value={filters.owner}
            onChange={(event) => onChange({ ...filters, owner: event.target.value })}
            placeholder="담당자"
            className="h-9 border-border/60 bg-background text-sm"
          />
          <Input
            value={filters.tags}
            onChange={(event) => onChange({ ...filters, tags: event.target.value })}
            placeholder="태그"
            className="h-9 border-border/60 bg-background text-sm"
          />
          <Input
            type="date"
            value={filters.date}
            onChange={(event) => onChange({ ...filters, date: event.target.value })}
            className="h-9 border-border/60 bg-background text-sm"
          />
        </div>
      ) : null}
    </div>
  )
}
