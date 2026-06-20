import { cva, type VariantProps } from 'class-variance-authority'
import { createElement, type HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

const textVariants = cva('', {
  variants: {
    size: {
      body: 'text-sm',
      caption: 'text-xs',
      label: 'text-xs font-medium',
      lead: 'text-sm leading-relaxed',
    },
    tone: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
      inherit: 'text-inherit',
    },
  },
  defaultVariants: {
    size: 'body',
    tone: 'default',
  },
})

export interface TextProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'dd' | 'dt' | 'div' | 'label'
}

export function Text({
  className,
  size = 'body',
  tone = 'default',
  as = 'p',
  children,
  ...props
}: TextProps) {
  return createElement(
    as,
    { className: cn(textVariants({ size, tone }), className), ...props },
    children,
  )
}
