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
  Link2,
} from 'lucide-react'
import { usePermission } from '@/features/auth/model/use-auth'
import { PERMISSIONS } from '@/entities/role/model/role-types'
import { APP_ROUTES } from '@/shared/config/routes'
import { Card, CardContent, CardDescription } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell } from '@/shared/ui/page-shell'
import { PageSection } from '@/shared/ui/page-section'
import { Badge } from '@/shared/ui/badge'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { pageCardShellClassName } from '@/shared/constants/page-card-styles'
import { cn } from '@/shared/lib/cn'

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
    title: '외부 연동',
    description: 'Notion API 확인, GitHub 프로젝트 리스트 동기화',
    icon: Link2,
    path: APP_ROUTES.settingsIntegrations,
    permission: PERMISSIONS.SETTINGS_VIEW,
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

function SettingsLinkCard({
  title,
  description,
  icon: Icon,
  to,
}: {
  title: string
  description: string
  icon: typeof FolderTree
  to: string
}) {
  return (
    <Link to={to} className="block">
      <Card className={cn(pageCardShellClassName, 'transition-colors hover:border-primary/30 hover:bg-accent/30')}>
        <div className="flex flex-row items-start gap-3 px-6 py-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/60">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-base font-semibold">{title}</p>
            <CardDescription>{description}</CardDescription>
          </div>
          <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
        </div>
        <CardContent className="px-6 pb-5 pt-0">
          <Badge tone="info">사용 가능</Badge>
        </CardContent>
      </Card>
    </Link>
  )
}

function SettingsPlaceholderCard({
  title,
  description,
  icon: Icon,
}: {
  title: string
  description: string
  icon: typeof FolderTree
}) {
  return (
    <Card className={cn(pageCardShellClassName, 'opacity-80')}>
      <div className="flex flex-row items-start gap-3 px-6 py-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/60">
          <Icon className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">{title}</p>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
      <CardContent className="px-6 pb-5 pt-0">
        <Badge tone="default">추후 구현 예정</Badge>
      </CardContent>
    </Card>
  )
}

export function SettingsPage() {
  const { checkPermission } = usePermission()

  return (
    <PageShell>
      <PageHeader title="설정" description="MVP 단계 기본 설정 섹션" />
      <PageSection title="표시" description="화면 테마를 선택합니다.">
        <ThemeToggle variant="menu" />
      </PageSection>
      <div className="grid gap-stack md:grid-cols-2">
        {SETTINGS_SECTIONS.map(({ title, description, icon, ...rest }) => {
          const hasAccess = 'permission' in rest ? checkPermission(rest.permission) : false
          const path = 'path' in rest ? rest.path : undefined

          if (path && hasAccess) {
            return (
              <SettingsLinkCard
                key={title}
                title={title}
                description={description}
                icon={icon}
                to={path}
              />
            )
          }

          return (
            <SettingsPlaceholderCard
              key={title}
              title={title}
              description={description}
              icon={icon}
            />
          )
        })}
      </div>
    </PageShell>
  )
}
