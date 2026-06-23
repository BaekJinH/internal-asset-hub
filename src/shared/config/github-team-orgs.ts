import type { ProjectTeamCategory } from '@/entities/project/model/project-types'

/** UI 표시용 기본 org (실제 sync는 서버 .env 기준) */
export const DEFAULT_GITHUB_ORG_BY_TEAM: Record<'dev' | 'publishing', string> = {
  dev: 'tintolab-development',
  publishing: 'tintolab-publishing',
}

export function getTeamGithubOrgLabel(team: ProjectTeamCategory): string | null {
  if (team === 'dev') return DEFAULT_GITHUB_ORG_BY_TEAM.dev
  if (team === 'publishing') return DEFAULT_GITHUB_ORG_BY_TEAM.publishing
  return null
}

export function teamSupportsGithubSync(team: ProjectTeamCategory): boolean {
  return team === 'dev' || team === 'publishing'
}
