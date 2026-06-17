import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'a'
  href?: string
}

export function Tag({ className, as = 'span', href, children, ...props }: TagProps) {
  const classes = cn(
    'inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium leading-none text-foreground transition-colors hover:bg-accent',
    className,
  )

  if (as === 'a' && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(classes, 'no-underline')}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
