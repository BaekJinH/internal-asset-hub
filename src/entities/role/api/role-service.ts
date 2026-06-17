import { mockRoles, getRoleById } from '@/shared/mocks/mock-roles'
import type { Role } from '@/entities/role/model/role-types'

export const roleService = {
  async getRoles(): Promise<Role[]> {
    return Promise.resolve(mockRoles)
  },

  async getRoleById(roleId: string): Promise<Role | undefined> {
    return Promise.resolve(getRoleById(roleId))
  },
}
