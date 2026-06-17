import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

interface FilterSelectOption {
  value: string
  label: string
}

const toolbarTriggerClassName = 'shrink-0'

interface FilterSelectProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: FilterSelectOption[]
  placeholder?: string
  icon?: LucideIcon
  className?: string
  triggerClassName?: string
  disabled?: boolean
  layout?: 'inline' | 'stacked'
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = '선택',
  icon: Icon,
  className,
  triggerClassName,
  disabled,
  layout = 'stacked',
}: FilterSelectProps) {
  const isInline = layout === 'inline'

  return (
    <div
      className={cn(
        isInline ? 'inline-flex shrink-0 items-center' : 'flex flex-col gap-1.5',
        className,
      )}
    >
      <Label htmlFor={id} className={cn(isInline && 'sr-only')}>
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          size="sm"
          className={cn(isInline && toolbarTriggerClassName, triggerClassName)}
        >
          {Icon ? (
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : null}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
