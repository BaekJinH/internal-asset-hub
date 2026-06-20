import type { Project } from '@/entities/project'
import { ProjectCard } from '@/entities/project'
import { EmptyState } from '@/shared/ui/empty-state'
import { FolderKanban } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

interface ProjectCardListProps {
  projects: Project[]
  className?: string
}

export function ProjectCardList({ projects, className }: ProjectCardListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="프로젝트 없음"
        description="표시할 프로젝트가 없습니다."
        className={className}
      />
    )
  }

  return (
    <div className={cn('grid gap-5 md:grid-cols-2 xl:grid-cols-3', className)}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
