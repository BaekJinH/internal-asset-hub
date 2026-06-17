import { Link } from 'react-router-dom'
import type { Project } from '@/entities/project/model/project-types'
import { ProjectStatusBadge } from '@/entities/project/ui/project-status-badge'
import { formatDate } from '@/shared/lib/format-date'
import { APP_ROUTES } from '@/shared/config/routes'
import { Card } from '@/shared/ui/card'
import { Tag } from '@/shared/ui/tag'
import { cn } from '@/shared/lib/cn'

interface ProjectCardProps {
  project: Project
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const linkEntries = Object.entries(project.links).filter(([, value]) => Boolean(value))

  return (
    <Link
      to={APP_ROUTES.projectDetail.replace(':projectId', project.id)}
      className={cn('group block text-foreground no-underline', className)}
    >
      <Card
        interactive
        className="flex h-full flex-col gap-3 p-4 transition-[border-color,box-shadow,background-color] group-hover:bg-accent/20"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground">{project.name}</h3>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{project.description}</p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{project.owner}</span>
          <span className="text-right tabular-nums">자산 {project.assetCount}개</span>
          <span className="col-span-2">{formatDate(project.updatedAt)}</span>
        </div>

        {linkEntries.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {linkEntries.map(([key, value]) => (
              <Tag key={key} as="a" href={value} onClick={(event) => event.stopPropagation()}>
                {key}
              </Tag>
            ))}
          </div>
        ) : null}
      </Card>
    </Link>
  )
}
