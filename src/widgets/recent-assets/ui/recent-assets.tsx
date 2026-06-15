import type { Asset } from '@/entities/asset'
import { AssetCard } from '@/entities/asset'

interface RecentAssetsProps {
  assets: Asset[]
}

export function RecentAssets({ assets }: RecentAssetsProps) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </section>
  )
}
