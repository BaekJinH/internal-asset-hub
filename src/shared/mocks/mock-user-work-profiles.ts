import type { JobType } from '@/entities/project/model/project-types'
import type { UserWorkProfile } from '@/entities/user-work-profile/model/user-work-profile-types'
import { getOperationsTeamMembers } from '@/shared/mocks/mock-users'

export const UNIFORM_MONTHLY_COST = 7_500_000

const JOB_TYPE_BY_USER: Record<string, JobType> = {
  'u-003': 'planning',
  'u-004': 'design',
  'u-005': 'design',
  'u-006': 'planning',
  'u-007': 'design',
  'u-008': 'design',
  'u-009': 'dev',
  'u-010': 'publishing',
  'u-011': 'publishing',
  'u-012': 'dev',
  'u-013': 'dev',
  'u-014': 'publishing',
  'u-015': 'publishing',
}

const FAVORITE_PROJECT_IDS_BY_USER: Record<string, string[]> = {
  'u-004': ['project-ja-korea-renewal'],
  'u-009': ['project-internal-ai-automation'],
}

export const mockUserWorkProfiles: UserWorkProfile[] = getOperationsTeamMembers().map((user) => ({
  userId: user.id,
  jobType: JOB_TYPE_BY_USER[user.id] ?? 'planning',
  monthlyCost: UNIFORM_MONTHLY_COST,
  favoriteProjectIds: FAVORITE_PROJECT_IDS_BY_USER[user.id] ?? [],
}))

export function getUserWorkProfile(userId: string): UserWorkProfile | undefined {
  return mockUserWorkProfiles.find((p) => p.userId === userId)
}

/** 저장된 프로필과 mock을 병합하고 월 원가를 일괄 적용합니다. */
export function syncUserProfilesWithUniformCost(stored: UserWorkProfile[]): UserWorkProfile[] {
  const storedMap = new Map(stored.map((profile) => [profile.userId, profile]))
  return mockUserWorkProfiles.map((mock) => {
    const existing = storedMap.get(mock.userId)
    return {
      ...mock,
      monthlyCost: UNIFORM_MONTHLY_COST,
      jobType: existing?.jobType ?? mock.jobType,
      favoriteProjectIds: existing?.favoriteProjectIds ?? mock.favoriteProjectIds,
    }
  })
}
