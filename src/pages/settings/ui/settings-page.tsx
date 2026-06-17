import { Link } from 'react-router-dom'
import {
  FolderTree,
  HardDrive,
  Shield,
  Server,
  FileText,
  Tags,
  ChevronRight,
  ClipboardList,
} from 'lucide-react'
import { usePermission } from '@/features/auth/model/use-auth'
import { PERMISSIONS } from '@/entities/role/model/role-types'
import { APP_ROUTES } from '@/shared/config/routes'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'

const SETTINGS_SECTIONS = [
  { title: '카테고리 관리', description: '자산 카테고리 및 분류 규칙', icon: FolderTree },
  { title: '태그 관리', description: '공통 태그 및 태그 정책', icon: Tags },
  {
    title: '운영 설정',
    description: '팀원 프로필, 원가, 데이터 백업',
    icon: ClipboardList,
    path: APP_ROUTES.settingsOperations,
    permission: PERMISSIONS.FINANCIAL_VIEW,
  },
  {
    title: '접근 제어',
    description: '역할 기반 권한 설정',
    icon: Shield,
    path: APP_ROUTES.settingsAccessControl,
    permission: PERMISSIONS.ACCESS_CONTROL_VIEW,
  },
  { title: '서버 상태', description: '스토리지 및 GPU 모니터링', icon: Server },
  { title: '파일 네이밍 규칙', description: '업로드 파일명 규칙', icon: FileText },
  { title: '스토리지 정책', description: '용량 및 보관 정책', icon: HardDrive },
] as const

export function SettingsPage() {
  const { checkPermission } = usePermission()

  return (
    <div className="space-y-6">
      <PageHeader title="설정" description="MVP 단계 기본 설정 섹션" />
      <div className="grid gap-4 md:grid-cols-2">
        {SETTINGS_SECTIONS.map(({ title, description, icon: Icon, ...rest }) => {
          const hasAccess = 'permission' in rest ? checkPermission(rest.permission) : false
          const path = 'path' in rest ? rest.path : undefined

          if (path && hasAccess) {
            return (
              <Link key={title} to={path} className="block">
                <Card className="p-0 transition-colors hover:border-primary/30 hover:bg-accent/30">
                  <CardHeader className="flex-row items-start gap-3 space-y-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-base">{title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Badge tone="info">사용 가능</Badge>
                  </CardContent>
                </Card>
              </Link>
            )
          }

          return (
            <Card key={title} className="p-0 opacity-80">
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </CardHeader>
              <CardContent>
                <Badge tone="default">추후 구현 예정</Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
