import { Copy, ExternalLink, FolderOpen, Type } from 'lucide-react'
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
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { TagBadge } from '@/shared/ui/tag-badge'
import { TruncatedText } from '@/shared/ui/text'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
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

  const handleCopy = async (value: string, successMessage: string, errorMessage = '복사에 실패했습니다.') => {
    const copied = await copyToClipboard(value)
    if (copied) {
      toast.success(successMessage)
    } else {
      toast.error(errorMessage)
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('flex min-h-0 flex-col', className)}>
        <div className="border-b border-border bg-card px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-accent text-accent-foreground">
              <AssetCategoryIcon category={asset.category} />
            </div>
            <div className="min-w-0 flex-1">
              <TruncatedText
                text={asset.name}
                className="text-base font-semibold leading-snug text-foreground"
              />
              <p className="mt-1 truncate text-xs text-muted-foreground [word-break:keep-all]">
                {asset.projectName}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <AssetStatusBadge status={asset.status} />
                <AssetCategoryBadge category={asset.category} />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button size="sm" asChild className="h-8">
              <Link to={APP_ROUTES.assetDetail.replace(':assetId', asset.id)} className="no-underline">
                <ExternalLink className="h-3.5 w-3.5" />
                자산 보기
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => void handleCopy(assetPath ?? '', '경로가 복사되었습니다.', '복사할 경로가 없습니다.')}
              disabled={!assetPath}
            >
              <Copy className="h-3.5 w-3.5" />
              경로 복사
            </Button>
            <Button size="sm" variant="outline" className="h-8" asChild>
              <Link
                to={APP_ROUTES.projectDetail.replace(':projectId', asset.projectId)}
                className="no-underline"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                프로젝트
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => void handleCopy(asset.name, '제목이 복사되었습니다.')}
            >
              <Type className="h-3.5 w-3.5" />
              제목 복사
            </Button>
          </div>
        </div>

        <ScrollArea className={cn('px-4 py-4', scrollClassName)}>
          <section aria-label="자산 메타데이터">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              메타데이터
            </h3>
            <dl className="flex flex-col gap-2.5">
              <MetadataRow label="프로젝트" value={asset.projectName} layout="inline" />
              <MetadataRow label="담당자" value={asset.owner} layout="inline" nowrap />
              <MetadataRow
                label="업데이트"
                value={formatDate(asset.updatedAt)}
                layout="inline"
                nowrap
              />
              <MetadataRow
                label="카테고리"
                value={<AssetCategoryBadge category={asset.category} />}
                layout="inline"
              />
              <MetadataRow
                label="검토 상태"
                value={getAssetStatusLabel(asset.status)}
                layout="inline"
                nowrap
              />
              {asset.extension ? (
                <MetadataRow
                  label="파일 형식"
                  value={asset.extension.toUpperCase()}
                  layout="inline"
                  nowrap
                />
              ) : null}
              <MetadataRow
                label="파일 경로"
                value={
                  assetPath ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block break-all font-mono text-xs leading-relaxed text-muted-foreground">
                          {assetPath}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-sm break-all font-mono text-xs">
                        {assetPath}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    '-'
                  )
                }
                layout="inline"
              />
            </dl>
          </section>

          <Separator className="my-4" />

          <section aria-label="태그">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              태그
            </h3>
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
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  관련 자산
                </h3>
                <ul className="flex flex-col gap-1">
                  {relatedAssets.map((relatedAsset) => (
                    <li key={relatedAsset.id}>
                      <Link
                        to={APP_ROUTES.assetDetail.replace(':assetId', relatedAsset.id)}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground no-underline transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <AssetCategoryIcon category={relatedAsset.category} className="h-3.5 w-3.5 shrink-0" />
                        <span className="min-w-0 truncate [word-break:keep-all]">{relatedAsset.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}
