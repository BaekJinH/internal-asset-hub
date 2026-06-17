import { Copy, ExternalLink, FolderOpen, MoreHorizontal, Type } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import type { Asset } from '@/entities/asset/model/asset-types'
import { copyToClipboard } from '@/shared/lib/copy-to-clipboard'
import { APP_ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/cn'

interface AssetCardQuickActionsProps {
  asset: Asset
  className?: string
}

export function AssetCardQuickActions({ asset, className }: AssetCardQuickActionsProps) {
  const assetPath = asset.filePath ?? asset.externalUrl

  const handleCopy = async (value: string, successMessage: string) => {
    const copied = await copyToClipboard(value)
    if (copied) {
      toast.success(successMessage)
    } else {
      toast.error('복사에 실패했습니다.')
    }
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 data-[state=open]:opacity-100',
                className,
              )}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              aria-label={`${asset.name} 빠른 작업`}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">빠른 작업</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-44" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem asChild>
          <Link to={APP_ROUTES.assetDetail.replace(':assetId', asset.id)} className="no-underline">
            <ExternalLink className="h-4 w-4" />
            자산 보기
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!assetPath}
          onSelect={() => void handleCopy(assetPath ?? '', '경로가 복사되었습니다.')}
        >
          <Copy className="h-4 w-4" />
          경로 복사
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void handleCopy(asset.name, '제목이 복사되었습니다.')}>
          <Type className="h-4 w-4" />
          제목 복사
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to={APP_ROUTES.projectDetail.replace(':projectId', asset.projectId)}
            className="no-underline"
          >
            <FolderOpen className="h-4 w-4" />
            프로젝트 보기
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
