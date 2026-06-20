import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Text } from '@/shared/ui/typography'

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
    <dl className={cn('grid gap-stack-sm sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <Text as="dt" size="label" tone="muted">
            {item.label}
          </Text>
          <Text as="dd" size="body">
            {item.value}
          </Text>
        </div>
      ))}
    </dl>
  )
}
