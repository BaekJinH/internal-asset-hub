import { useEffect } from 'react'
import { useProjectsQuery } from '@/entities/project/api/project-queries'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'

export function useOperationsInit() {
  const initialize = useOperationsStore((s) => s.initialize)
  const { data: projects, isPending, isError } = useProjectsQuery()

  useEffect(() => {
    if (projects) {
      initialize(projects)
    }
  }, [initialize, projects])

  return { loading: isPending && !isError }
}
