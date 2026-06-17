import { ROLE_IDS, type Permission } from '@/entities/role/model/role-types'
import { getRoleById } from '@/shared/mocks/mock-roles'
import type { AuthSession } from '@/entities/account/model/account-types'

export function hasPermission(session: AuthSession | null, permission: Permission): boolean {
  if (!session) {
    return false
  }

  const role = getRoleById(session.roleId)
  return role?.permissions.includes(permission) ?? false
}

export function isMaster(session: AuthSession | null): boolean {
  return session?.roleId === ROLE_IDS.MASTER
}
