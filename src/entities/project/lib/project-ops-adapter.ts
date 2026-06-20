import type { Project, ProjectOperations } from '@/entities/project/model/project-types'
import { ROLE_IDS } from '@/entities/role/model/role-types'
import type { User } from '@/entities/user/model/user-types'
import type { UserWorkProfile } from '@/entities/user-work-profile/model/user-work-profile-types'
import type { JobType } from '@/entities/project/model/project-types'
import { UNIFORM_MONTHLY_COST } from '@/shared/mocks/mock-user-work-profiles'

/** workboard calc 호환용 프로젝트 뷰 */
export interface OpsProjectView {
  id: string
  name: string
  clientName: string
  projectName: string
  startDate: string
  endDate: string
  status: Project['status']
  contractAmount: number
  contractMDs: ProjectOperations['contractMDs']
  contractRates: ProjectOperations['contractRates']
  assignments: ProjectOperations['assignments']
  legacy?: boolean
}

export interface WorkUser {
  id: string
  name: string
  role: 'employee' | 'manager'
  jobType: JobType
  teamId: string
  monthlyCost: number
  favoriteProjectIds: string[]
}

export function toOpsProjectView(project: Project): OpsProjectView | null {
  if (!project.operations) return null
  const ops = project.operations
  return {
    id: project.id,
    name: project.name,
    clientName: ops.clientName,
    projectName: project.name,
    startDate: ops.startDate,
    endDate: ops.endDate,
    status: project.status,
    contractAmount: ops.contractAmount,
    contractMDs: ops.contractMDs,
    contractRates: ops.contractRates,
    assignments: ops.assignments,
    legacy: ops.legacy,
  }
}

export function toWorkUser(user: User, profile: UserWorkProfile | undefined): WorkUser {
  return {
    id: user.id,
    name: user.name,
    role: user.roleId === ROLE_IDS.MASTER ? 'manager' : 'employee',
    jobType: profile?.jobType ?? 'planning',
    teamId: user.teamId,
    monthlyCost: profile?.monthlyCost ?? UNIFORM_MONTHLY_COST,
    favoriteProjectIds: profile?.favoriteProjectIds ?? [],
  }
}

export function getOpsProjects(projects: Project[]): OpsProjectView[] {
  return projects.map(toOpsProjectView).filter((p): p is OpsProjectView => p != null)
}
