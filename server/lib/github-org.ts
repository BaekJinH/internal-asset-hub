import type { ProjectTeamCategory } from '../types.js'
import { env } from '../env.js'

export function resolveGithubOrg(
  teamCategory: ProjectTeamCategory = 'dev',
  orgOverride?: string,
): string {
  if (orgOverride?.trim()) return orgOverride.trim()

  switch (teamCategory) {
    case 'publishing':
      return env.githubOrgPublishing
    case 'design':
      return env.githubOrgDesign
    case 'dev':
    default:
      return env.githubOrg
  }
}

export function getGithubOrgsByTeam(): Record<'dev' | 'publishing' | 'design', string> {
  return {
    dev: env.githubOrg,
    publishing: env.githubOrgPublishing,
    design: env.githubOrgDesign,
  }
}

/** 팀별 GitHub PAT — GITHUB_DEVELOPMENT / GITHUB_PUBLISHING, 없으면 GITHUB_TOKEN */
export function resolveGithubToken(
  teamCategory: ProjectTeamCategory = 'dev',
): string {
  switch (teamCategory) {
    case 'publishing':
      return env.githubTokenPublishing
    case 'design':
      return env.githubToken
    case 'dev':
    default:
      return env.githubTokenDevelopment
  }
}
