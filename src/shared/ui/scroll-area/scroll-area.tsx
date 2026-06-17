import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  maxHeight?: string
}

export function ScrollArea({ className, maxHeight, style, children, ...props }: ScrollAreaProps) {
  return (
    <div
      className={cn('overflow-y-auto overscroll-contain', className)}
      style={{ maxHeight, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
