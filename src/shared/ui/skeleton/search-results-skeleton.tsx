import { Skeleton } from '@/shared/ui/skeleton'

export function AssetCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/80 bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SearchResultsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      <div className="space-y-2" aria-hidden>
        {Array.from({ length: count }).map((_, index) => (
          <AssetCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
