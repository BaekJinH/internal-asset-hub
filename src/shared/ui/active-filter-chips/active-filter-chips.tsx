import { X } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'

export interface ActiveFilterChip {
  id: string
  label: string
  onRemove: () => void
}

interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[]
  onClearAll?: () => void
  className?: string
}

export function ActiveFilterChips({ chips, onClearAll, className }: ActiveFilterChipsProps) {
  if (chips.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-xs font-medium text-muted-foreground">적용된 필터</span>
      {chips.map((chip) => (
        <Badge
          key={chip.id}
          tone="default"
          className="gap-1 pr-1 font-normal"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${chip.label} 필터 제거`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {onClearAll ? (
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onClearAll}>
          모두 지우기
        </Button>
      ) : null}
    </div>
  )
}
