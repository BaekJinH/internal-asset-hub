export const assetQueryKeys = {
  all: ['assets'] as const,
  list: () => [...assetQueryKeys.all, 'list'] as const,
  detail: (assetId: string) => [...assetQueryKeys.all, 'detail', assetId] as const,
  byProject: (projectId: string) => [...assetQueryKeys.all, 'byProject', projectId] as const,
}
