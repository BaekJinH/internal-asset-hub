import { Link } from 'react-router-dom'
import { FileStack } from 'lucide-react'
import type { Asset } from '@/entities/asset'
import { AssetCard } from '@/entities/asset'
import { APP_ROUTES } from '@/shared/config/routes'
import { EmptyState } from '@/shared/ui/empty-state'
import { cn } from '@/shared/lib/cn'

interface RecentAssetsProps {
  assets: Asset[]
  className?: string
}

export function RecentAssets({ assets, className }: RecentAssetsProps) {
  if (assets.length === 0) {
    return (
      <EmptyState
        icon={FileStack}
        title="최근 자산 없음"
        description="등록된 자산이 없거나 최근 업데이트된 항목이 없습니다."
        className={className}
      />
    )
  }

  return (
    <section className={cn('grid gap-2 md:grid-cols-2', className)}>
      {assets.map((asset) => (
        <Link
          key={asset.id}
          to={APP_ROUTES.assetDetail.replace(':assetId', asset.id)}
          className="block text-foreground no-underline"
        >
          <AssetCard asset={asset} interactive showQuickActions={false} />
        </Link>
      ))}
    </section>
  )
}
