import { Card } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'

const SETTINGS_SECTIONS = ['카테고리 관리', '태그 관리', '접근 제어', '서버 상태', '파일 네이밍 규칙', '스토리지 정책']

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="설정" description="MVP 단계 기본 설정 섹션" />
      <div className="grid gap-3 md:grid-cols-2">
        {SETTINGS_SECTIONS.map((section) => (
          <Card key={section} className="min-h-24">
            <h3 className="text-base font-semibold">{section}</h3>
            <p className="mt-1 text-sm text-text-secondary">세부 기능은 추후 구현 예정입니다.</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
