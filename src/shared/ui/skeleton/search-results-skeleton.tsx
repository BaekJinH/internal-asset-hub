import { Skeleton } from '@/shared/ui/skeleton'

export function SearchResultItemSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg border border-border/70 bg-card px-3 py-2.5 sm:px-3.5 sm:py-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-md sm:h-10 sm:w-10 sm:rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="mt-1.5 h-3 w-2/5" />
          </div>
          <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-3 w-1/2" />
        <div className="mt-2 flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/** @deprecated Use SearchResultItemSkeleton */
export function AssetCardSkeleton() {
  return <SearchResultItemSkeleton />
}

export function SearchResultsSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-1.5" aria-hidden>
        {Array.from({ length: count }).map((_, index) => (
          <SearchResultItemSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
