import { useEffect } from 'react'
import { projectService } from '@/entities/project/api/project-service'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'

export function useOperationsInit() {
  const initialize = useOperationsStore((s) => s.initialize)
  const loading = useOperationsStore((s) => s.loading)

  useEffect(() => {
    projectService.getProjects().then((projects) => initialize(projects))
  }, [initialize])

  return { loading }
}
