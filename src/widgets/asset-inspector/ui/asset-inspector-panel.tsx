import { SearchX } from 'lucide-react'
import type { Asset } from '@/entities/asset'
import { AssetInspectorContent } from '@/widgets/asset-inspector/ui/asset-inspector-content'
import { Card } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { cn } from '@/shared/lib/cn'

interface AssetInspectorPanelProps {
  asset?: Asset
  relatedAssets?: Asset[]
  className?: string
}

export function AssetInspectorPanel({ asset, relatedAssets = [], className }: AssetInspectorPanelProps) {
  if (!asset) {
    return (
      <Card className={cn('flex flex-col items-center justify-center p-8 shadow-sm', className)}>
        <EmptyState
          icon={SearchX}
          title="자산을 선택하세요"
          description="검색 결과에서 자산을 선택하면 상세 정보와 빠른 작업을 확인할 수 있습니다."
          className="border-none bg-transparent p-0 shadow-none"
        />
      </Card>
    )
  }

  return (
    <Card className={cn('flex flex-col overflow-hidden p-0 shadow-sm', className)}>
      <AssetInspectorContent
        asset={asset}
        relatedAssets={relatedAssets}
        scrollClassName="max-h-[calc(100vh-16rem)]"
      />
    </Card>
  )
}
