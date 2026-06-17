import { Link } from 'react-router-dom'
import type { Asset } from '@/entities/asset'
import { AssetCategoryBadge, AssetStatusBadge } from '@/entities/asset'
import { APP_ROUTES } from '@/shared/config/routes'
import { formatDate } from '@/shared/lib/format-date'
import { Badge } from '@/shared/ui/badge'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'
import { NoWrapText, TruncatedText } from '@/shared/ui/text'
import { TagBadge } from '@/shared/ui/tag-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

interface DashboardRecentAssetsTableProps {
  assets: Asset[]
}

function AssetTags({ tags }: { tags: string[] }) {
  const visible = tags.slice(0, 2)
  const remaining = tags.length - visible.length

  if (tags.length === 0) {
    return <span className="text-xs text-muted-foreground">-</span>
  }

  const content = (
    <div className="flex min-w-0 items-center gap-1">
      {visible.map((tag) => (
        <TagBadge key={tag}>{tag}</TagBadge>
      ))}
      {remaining > 0 ? (
        <Badge tone="default" className="shrink-0 px-1.5 py-0 text-[11px]">
          +{remaining}
        </Badge>
      ) : null}
    </div>
  )

  if (tags.length <= 2) {
    return content
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="min-w-0 cursor-default">{content}</div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs [word-break:keep-all]">
        {tags.map((tag) => `#${tag}`).join(' ')}
      </TooltipContent>
    </Tooltip>
  )
}

const columns: DataTableColumn<Asset>[] = [
  {
    key: 'name',
    header: '자산',
    width: '27%',
    cellClassName: 'min-w-0 max-w-0',
    cell: (asset) => (
      <Link
        to={APP_ROUTES.assetDetail.replace(':assetId', asset.id)}
        className="block min-w-0 text-foreground no-underline hover:text-primary"
      >
        <TruncatedText text={asset.name} className="font-medium" />
      </Link>
    ),
  },
  {
    key: 'project',
    header: '프로젝트',
    width: '20%',
    cellClassName: 'min-w-0 max-w-0',
    cell: (asset) => (
      <TruncatedText text={asset.projectName} className="text-muted-foreground" />
    ),
  },
  {
    key: 'classification',
    header: '분류',
    width: '13%',
    cellClassName: 'whitespace-nowrap',
    cell: (asset) => (
      <div className="grid grid-cols-[6.5rem_2.75rem] items-center gap-x-2">
        <div className="flex min-w-0 items-center">
          <AssetCategoryBadge category={asset.category} />
        </div>
        <NoWrapText mono muted>
          {asset.extension ?? '-'}
        </NoWrapText>
      </div>
    ),
  },
  {
    key: 'meta',
    header: '담당 · 업데이트',
    width: '14%',
    cellClassName: 'whitespace-nowrap',
    cell: (asset) => (
      <div className="flex flex-col gap-0.5">
        <NoWrapText muted>{asset.owner}</NoWrapText>
        <NoWrapText muted className="text-xs">
          {formatDate(asset.updatedAt)}
        </NoWrapText>
      </div>
    ),
  },
  {
    key: 'status',
    header: '상태',
    width: '10%',
    cellClassName: 'whitespace-nowrap',
    cell: (asset) => (
      <div className="flex shrink-0 justify-start">
        <AssetStatusBadge status={asset.status} />
      </div>
    ),
  },
  {
    key: 'tags',
    header: '태그',
    width: '16%',
    cellClassName: 'min-w-0',
    cell: (asset) => <AssetTags tags={asset.tags} />,
  },
]

export function DashboardRecentAssetsTable({ assets }: DashboardRecentAssetsTableProps) {
  return (
    <DataTable
      layout="fluid"
      columns={columns}
      data={assets}
      getRowKey={(asset) => asset.id}
      emptyTitle="최근 자산 없음"
      emptyDescription="등록된 자산이 없거나 최근 업데이트된 항목이 없습니다."
    />
  )
}
