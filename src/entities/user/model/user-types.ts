import type { RoleId } from '@/entities/role/model/role-types'
import type { TeamId } from '@/shared/mocks/mock-org-structure'

export interface User {
  id: string
  name: string
  email: string
  jobTitle: string
  teamId: TeamId
  roleId: RoleId
  department?: string
  avatarUrl?: string
}
