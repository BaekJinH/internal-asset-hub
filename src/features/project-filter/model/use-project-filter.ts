import { useMemo } from 'react'
import type { Project } from '@/entities/project'
import { QUERY_PARAMS } from '@/shared/constants/query-param-keys'
import { PROJECT_STATUS_FILTER_VALUES } from '@/shared/lib/query-param-validators'
import { useQueryParam, useQueryParamEnum } from '@/shared/lib/use-query-param'

export function useProjectFilter(projects: Project[]) {
  const [query, setQuery] = useQueryParam(QUERY_PARAMS.q, '')
  const [status, setStatus] = useQueryParamEnum(
    QUERY_PARAMS.status,
    'all',
    PROJECT_STATUS_FILTER_VALUES,
  )

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
