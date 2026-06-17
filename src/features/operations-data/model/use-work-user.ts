import { useMemo } from 'react'
import { useAuthStore } from '@/features/auth/model/auth-store'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { toWorkUser } from '@/entities/project/lib/project-ops-adapter'
import { getUserById, mockUsers } from '@/shared/mocks/mock-users'
import { getUserWorkProfile } from '@/shared/mocks/mock-user-work-profiles'
import { ROLE_IDS } from '@/entities/role/model/role-types'
import type { WorkUser } from '@/entities/project/lib/project-ops-adapter'

export function useCurrentWorkUser(): WorkUser | null {
  const session = useAuthStore((s) => s.session)
  const previewUserId = useOperationsStore((s) => s.previewUserId)
  const userProfiles = useOperationsStore((s) => s.userProfiles)

  return useMemo(() => {
    const targetId = previewUserId ?? session?.userId
    if (!targetId) return null
    const user = getUserById(targetId)
    if (!user) return null
    const profile = userProfiles.find((p) => p.userId === targetId) ?? getUserWorkProfile(targetId)
    return toWorkUser(user, profile)
  }, [session?.userId, previewUserId, userProfiles])
}

export function useIsManager(): boolean {
  const session = useAuthStore((s) => s.session)
  return session?.roleId === ROLE_IDS.MASTER
}

export function useWorkUsers(): WorkUser[] {
  const userProfiles = useOperationsStore((s) => s.userProfiles)

  return useMemo(() => {
    return mockUsers
      .filter((u) => u.roleId === ROLE_IDS.MEMBER)
      .map((u) => {
        const profile = userProfiles.find((p) => p.userId === u.id) ?? getUserWorkProfile(u.id)
        return toWorkUser(u, profile)
      })
  }, [userProfiles])
}
