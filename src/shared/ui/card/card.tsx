import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-xl border border-border bg-surface p-4', className)} {...props} />
}
