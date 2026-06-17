import {
  PERMISSIONS,
  ROLE_IDS,
  type Role,
} from '@/entities/role/model/role-types'

const ALL_PERMISSIONS = Object.values(PERMISSIONS)

const MEMBER_PERMISSIONS = ALL_PERMISSIONS.filter(
  (permission) =>
    permission !== PERMISSIONS.SETTINGS_VIEW &&
    permission !== PERMISSIONS.ACCESS_CONTROL_VIEW &&
    permission !== PERMISSIONS.ACCESS_CONTROL_MANAGE,
)

export const mockRoles: Role[] = [
  {
    id: ROLE_IDS.MASTER,
    name: 'master',
    label: '마스터',
    permissions: ALL_PERMISSIONS,
  },
  {
    id: ROLE_IDS.MEMBER,
    name: 'member',
    label: '멤버',
    permissions: MEMBER_PERMISSIONS,
  },
]

export function getRoleById(roleId: string): Role | undefined {
  return mockRoles.find((role) => role.id === roleId)
}
