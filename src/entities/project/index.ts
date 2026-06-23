export { projectService } from '@/entities/project/api/project-service'
export {
  useProjectsQuery,
  useProjectQuery,
  useSaveProjectMutation,
  useGithubSyncProjectsMutation,
  useFigmaSyncProjectsMutation,
  useLinkNotionProjectsMutation,
  createEmptyProject,
} from '@/entities/project/api/project-queries'
export { projectQueryKeys } from '@/entities/project/api/project-query-keys'
export type {
  Project,
  ProjectLinks,
  ProjectExternalIds,
  ProjectSyncMeta,
  ProjectTeamCategory,
  ProjectOperations,
  ProjectStatus,
  JobType,
} from '@/entities/project/model/project-types'
export { PROJECT_TEAM_LABELS, PROJECT_TEAM_TABS } from '@/entities/project/model/project-constants'
export { filterProjectsByTeam, resolveProjectTeamCategory } from '@/entities/project/lib/project-team-utils'
export { getProjectSyncSummary } from '@/entities/project/lib/project-sync-utils'
export { ProjectSyncBadges } from '@/entities/project/ui/project-sync-badges'
export { PROJECT_STATUS_LABELS } from '@/entities/project/model/project-constants'
export {
  ENGINEERING_PROJECT_LIST_METADATA,
  DESIGN_PROJECT_LIST_METADATA,
  getProjectCardMetaItems,
  getProjectListMetadataSchema,
  getProjectMetadataValues,
} from '@/entities/project/lib/project-list-metadata'
export type { ProjectListMetadataField, ProjectCardMetaItem } from '@/entities/project/lib/project-list-metadata'
export { ProjectCard } from '@/entities/project/ui/project-card'
export { ProjectStatusBadge } from '@/entities/project/ui/project-status-badge'
