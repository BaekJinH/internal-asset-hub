import type { Asset } from '@/entities/asset'
import { AssetCategoryBadge, AssetStatusBadge } from '@/entities/asset'
import { Button } from '@/shared/ui/button'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'
import { formatDate } from '@/shared/lib/format-date'

interface AssetTableProps {
  assets: Asset[]
}

const ASSET_TABLE_COLUMNS: DataTableColumn<Asset>[] = [
  { key: 'name', header: '자산 이름', cell: (asset) => asset.name },
  { key: 'category', header: '카테고리', cell: (asset) => <AssetCategoryBadge category={asset.category} /> },
  { key: 'status', header: '상태', cell: (asset) => <AssetStatusBadge status={asset.status} /> },
  { key: 'owner', header: '담당자', cell: (asset) => asset.owner },
  { key: 'updatedAt', header: '업데이트', cell: (asset) => formatDate(asset.updatedAt) },
  { key: 'tags', header: '태그', cell: (asset) => asset.tags.join(', ') },
  {
    key: 'actions',
    header: '액션',
    cell: () => (
      <div className="flex gap-2">
        <Button variant="ghost" type="button">상세</Button>
        <Button variant="ghost" type="button">다운로드</Button>
        <Button variant="ghost" type="button">링크 열기</Button>
      </div>
    ),
  },
]

export function AssetTable({ assets }: AssetTableProps) {
  return <DataTable columns={ASSET_TABLE_COLUMNS} data={assets} getRowKey={(asset) => asset.id} />
}
