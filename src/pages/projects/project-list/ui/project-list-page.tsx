import { mockProjects } from '@/shared/mocks/mock-projects'
import { useProjectFilter } from '@/features/project-filter'
import { ProjectStatusFilter } from '@/features/project-filter'
import { ProjectCardList } from '@/widgets/project-card-list'
import { SearchInput } from '@/shared/ui/search-input'
import { PageHeader } from '@/shared/ui/page-header'
import { EmptyState } from '@/shared/ui/empty-state'
import type { Project } from '@/entities/project'

export function ProjectListPage() {
  const projects = mockProjects as Project[]
  const { query, setQuery, status, setStatus, filteredProjects } = useProjectFilter(projects)

  return (
    <div className="space-y-6">
      <PageHeader title="프로젝트 목록" description="프로젝트별 자산과 연결 링크를 관리합니다." />
      <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="프로젝트 검색" />
        <ProjectStatusFilter value={status} onChange={setStatus} />
      </section>
      {filteredProjects.length > 0 ? (
        <ProjectCardList projects={filteredProjects} />
      ) : (
        <EmptyState title="프로젝트 없음" description="검색 조건에 맞는 프로젝트가 없습니다." />
      )}
    </div>
  )
}
