import { Link } from 'react-router-dom'
import type { Project } from '@/entities/project/model/project-types'
import { ProjectStatusBadge } from '@/entities/project/ui/project-status-badge'
import { useCanViewFinancial } from '@/features/auth/model/use-financial-visibility'
import { formatDate } from '@/shared/lib/format-date'
import { APP_ROUTES } from '@/shared/config/routes'
import { Card } from '@/shared/ui/card'
import { Tag } from '@/shared/ui/tag'
import { Badge } from '@/shared/ui/badge'
import { fmtKRW } from '@/shared/lib/format-utils'
import { cn } from '@/shared/lib/cn'

interface ProjectCardProps {
  project: Project
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const canViewFinancial = useCanViewFinancial()
  const linkEntries = Object.entries(project.links).filter(([, value]) => Boolean(value))

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
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {project.operations && (
            <Badge tone="info" className="relative z-10">
              {canViewFinancial ? `운영 · ${fmtKRW(project.operations.contractAmount)}` : '운영'}
            </Badge>
          )}
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{project.owner}</span>
        <span className="text-right tabular-nums">자산 {project.assetCount}개</span>
        <span className="col-span-2">{formatDate(project.updatedAt)}</span>
      </div>

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
