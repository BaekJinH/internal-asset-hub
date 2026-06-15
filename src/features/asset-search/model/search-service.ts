import type { Asset } from '@/entities/asset'

export interface SearchFilters {
  project: string
  category: string
  owner: string
  status: string
  date: string
  tags: string
}

export const searchService = {
  async searchAssets(assets: Asset[], query: string, filters: SearchFilters): Promise<Asset[]> {
    const normalizedQuery = query.toLowerCase()

    return Promise.resolve(
      assets.filter((asset) => {
        const searchableText = [
          asset.name,
          asset.projectName,
          asset.description,
          asset.owner,
          asset.category,
          asset.status,
          asset.externalUrl,
          asset.filePath,
          ...asset.tags,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        const queryMatched = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery)
        const projectMatched = filters.project === 'all' || asset.projectId === filters.project
        const categoryMatched = filters.category === 'all' || asset.category === filters.category
        const ownerMatched = !filters.owner || asset.owner.toLowerCase().includes(filters.owner.toLowerCase())
        const statusMatched = filters.status === 'all' || asset.status === filters.status
        const tagsMatched = !filters.tags || asset.tags.join(',').toLowerCase().includes(filters.tags.toLowerCase())
        const dateMatched = !filters.date || asset.updatedAt.slice(0, 10) === filters.date

        return queryMatched && projectMatched && categoryMatched && ownerMatched && statusMatched && tagsMatched && dateMatched
      }),
    )
  },
}
