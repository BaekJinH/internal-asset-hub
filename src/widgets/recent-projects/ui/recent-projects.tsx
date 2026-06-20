import { FolderKanban } from 'lucide-react'
import type { Project } from '@/entities/project'
import { ProjectCard } from '@/entities/project'
import { EmptyState } from '@/shared/ui/empty-state'
import { cn } from '@/shared/lib/cn'

interface RecentProjectsProps {
  projects: Project[]
  className?: string
}

export function RecentProjects({ projects, className }: RecentProjectsProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="프로젝트 없음"
        description="아직 등록된 프로젝트가 없습니다."
        className={className}
      />
    )
  }

  return (
    <section className={cn('grid gap-stack md:grid-cols-2', className)}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  )
}
