import { Link } from 'react-router-dom'
import type { Project, ProjectTeamCategory } from '@/entities/project/model/project-types'
import { getProjectCardMetaItems } from '@/entities/project/lib/project-list-metadata'
import { ProjectStatusBadge } from '@/entities/project/ui/project-status-badge'
import { ProjectSyncBadges } from '@/entities/project/ui/project-sync-badges'
import { useCanViewFinancial } from '@/features/auth/model/use-financial-visibility'
import { APP_ROUTES } from '@/shared/config/routes'
import { Card } from '@/shared/ui/card'
import { Tag } from '@/shared/ui/tag'
import { Badge } from '@/shared/ui/badge'
import { fmtKRW } from '@/shared/lib/format-utils'
import { cn } from '@/shared/lib/cn'

interface ProjectCardProps {
  project: Project
  teamContext?: ProjectTeamCategory
  className?: string
}

export function ProjectCard({ project, teamContext, className }: ProjectCardProps) {
  const canViewFinancial = useCanViewFinancial()
  const linkEntries = Object.entries(project.links).filter(([, value]) => Boolean(value))
  const metaItems = getProjectCardMetaItems(project, teamContext)
  const showDescription =
    project.description &&
    !project.description.startsWith('Figma · ') &&
    project.description !== project.name

  return (
    <Card
      interactive
      className={cn(
        'relative flex h-full flex-col gap-4 p-5 transition-[border-color,box-shadow,background-color] hover:bg-accent/20',
        className,
      )}
    >
      <Link
        to={APP_ROUTES.projectDetail.replace(':projectId', project.id)}
        className="absolute inset-0 z-0 rounded-lg"
        aria-label={`${project.name} 상세 보기`}
      />
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{project.name}</h3>
          {showDescription ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <ProjectSyncBadges project={project} className="relative z-10" />
          {project.operations ? (
            <Badge tone="info" className="relative z-10">
              {canViewFinancial ? `운영 · ${fmtKRW(project.operations.contractAmount)}` : '운영'}
            </Badge>
          ) : null}
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>

      <dl className="relative z-10 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {metaItems.map((item) => (
          <div key={item.label} className={item.label === '연동' ? 'col-span-2' : undefined}>
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="truncate font-medium text-foreground tabular-nums">{item.value}</dd>
          </div>
        ))}
        {project.owner ? (
          <div>
            <dt className="text-muted-foreground">담당자</dt>
            <dd className="truncate text-foreground">{project.owner}</dd>
          </div>
        ) : null}
        <div className={project.owner ? undefined : 'col-span-2'}>
          <dt className="text-muted-foreground">자산</dt>
          <dd className="text-foreground tabular-nums">{project.assetCount}개</dd>
        </div>
      </dl>

      {linkEntries.length > 0 ? (
        <div className="relative z-10 flex flex-wrap gap-1.5 pt-1">
          {linkEntries.map(([key, value]) => (
            <Tag key={key} as="a" href={value} className="relative z-10">
              {key}
            </Tag>
          ))}
        </div>
      ) : null}
    </Card>
  )
}
