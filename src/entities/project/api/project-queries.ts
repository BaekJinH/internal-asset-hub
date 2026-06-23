import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Project } from '@/entities/project/model/project-types'
import {
  createEmptyProject,
  fetchProjectById,
  fetchProjects,
  resetProjectApiCache,
  saveProject,
} from '@/entities/project/api/project-api'
import { resetAssetApiCache } from '@/entities/asset/api/asset-api'
import { assetQueryKeys } from '@/entities/asset/api/asset-query-keys'
import { projectQueryKeys } from '@/entities/project/api/project-query-keys'
import { integrationService } from '@/shared/api/integration-service'
import type { GithubSyncOptions, FigmaSyncOptions } from '@/shared/types/integration-types'

export function useProjectsQuery() {
  return useQuery({
    queryKey: projectQueryKeys.list(),
    queryFn: fetchProjects,
  })
}

export function useProjectQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: projectQueryKeys.detail(projectId ?? ''),
    queryFn: () => fetchProjectById(projectId!),
    enabled: Boolean(projectId),
  })
}

export function useSaveProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (project: Project) => saveProject(project),
    onSuccess: (saved) => {
      queryClient.setQueryData<Project[]>(projectQueryKeys.list(), (prev) => {
        if (!prev) return [saved]
        const idx = prev.findIndex((p) => p.id === saved.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = saved
          return next
        }
        return [...prev, saved]
      })
      queryClient.setQueryData(projectQueryKeys.detail(saved.id), saved)
    },
  })
}

export function useGithubSyncProjectsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (options?: GithubSyncOptions) => integrationService.syncGithubProjects(options),
    onSuccess: () => {
      resetProjectApiCache()
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
    },
  })
}

export function useLinkNotionProjectsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => integrationService.linkNotionProjects(),
    onSuccess: () => {
      resetProjectApiCache()
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
    },
  })
}

export function useFigmaSyncProjectsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (options?: FigmaSyncOptions) => integrationService.syncFigmaProjects(options),
    onSuccess: () => {
      resetProjectApiCache()
      resetAssetApiCache()
      void queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: assetQueryKeys.all })
    },
  })
}

export { createEmptyProject }
