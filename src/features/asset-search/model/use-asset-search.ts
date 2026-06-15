import { useEffect, useState } from 'react'
import type { Asset } from '@/entities/asset'
import { searchService } from '@/features/asset-search/model/search-service'

export interface AssetSearchFilters {
  project: string
  category: string
  owner: string
  status: string
  date: string
  tags: string
}

const INITIAL_FILTERS: AssetSearchFilters = {
  project: 'all',
  category: 'all',
  owner: '',
  status: 'all',
  date: '',
  tags: '',
}

export function useAssetSearch(assets: Asset[]) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<AssetSearchFilters>(INITIAL_FILTERS)
  const [results, setResults] = useState<Asset[]>(assets)

  useEffect(() => {
    let isMounted = true

    const runSearch = async () => {
      const searchedAssets = await searchService.searchAssets(assets, query, filters)
      if (isMounted) {
        setResults(searchedAssets)
      }
    }

    void runSearch()

    return () => {
      isMounted = false
    }
  }, [assets, filters, query])

  return { query, setQuery, filters, setFilters, results }
}
