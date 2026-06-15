import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-primary',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
