import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Text } from '@/shared/ui/typography'

interface MetadataRowProps {
  label: string
  value: ReactNode
  mono?: boolean
  nowrap?: boolean
  layout?: 'stacked' | 'inline'
  className?: string
}

export function MetadataRow({
  label,
  value,
  mono,
  nowrap,
  layout = 'stacked',
  className,
}: MetadataRowProps) {
  const valueClassName = cn(
    mono && 'break-all font-mono text-xs leading-relaxed text-muted-foreground',
    nowrap && 'whitespace-nowrap tabular-nums',
    !mono && !nowrap && 'min-w-0 truncate',
  )

  if (layout === 'inline') {
    return (
      <div className={cn('grid grid-cols-[88px_minmax(0,1fr)] items-start gap-x-3 gap-y-0.5', className)}>
        <Text as="dt" size="label" tone="muted" className="whitespace-nowrap pt-0.5">
          {label}
        </Text>
        <Text as="dd" size="body" className={valueClassName}>
          {value}
        </Text>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Text as="dt" size="label" tone="muted" className="whitespace-nowrap">
        {label}
      </Text>
      <Text as="dd" size="body" className={valueClassName}>
        {value}
      </Text>
    </div>
  )
}
