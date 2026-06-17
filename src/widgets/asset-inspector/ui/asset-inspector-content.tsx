import { Copy, ExternalLink, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import type { Asset } from '@/entities/asset'
import { AssetCategoryIcon } from '@/entities/asset/ui/asset-category-icon'
import { AssetCategoryBadge, AssetStatusBadge } from '@/entities/asset'
import { formatDate } from '@/shared/lib/format-date'
import { getAssetStatusLabel } from '@/entities/asset/model/asset-mappers'
import { copyToClipboard } from '@/shared/lib/copy-to-clipboard'
import { APP_ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui/button'
import { MetadataRow } from '@/shared/ui/metadata-row'
import { Separator } from '@/shared/ui/separator'
import { TagBadge } from '@/shared/ui/tag-badge'
import { cn } from '@/shared/lib/cn'

interface AssetInspectorContentProps {
  asset: Asset
  relatedAssets?: Asset[]
  className?: string
  scrollClassName?: string
}

export function AssetInspectorContent({
  asset,
  relatedAssets = [],
  className,
  scrollClassName,
}: AssetInspectorContentProps) {
  const assetPath = asset.filePath ?? asset.externalUrl

  const handleCopyPath = async () => {
    if (!assetPath) {
      toast.error('복사할 경로가 없습니다.')
      return
    }

    const copied = await copyToClipboard(assetPath)
    if (copied) {
      toast.success('경로가 복사되었습니다.')
    } else {
      toast.error('경로 복사에 실패했습니다.')
    }
  }

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      <div className="border-b border-border/80 bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-accent text-accent-foreground">
            <AssetCategoryIcon category={asset.category} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">{asset.name}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <AssetStatusBadge status={asset.status} />
              <AssetCategoryBadge category={asset.category} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link to={APP_ROUTES.assetDetail.replace(':assetId', asset.id)} className="no-underline">
              <ExternalLink className="h-3.5 w-3.5" />
              자산 보기
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => void handleCopyPath()} disabled={!assetPath}>
            <Copy className="h-3.5 w-3.5" />
            경로 복사
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link
              to={APP_ROUTES.projectDetail.replace(':projectId', asset.projectId)}
              className="no-underline"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              프로젝트
            </Link>
          </Button>
        </div>
      </div>

      <div className={cn('overflow-y-auto overscroll-contain p-4', scrollClassName)}>
        <section aria-label="자산 메타데이터">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">메타데이터</h3>
          <div className="space-y-1">
            <MetadataRow label="프로젝트" value={asset.projectName} />
            <MetadataRow label="담당자" value={asset.owner} />
            <MetadataRow label="업데이트" value={formatDate(asset.updatedAt)} />
            <MetadataRow label="카테고리" value={<AssetCategoryBadge category={asset.category} />} />
            <MetadataRow label="검토 상태" value={getAssetStatusLabel(asset.status)} />
            <MetadataRow label="파일 경로" value={assetPath ?? '-'} mono />
          </div>
        </section>

        <Separator className="my-4" />

        <section aria-label="태그">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">태그</h3>
          {asset.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {asset.tags.map((tag) => (
                <TagBadge key={tag}>{tag}</TagBadge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">태그 없음</p>
          )}
        </section>

        {relatedAssets.length > 0 ? (
          <>
            <Separator className="my-4" />
            <section aria-label="관련 자산">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">관련 자산</h3>
              <ul className="space-y-2">
                {relatedAssets.map((relatedAsset) => (
                  <li key={relatedAsset.id}>
                    <Link
                      to={APP_ROUTES.assetDetail.replace(':assetId', relatedAsset.id)}
                      className="block truncate rounded-md px-2 py-1.5 text-sm text-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {relatedAsset.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}
