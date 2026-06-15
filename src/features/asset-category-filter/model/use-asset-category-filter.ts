import { useMemo, useState } from 'react'
import type { Asset, AssetCategory } from '@/entities/asset'

export function useAssetCategoryFilter(assets: Asset[]) {
  const [category, setCategory] = useState<AssetCategory | 'all'>('all')

  const filteredAssets = useMemo(
    () => assets.filter((asset) => (category === 'all' ? true : asset.category === category)),
    [assets, category],
  )

  return { category, setCategory, filteredAssets }
}
