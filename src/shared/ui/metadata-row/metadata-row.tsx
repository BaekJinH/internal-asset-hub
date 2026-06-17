import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

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
    'text-sm text-foreground',
    mono && 'break-all font-mono text-xs leading-relaxed text-muted-foreground',
    nowrap && 'whitespace-nowrap tabular-nums',
    !mono && !nowrap && 'min-w-0 truncate',
  )

  if (layout === 'inline') {
    return (
      <div className={cn('grid grid-cols-[88px_minmax(0,1fr)] items-start gap-x-3 gap-y-0.5', className)}>
        <dt className="whitespace-nowrap pt-0.5 text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className={valueClassName}>{value}</dd>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <dt className="whitespace-nowrap text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={valueClassName}>{value}</dd>
    </div>
  )
}
