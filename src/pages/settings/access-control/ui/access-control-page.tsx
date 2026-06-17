import { Check, X } from 'lucide-react'
import { PERMISSION_LABELS, type Permission } from '@/entities/role/model/role-types'
import { mockRoles } from '@/shared/mocks/mock-roles'
import { mockUsers } from '@/shared/mocks/mock-users'
import { getTeamById } from '@/shared/mocks/mock-org-structure'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'
import { PageHeader } from '@/shared/ui/page-header'
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
    <div className="space-y-6">
      <PageHeader
        title="접근 제어"
        description="역할 기반 권한 설정 및 사용자별 역할 조회"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">역할별 사용자</CardTitle>
          <CardDescription>
            마스터 4명(최준연, 최지니, 유지아, 허승) · 멤버 11명
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={userColumns}
            data={userRows}
            getRowKey={(row) => row.id}
            emptyTitle="사용자 없음"
            emptyDescription="등록된 사용자가 없습니다."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">권한 매트릭스</CardTitle>
          <CardDescription>역할별 허용 권한 목록</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">권한</th>
                {mockRoles.map((role) => (
                  <th key={role.id} className="px-3 py-2 text-center font-medium">
                    {role.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPermissions.map((permission) => (
                <tr key={permission} className="border-b border-border/60">
                  <td className="px-3 py-2 text-muted-foreground">
                    {PERMISSION_LABELS[permission]}
                  </td>
                  {mockRoles.map((role) => {
                    const allowed = role.permissions.includes(permission)
                    return (
                      <td key={role.id} className="px-3 py-2 text-center">
                        {allowed ? (
                          <Check className={cn('mx-auto h-4 w-4 text-primary')} />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
