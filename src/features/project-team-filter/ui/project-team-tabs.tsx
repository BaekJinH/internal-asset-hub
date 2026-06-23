import type { ProjectTeamCategory } from '@/entities/project/model/project-types'
import { PROJECT_TEAM_LABELS, PROJECT_TEAM_TABS } from '@/entities/project/model/project-constants'
import { TabsRoot, TabsList, TabsTrigger } from '@/shared/ui/tabs'

interface ProjectTeamTabsProps {
  value: ProjectTeamCategory
  onChange: (value: ProjectTeamCategory) => void
}

export function ProjectTeamTabs({ value, onChange }: ProjectTeamTabsProps) {
  return (
    <TabsRoot value={value} onValueChange={(next) => onChange(next as ProjectTeamCategory)}>
      <TabsList>
        {PROJECT_TEAM_TABS.map((team) => (
          <TabsTrigger key={team} value={team}>
            {PROJECT_TEAM_LABELS[team]}
          </TabsTrigger>
        ))}
      </TabsList>
    </TabsRoot>
  )
}
