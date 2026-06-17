import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Asset } from '@/entities/asset/model/asset-types'
import { AssetCategoryIcon } from '@/entities/asset/ui/asset-category-icon'
import { AssetCardQuickActions } from '@/entities/asset/ui/asset-card-quick-actions'
import { AssetCategoryBadge } from '@/entities/asset/ui/asset-category-badge'
import { AssetStatusBadge } from '@/entities/asset/ui/asset-status-badge'
import { formatDate } from '@/shared/lib/format-date'
import { APP_ROUTES } from '@/shared/config/routes'
import { Card } from '@/shared/ui/card'
import { TagBadge } from '@/shared/ui/tag-badge'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/cn'

interface AssetCardProps {
  asset: Asset
  className?: string
  interactive?: boolean
  selected?: boolean
  showQuickActions?: boolean
}

export function AssetCard({
  asset,
  className,
  interactive,
  selected,
  showQuickActions = true,
}: AssetCardProps) {
  const visibleTags = asset.tags.slice(0, 3)
  const hiddenTagCount = asset.tags.length - visibleTags.length

  return (
    <TooltipProvider delayDuration={300}>
      <Card
        interactive={interactive}
        className={cn(
          'group relative overflow-hidden p-0 text-left transition-[border-color,box-shadow,background-color]',
          selected
            ? 'border-primary/50 bg-primary-muted/60 shadow-sm ring-1 ring-primary/20'
            : interactive && 'hover:border-border hover:bg-accent/30',
          className,
        )}
      >
        <div className="flex gap-3 p-4">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-accent text-accent-foreground transition-colors',
              selected && 'border-primary/20 bg-primary/10 text-primary',
            )}
          >
            <AssetCategoryIcon category={asset.category} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold leading-snug text-foreground">{asset.name}</h3>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{asset.projectName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <AssetStatusBadge status={asset.status} />
                {interactive && showQuickActions ? <AssetCardQuickActions asset={asset} /> : null}
                {interactive && !showQuickActions ? (
                  <Link
                    to={APP_ROUTES.assetDetail.replace(':assetId', asset.id)}
                    aria-label={`${asset.name} 상세 보기`}
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-accent hover:text-accent-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 group-focus-within:opacity-100 no-underline"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{asset.owner}</span>
              <span aria-hidden className="text-border">
                ·
              </span>
              <span>{formatDate(asset.updatedAt)}</span>
              {asset.extension ? (
                <>
                  <span aria-hidden className="text-border">
                    ·
                  </span>
                  <span className="uppercase">{asset.extension}</span>
                </>
              ) : null}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <AssetCategoryBadge category={asset.category} />
              {visibleTags.map((tag) => (
                <TagBadge key={tag}>{tag}</TagBadge>
              ))}
              {hiddenTagCount > 0 ? (
                <TagBadge className="border-dashed bg-transparent">+{hiddenTagCount}</TagBadge>
              ) : null}
            </div>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  )
}
