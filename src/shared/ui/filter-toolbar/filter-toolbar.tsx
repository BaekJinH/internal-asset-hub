import { CircleDot, FolderKanban, Layers, ListFilter, SlidersHorizontal, User } from 'lucide-react'
import type { AssetSearchFilters } from '@/features/asset-search'
import { ASSET_CATEGORY_LABELS, ASSET_STATUS_LABELS } from '@/entities/asset'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { FilterSelect } from '@/shared/ui/filter-select'
import { Input } from '@/shared/ui/input'
import { InputGroup, InputGroupIcon, InputGroupInput } from '@/shared/ui/input/input-group'
import { Label } from '@/shared/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/cn'

interface FilterToolbarProps {
  filters: AssetSearchFilters
  onChange: (filters: AssetSearchFilters) => void
  projects?: Array<{ id: string; name: string }>
  className?: string
  variant?: 'card' | 'inline'
}

export function FilterToolbar({
  filters,
  onChange,
  projects = [],
  className,
  variant = 'card',
}: FilterToolbarProps) {
  const hasAdvancedFilters = Boolean(filters.owner || filters.tags || filters.date)
  const hasActiveFilters =
    filters.project !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    hasAdvancedFilters

  const handleReset = () => {
    onChange({
      project: 'all',
      category: 'all',
      owner: '',
      status: 'all',
      date: '',
      tags: '',
    })
  }

  return (
    <div
      className={cn(
        variant === 'card' && 'rounded-lg border border-border bg-card p-3 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-9 shrink-0 items-center gap-1.5 text-muted-foreground">
          <ListFilter className="size-4 shrink-0" aria-hidden />
          <span className="hidden text-xs font-medium sm:inline">필터</span>
        </div>

        <FilterSelect
          layout="inline"
          id="filter-project"
          label="프로젝트"
          icon={FolderKanban}
          value={filters.project}
          onChange={(value) => onChange({ ...filters, project: value })}
          options={[
            { value: 'all', label: '전체 프로젝트' },
            ...projects.map((project) => ({ value: project.id, label: project.name })),
          ]}
          triggerClassName="w-[9.5rem] sm:w-[10.5rem]"
        />

        <FilterSelect
          layout="inline"
          id="filter-category"
          label="카테고리"
          icon={Layers}
          value={filters.category}
          onChange={(value) => onChange({ ...filters, category: value })}
          options={[
            { value: 'all', label: '전체 카테고리' },
            ...Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
          ]}
          triggerClassName="w-[8.5rem] sm:w-[9.5rem]"
        />

        <FilterSelect
          layout="inline"
          id="filter-status"
          label="상태"
          icon={CircleDot}
          value={filters.status}
          onChange={(value) => onChange({ ...filters, status: value })}
          options={[
            { value: 'all', label: '전체 상태' },
            ...Object.entries(ASSET_STATUS_LABELS).map(([value, label]) => ({ value, label })),
          ]}
          triggerClassName="w-[7.5rem] sm:w-[8.5rem]"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={hasAdvancedFilters ? 'secondary' : 'outline'}
              size="sm"
              className="h-9 shrink-0 gap-2"
            >
              <SlidersHorizontal className="size-4 shrink-0" />
              상세 필터
              {hasAdvancedFilters ? (
                <Badge tone="info" className="size-5 shrink-0 justify-center rounded-full p-0 text-[10px] leading-none">
                  {Number(Boolean(filters.owner)) +
                    Number(Boolean(filters.tags)) +
                    Number(Boolean(filters.date))}
                </Badge>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">상세 필터</p>
                <p className="text-xs text-muted-foreground">담당자, 태그, 날짜로 검색 범위를 좁혀 보세요.</p>
              </div>
              <Separator />
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="filter-owner">담당자</Label>
                  <InputGroup>
                    <InputGroupIcon>
                      <User aria-hidden />
                    </InputGroupIcon>
                    <InputGroupInput
                      id="filter-owner"
                      value={filters.owner}
                      onChange={(event) => onChange({ ...filters, owner: event.target.value })}
                      placeholder="담당자 이름"
                    />
                  </InputGroup>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="filter-tags">태그</Label>
                  <Input
                    id="filter-tags"
                    value={filters.tags}
                    onChange={(event) => onChange({ ...filters, tags: event.target.value })}
                    placeholder="태그 입력"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="filter-date">업데이트 날짜</Label>
                  <Input
                    id="filter-date"
                    type="date"
                    value={filters.date}
                    onChange={(event) => onChange({ ...filters, date: event.target.value })}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters ? (
          <Button type="button" variant="ghost" size="sm" className="h-9 shrink-0" onClick={handleReset}>
            초기화
          </Button>
        ) : null}
      </div>
    </div>
  )
}
