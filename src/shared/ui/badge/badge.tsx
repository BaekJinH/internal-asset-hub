import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const TONE_CLASS_MAP = {
  default: 'bg-slate-100 text-text-primary',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
} as const

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold', TONE_CLASS_MAP[tone], className)}
      {...props}
    />
  )
}
