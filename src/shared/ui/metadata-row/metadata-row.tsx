import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface MetadataRowProps {
  label: string
  value: ReactNode
  mono?: boolean
  nowrap?: boolean
  className?: string
}

export function MetadataRow({ label, value, mono, nowrap, className }: MetadataRowProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <dt className="whitespace-nowrap text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'text-sm text-foreground',
          mono && 'break-all font-mono text-xs leading-relaxed text-muted-foreground',
          nowrap && 'whitespace-nowrap tabular-nums',
          !mono && !nowrap && 'min-w-0 truncate',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
