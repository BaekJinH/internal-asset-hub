import { useMemo, useState } from 'react'
import type { Project, ProjectStatus } from '@/entities/project'

export function useProjectFilter(projects: Project[]) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all')

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const statusMatched = status === 'all' || project.status === status
        const queryMatched =
          query.length === 0 ||
          project.name.toLowerCase().includes(query.toLowerCase()) ||
          project.description.toLowerCase().includes(query.toLowerCase())
        return statusMatched && queryMatched
      }),
    [projects, query, status],
  )

  return { query, setQuery, status, setStatus, filteredProjects }
}
