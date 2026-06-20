import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { projectService } from '@/entities/project/api/project-service'
import { useOperationsInit } from '@/features/operations-data/model/use-operations-init'
import { useOperationsStore } from '@/features/operations-data/model/operations-store'
import { useProjectFilter } from '@/features/project-filter'
import { ProjectStatusFilter } from '@/features/project-filter'
import { ProjectCardList } from '@/widgets/project-card-list'
import { ProjectOpsForm } from '@/features/project-ops-form'
import { useCanViewFinancial } from '@/features/auth/model/use-financial-visibility'
import { SearchInput } from '@/shared/ui/search-input'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell } from '@/shared/ui/page-shell'
import { PageSection } from '@/shared/ui/page-section'
import { EmptyState } from '@/shared/ui/empty-state'
import { Button } from '@/shared/ui/button'
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import type { Project } from '@/entities/project'
import { stripFinancialFromProject } from '@/entities/project/lib/strip-financial'

export function ProjectListPage() {
  useOperationsInit()
  const canViewFinancial = useCanViewFinancial()
  const setProjects = useOperationsStore((s) => s.setProjects)
  const [localProjects, setLocalProjects] = useState<Project[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  const openProjectForm = (project: Project) => {
    setEditing(project)
    setSheetOpen(true)
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      window.setTimeout(() => setEditing(null), 350)
    }
  }

  useEffect(() => {
    projectService.getProjects().then((list) => {
      setLocalProjects(list)
      setProjects(list)
    })
  }, [setProjects])

  const { query, setQuery, status, setStatus, filteredProjects } = useProjectFilter(localProjects)
  const displayProjects = canViewFinancial
    ? filteredProjects
    : filteredProjects.map(stripFinancialFromProject)

  const handleSave = async (project: Project) => {
    const saved = await projectService.saveProject(project)
    const next = localProjects.some((p) => p.id === saved.id)
      ? localProjects.map((p) => (p.id === saved.id ? saved : p))
      : [...localProjects, saved]
    setLocalProjects(next)
    setProjects(next)
    setSheetOpen(false)
    window.setTimeout(() => setEditing(null), 350)
  }

  return (
    <PageShell>
      <PageHeader
        title="프로젝트 목록"
        description="프로젝트별 자산, 연결 링크, 운영 정보를 관리합니다."
        actions={
          canViewFinancial ? (
            <Button onClick={() => openProjectForm(projectService.createEmptyProject())}>
              <Plus className="mr-2 h-4 w-4" /> 프로젝트 추가
            </Button>
          ) : undefined
        }
      />
      <PageSection title="검색 및 필터" padded>
        <div className="grid items-end gap-stack md:grid-cols-[2fr_1fr]">
          <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="프로젝트 검색" />
          <ProjectStatusFilter value={status} onChange={setStatus} />
        </div>
      </PageSection>
      {displayProjects.length > 0 ? (
        <ProjectCardList projects={displayProjects} />
      ) : (
        <EmptyState title="프로젝트 없음" description="검색 조건에 맞는 프로젝트가 없습니다." />
      )}

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          {editing ? (
            <>
              <SheetHeader>
                <SheetTitle>{editing.name ? '프로젝트 편집' : '프로젝트 추가'}</SheetTitle>
              </SheetHeader>
              <SheetBody>
                <ProjectOpsForm
                  project={editing}
                  onSave={handleSave}
                  onCancel={() => handleSheetOpenChange(false)}
                />
              </SheetBody>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </PageShell>
  )
}
