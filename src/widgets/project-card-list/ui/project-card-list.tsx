import type { Project } from '@/entities/project'
import { ProjectCard } from '@/entities/project'

interface ProjectCardListProps {
  projects: Project[]
}

export function ProjectCardList({ projects }: ProjectCardListProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
