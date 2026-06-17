import { Link } from 'react-router-dom'
import type { Asset } from '@/entities/asset'
import { AssetCategoryBadge, AssetStatusBadge } from '@/entities/asset'
import { Button } from '@/shared/ui/button'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'
import { formatDate } from '@/shared/lib/format-date'
import { APP_ROUTES } from '@/shared/config/routes'
import { NoWrapText } from '@/shared/ui/text'

interface AssetTableProps {
  assets: Asset[]
}

export function AssetTable({ assets }: AssetTableProps) {
  const columns: DataTableColumn<Asset>[] = [
    {
      key: 'name',
      header: '자산 이름',
      minWidthPx: 240,
      cellClassName: 'min-w-0 max-w-0 truncate',
      cell: (asset) => asset.name,
    },
    {
      key: 'category',
      header: '카테고리',
      minWidthPx: 120,
      cellClassName: 'whitespace-nowrap',
      cell: (asset) => <AssetCategoryBadge category={asset.category} />,
    },
    {
      key: 'status',
      header: '상태',
      minWidthPx: 108,
      cellClassName: 'whitespace-nowrap',
      cell: (asset) => <AssetStatusBadge status={asset.status} />,
    },
    {
      key: 'owner',
      header: '담당자',
      minWidthPx: 96,
      cellClassName: 'whitespace-nowrap',
      cell: (asset) => <NoWrapText muted>{asset.owner}</NoWrapText>,
    },
    {
      key: 'updatedAt',
      header: '업데이트',
      minWidthPx: 128,
      cellClassName: 'whitespace-nowrap',
      cell: (asset) => <NoWrapText muted>{formatDate(asset.updatedAt)}</NoWrapText>,
    },
    {
      key: 'tags',
      header: '태그',
      minWidthPx: 160,
      cellClassName: 'min-w-0 truncate',
      cell: (asset) => asset.tags.join(', '),
    },
    {
      key: 'actions',
      header: '액션',
      minWidthPx: 220,
      cellClassName: 'whitespace-nowrap',
      cell: (asset) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={APP_ROUTES.assetDetail.replace(':assetId', asset.id)}>상세</Link>
          </Button>
          <Button variant="ghost" size="sm" type="button">
            다운로드
          </Button>
          <Button variant="ghost" size="sm" type="button">
            링크 열기
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={assets}
      getRowKey={(asset) => asset.id}
      emptyTitle="자산 없음"
      emptyDescription="이 프로젝트에 등록된 자산이 없습니다."
    />
  )
}
