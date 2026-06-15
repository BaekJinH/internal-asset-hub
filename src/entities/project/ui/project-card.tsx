import type { Project } from '@/entities/project/model/project-types'
import { ProjectStatusBadge } from '@/entities/project/ui/project-status-badge'
import { formatDate } from '@/shared/lib/format-date'
import { Card } from '@/shared/ui/card'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold">{project.name}</h3>
        <ProjectStatusBadge status={project.status} />
      </div>
      <p className="text-sm text-text-secondary">{project.description}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span>담당자: {project.owner}</span>
        <span>자산: {project.assetCount}개</span>
        <span className="col-span-2">업데이트: {formatDate(project.updatedAt)}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(project.links)
          .filter(([, value]) => Boolean(value))
          .map(([key, value]) => (
            <a key={key} href={value} target="_blank" rel="noreferrer" className="rounded bg-slate-100 px-2 py-1">
              {key}
            </a>
          ))}
      </div>
    </Card>
  )
}
