import type { Project } from '@/entities/project/model/project-types'
import { resolveProjectSyncMeta } from '@/entities/project/lib/project-sync-utils'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/cn'

interface ProjectSyncBadgesProps {
  project: Project
  className?: string
}

export function ProjectSyncBadges({ project, className }: ProjectSyncBadgesProps) {
  const { notionLinked, githubLinked, figmaLinked } = resolveProjectSyncMeta(project)

  if (!notionLinked && !githubLinked && !figmaLinked) return null

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {notionLinked ? (
        <Badge tone="info" className="text-[10px]">
          Notion
        </Badge>
      ) : null}
      {githubLinked ? (
        <Badge tone="default" className="text-[10px]">
          GitHub
        </Badge>
      ) : null}
      {figmaLinked ? (
        <Badge tone="default" className="text-[10px]">
          Figma
        </Badge>
      ) : null}
    </div>
  )
}
