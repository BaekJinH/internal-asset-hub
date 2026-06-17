import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden /> : null}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-muted-foreground no-underline transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function BreadcrumbPage({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cn('text-base font-semibold tracking-tight text-foreground', className)}>{children}</h1>
}
