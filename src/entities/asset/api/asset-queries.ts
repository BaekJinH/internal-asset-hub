import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAssetById, fetchAssetsByProject, resetAssetApiCache } from '@/entities/asset/api/asset-api'
import { assetQueryKeys } from '@/entities/asset/api/asset-query-keys'
import { projectQueryKeys } from '@/entities/project/api/project-query-keys'
import { integrationService } from '@/shared/api/integration-service'
import type { FigmaImportOptions } from '@/shared/types/integration-types'

export function useAssetsByProjectQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: assetQueryKeys.byProject(projectId ?? ''),
    queryFn: () => fetchAssetsByProject(projectId!),
    enabled: Boolean(projectId),
  })
}

export function useAssetQuery(assetId: string | undefined) {
  return useQuery({
    queryKey: assetQueryKeys.detail(assetId ?? ''),
    queryFn: () => fetchAssetById(assetId!),
    enabled: Boolean(assetId),
  })
}

export function useFigmaImportFileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (options: FigmaImportOptions) => integrationService.importFigmaFile(options),
    onSuccess: (result) => {
      resetAssetApiCache()
      void queryClient.invalidateQueries({ queryKey: assetQueryKeys.byProject(result.project.id) })
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(result.project.id) })
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.list() })
    },
  })
}

export function useFigmaLinkProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (options: FigmaImportOptions) => integrationService.linkFigmaProject(options),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(result.project.id) })
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.list() })
    },
  })
}
