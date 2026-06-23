import type { ProjectTeamCategory } from '@/entities/project/model/project-types'

export const DEFAULT_FIGMA_TEAM_ID = '1132177377948917434'

export const DEFAULT_FIGMA_SYNC_ACTIVE_DAYS = 30

export function teamSupportsFigmaSync(team: ProjectTeamCategory): boolean {
  return team === 'design'
}

export function getFigmaTeamLabel(): string {
  return 'Figma Team'
}
