export const TEAM_IDS = {
  EXECUTIVE: 'team-executive',
  UX: 'team-ux',
  DEV: 'team-dev',
} as const

export type TeamId = (typeof TEAM_IDS)[keyof typeof TEAM_IDS]

export interface Team {
  id: TeamId
  name: string
  label: string
}

export const mockTeams: Team[] = [
  { id: TEAM_IDS.EXECUTIVE, name: 'executive', label: '경영' },
  { id: TEAM_IDS.UX, name: 'ux', label: 'UX팀' },
  { id: TEAM_IDS.DEV, name: 'dev', label: '개발팀' },
]

export function getTeamById(teamId: string): Team | undefined {
  return mockTeams.find((team) => team.id === teamId)
}
