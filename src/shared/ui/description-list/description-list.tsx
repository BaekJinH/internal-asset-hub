import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface DescriptionItem {
  label: string
  value: ReactNode
}

interface DescriptionListProps {
  items: DescriptionItem[]
  className?: string
}

export function DescriptionList({ items, className }: DescriptionListProps) {
  return (
    <dl className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
