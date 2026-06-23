import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Asset } from '@/entities/asset'
import { searchService } from '@/features/asset-search/model/search-service'
import { QUERY_PARAMS } from '@/shared/constants/query-param-keys'
import {
  ASSET_CATEGORY_FILTER_VALUES,
  ASSET_STATUS_FILTER_VALUES,
} from '@/shared/lib/query-param-validators'
import { useQueryParam, useQueryParamEnum } from '@/shared/lib/use-query-param'

export interface AssetSearchFilters {
  project: string
  category: string
  owner: string
  status: string
  date: string
  tags: string
}

export function useAssetSearch(assets: Asset[]) {
  const [query, setQuery] = useQueryParam(QUERY_PARAMS.q, '')
  const [project, setProject] = useQueryParam(QUERY_PARAMS.project, 'all')
  const [category, setCategory] = useQueryParamEnum(
    QUERY_PARAMS.category,
    'all',
    ASSET_CATEGORY_FILTER_VALUES,
  )
  const [status, setStatus] = useQueryParamEnum(
    QUERY_PARAMS.status,
    'all',
    ASSET_STATUS_FILTER_VALUES,
  )
  const [owner, setOwner] = useQueryParam(QUERY_PARAMS.owner, '')
  const [date, setDate] = useQueryParam(QUERY_PARAMS.date, '')
  const [tags, setTags] = useQueryParam(QUERY_PARAMS.tags, '')

  const filters = useMemo<AssetSearchFilters>(
    () => ({ project, category, owner, status, date, tags }),
    [project, category, owner, status, date, tags],
  )

  const setFilters = useCallback(
    (next: AssetSearchFilters | ((prev: AssetSearchFilters) => AssetSearchFilters)) => {
      const resolved = typeof next === 'function' ? next(filters) : next
      setProject(resolved.project)
      setCategory(resolved.category as (typeof ASSET_CATEGORY_FILTER_VALUES)[number])
      setOwner(resolved.owner)
      setStatus(resolved.status as (typeof ASSET_STATUS_FILTER_VALUES)[number])
      setDate(resolved.date)
      setTags(resolved.tags)
    },
    [filters, setProject, setCategory, setOwner, setStatus, setDate, setTags],
  )

  const [results, setResults] = useState<Asset[]>(assets)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    const runSearch = async () => {
      setIsLoading(true)

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve())
      })

      const searchedAssets = await searchService.searchAssets(assets, query, filters)

      if (isMounted) {
        setResults(searchedAssets)
        setIsLoading(false)
      }
    }

    void runSearch()

    return () => {
      isMounted = false
    }
  }, [assets, filters, query])

  return { query, setQuery, filters, setFilters, results, isLoading }
}
