import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

const badgeVariants = cva(
  'inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-none transition-colors',
  {
    variants: {
      tone: {
        default: 'border-border/60 bg-muted text-foreground',
        success: 'border-transparent bg-success-muted text-success-foreground',
        warning: 'border-transparent bg-warning-muted text-warning-foreground',
        danger: 'border-transparent bg-danger-muted text-danger-foreground',
        info: 'border-transparent bg-info-muted text-info-foreground',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
