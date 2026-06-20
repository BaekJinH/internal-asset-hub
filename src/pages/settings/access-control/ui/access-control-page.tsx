import { Check, X } from 'lucide-react'
import { PERMISSION_LABELS, type Permission } from '@/entities/role/model/role-types'
import { mockRoles } from '@/shared/mocks/mock-roles'
import { mockUsers } from '@/shared/mocks/mock-users'
import { getTeamById } from '@/shared/mocks/mock-org-structure'
import { Badge } from '@/shared/ui/badge'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell } from '@/shared/ui/page-shell'
import { PageSection } from '@/shared/ui/page-section'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { cn } from '@/shared/lib/cn'

interface UserRow {
  id: string
  name: string
  email: string
  jobTitle: string
  team: string
  roleLabel: string
}

function buildUserRows(): UserRow[] {
  return mockUsers.map((user) => {
    const role = mockRoles.find((item) => item.id === user.roleId)
    const team = getTeamById(user.teamId)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle,
      team: team?.label ?? user.department ?? '-',
      roleLabel: role?.label ?? '-',
    }
  })
}

const userColumns: DataTableColumn<UserRow>[] = [
  { key: 'name', header: '이름', cell: (row) => row.name, minWidthPx: 100 },
  { key: 'jobTitle', header: '직함', cell: (row) => row.jobTitle, minWidthPx: 140 },
  { key: 'team', header: '팀', cell: (row) => row.team, minWidthPx: 80 },
  { key: 'email', header: '이메일', cell: (row) => <span className="font-mono text-xs">{row.email}</span>, minWidthPx: 220 },
  {
    key: 'role',
    header: '역할',
    cell: (row) => (
      <Badge tone={row.roleLabel === '마스터' ? 'info' : 'default'}>{row.roleLabel}</Badge>
    ),
    minWidthPx: 80,
  },
]

const allPermissions = Object.keys(PERMISSION_LABELS) as Permission[]

export function AccessControlPage() {
  const userRows = buildUserRows()

  return (
    <PageShell>
      <PageHeader
        title="접근 제어"
        description="역할 기반 권한 설정 및 사용자별 역할 조회"
      />

      <PageSection
        title="역할별 사용자"
        description="마스터 4명(최준연, 최지니, 유지아, 허승) · 멤버 11명"
        padded={false}
        contentClassName="p-0"
      >
        <DataTable
          columns={userColumns}
          data={userRows}
          getRowKey={(row) => row.id}
          emptyTitle="사용자 없음"
          emptyDescription="등록된 사용자가 없습니다."
        />
      </PageSection>

      <PageSection title="권한 매트릭스" description="역할별 허용 권한 목록" padded={false} contentClassName="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground">권한</TableHead>
              {mockRoles.map((role) => (
                <TableHead key={role.id} className="text-center">
                  {role.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allPermissions.map((permission) => (
              <TableRow key={permission}>
                <TableCell className="text-muted-foreground">
                  {PERMISSION_LABELS[permission]}
                </TableCell>
                {mockRoles.map((role) => {
                  const allowed = role.permissions.includes(permission)
                  return (
                    <TableCell key={role.id} className="text-center">
                      {allowed ? (
                        <Check className={cn('mx-auto size-4 text-primary')} />
                      ) : (
                        <X className="mx-auto size-4 text-muted-foreground/40" />
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PageSection>
    </PageShell>
  )
}
