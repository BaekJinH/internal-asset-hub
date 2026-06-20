import { cva, type VariantProps } from 'class-variance-authority'
import { createElement, type HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

const headingVariants = cva('text-foreground', {
  variants: {
    variant: {
      page: 'text-2xl font-semibold tracking-tight',
      section: 'text-lg font-semibold tracking-tight',
      card: 'text-base font-semibold leading-none tracking-tight',
      subsection: 'text-sm font-semibold tracking-tight',
    },
  },
  defaultVariants: {
    variant: 'section',
  },
})

const defaultElement: Record<NonNullable<VariantProps<typeof headingVariants>['variant']>, 'h1' | 'h2' | 'h3' | 'h4'> = {
  page: 'h1',
  section: 'h2',
  card: 'h3',
  subsection: 'h4',
}

export interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
}

export function Heading({ className, variant = 'section', as, children, ...props }: HeadingProps) {
  const resolvedVariant = variant ?? 'section'
  const element = as ?? defaultElement[resolvedVariant]

  return createElement(
    element,
    { className: cn(headingVariants({ variant: resolvedVariant }), className), ...props },
    children,
  )
}
