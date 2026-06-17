import type { Asset } from '@/entities/asset'
import { AssetCategoryIcon } from '@/entities/asset/ui/asset-category-icon'
import { AssetCardQuickActions } from '@/entities/asset/ui/asset-card-quick-actions'
import { AssetCategoryBadge, AssetStatusBadge } from '@/entities/asset'
import { formatDate } from '@/shared/lib/format-date'
import { NoWrapText, TruncatedText } from '@/shared/ui/text'
import { TagBadge } from '@/shared/ui/tag-badge'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/cn'

interface SearchResultItemProps {
  asset: Asset
  selected?: boolean
  className?: string
}

export function SearchResultItem({ asset, selected, className }: SearchResultItemProps) {
  const visibleTags = asset.tags.slice(0, 2)
  const hiddenTagCount = asset.tags.length - visibleTags.length

  return (
    <TooltipProvider delayDuration={300}>
      <article
        className={cn(
          'group relative flex gap-3 rounded-lg border border-border/70 bg-card px-3 py-2.5 text-left transition-[border-color,box-shadow,background-color] sm:px-3.5 sm:py-3',
          selected
            ? 'border-primary/50 bg-primary-muted/50 shadow-sm ring-1 ring-primary/20'
            : 'hover:border-border hover:bg-accent/25',
          className,
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-accent text-accent-foreground transition-colors sm:h-10 sm:w-10 sm:rounded-lg',
            selected && 'border-primary/20 bg-primary/10 text-primary',
          )}
        >
          <AssetCategoryIcon category={asset.category} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <TruncatedText
                text={asset.name}
                className="text-sm font-semibold leading-snug text-foreground"
              />
              <p className="mt-0.5 min-w-0 truncate text-xs text-muted-foreground [word-break:keep-all]">
                {asset.projectName}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <AssetStatusBadge status={asset.status} />
              <AssetCardQuickActions asset={asset} />
            </div>
          </div>

          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <NoWrapText truncate className="max-w-[120px] sm:max-w-[140px]">
              {asset.owner}
            </NoWrapText>
            <span aria-hidden className="text-border/80">
              ·
            </span>
            <NoWrapText>{formatDate(asset.updatedAt)}</NoWrapText>
            {asset.extension ? (
              <>
                <span aria-hidden className="text-border/80">
                  ·
                </span>
                <NoWrapText mono>{asset.extension}</NoWrapText>
              </>
            ) : null}
          </div>

          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1">
            <AssetCategoryBadge category={asset.category} />
            {visibleTags.map((tag) => (
              <TagBadge key={tag} className="max-w-[96px] truncate">
                {tag}
              </TagBadge>
            ))}
            {hiddenTagCount > 0 ? (
              <TagBadge className="border-dashed bg-transparent">+{hiddenTagCount}</TagBadge>
            ) : null}
          </div>
        </div>
      </article>
    </TooltipProvider>
  )
}
