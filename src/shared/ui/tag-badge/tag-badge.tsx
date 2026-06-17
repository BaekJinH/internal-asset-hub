import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface TagBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  prefix?: string
}

export function TagBadge({ className, prefix = '#', children, ...props }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-[7.5rem] shrink-0 items-center whitespace-nowrap rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground',
        className,
      )}
      {...props}
    >
      <span className="shrink-0">{prefix}</span>
      <span className="shrink-0 truncate [word-break:keep-all]">{children}</span>
    </span>
  )
}
