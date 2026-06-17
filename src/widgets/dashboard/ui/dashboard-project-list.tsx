import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/entities/project'
import { ProjectStatusBadge } from '@/entities/project'
import { APP_ROUTES } from '@/shared/config/routes'
import { formatDate } from '@/shared/lib/format-date'
import { Tag } from '@/shared/ui/tag'
import { NoWrapText, TruncatedText } from '@/shared/ui/text'
import { cn } from '@/shared/lib/cn'

interface DashboardProjectListProps {
  projects: Project[]
  className?: string
}

export function DashboardProjectList({ projects, className }: DashboardProjectListProps) {
  return (
    <div className={cn('divide-y divide-border/60 rounded-lg border border-border/80 bg-card', className)}>
      {projects.map((project) => {
        const linkEntries = Object.entries(project.links).filter(([, value]) => Boolean(value))

        return (
          <Link
            key={project.id}
            to={APP_ROUTES.projectDetail.replace(':projectId', project.id)}
            className="group grid grid-cols-1 gap-3 px-6 py-4 no-underline transition-colors hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_7.5rem_11rem] sm:items-center sm:gap-x-6"
          >
            <div className="min-w-0">
              <TruncatedText text={project.name} className="text-sm font-semibold text-foreground" />
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <NoWrapText muted>{project.owner}</NoWrapText>
                <NoWrapText muted className="tabular-nums">
                  자산 {project.assetCount}개
                </NoWrapText>
                <NoWrapText muted>{formatDate(project.updatedAt)}</NoWrapText>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:contents">
              <div className="flex shrink-0 items-center sm:justify-start">
                <ProjectStatusBadge status={project.status} />
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                {linkEntries.slice(0, 3).map(([key, value]) => (
                  <Tag key={key} as="a" href={value} onClick={(event) => event.stopPropagation()}>
                    {key}
                  </Tag>
                ))}
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
