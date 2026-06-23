import { useMemo } from 'react'
import type { Asset } from '@/entities/asset'
import { QUERY_PARAMS } from '@/shared/constants/query-param-keys'
import { ASSET_CATEGORY_FILTER_VALUES } from '@/shared/lib/query-param-validators'
import { useQueryParamEnum } from '@/shared/lib/use-query-param'

export function useAssetCategoryFilter(assets: Asset[]) {
  const [category, setCategory] = useQueryParamEnum(
    QUERY_PARAMS.category,
    'all',
    ASSET_CATEGORY_FILTER_VALUES,
  )

  const filteredAssets = useMemo(
    () => assets.filter((asset) => (category === 'all' ? true : asset.category === category)),
    [assets, category],
  )

  return { category, setCategory, filteredAssets }
}
