import type { HTMLAttributes, ReactNode } from 'react'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/cn'

interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function PageShell({ className, children, ...props }: PageShellProps) {
  return (
    <div className={cn('flex flex-col gap-8', className)} {...props}>
      {children}
    </div>
  )
}

interface PageShellSkeletonProps {
  title: string
  description?: string
  blocks?: number
}

export function PageShellSkeleton({ title, description, blocks = 2 }: PageShellSkeletonProps) {
  return (
    <PageShell>
      <PageHeader title={title} description={description} />
      <div className="flex flex-col gap-6">
        <Skeleton className="h-24 w-full" />
        {Array.from({ length: blocks }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </PageShell>
  )
}
