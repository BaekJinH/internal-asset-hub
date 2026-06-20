import { Badge } from '@/shared/ui/badge'
import { PageHeader } from '@/shared/ui/page-header'
import { PageShell } from '@/shared/ui/page-shell'
import { SectionHeader } from '@/shared/ui/section-header'
import { PageSection } from '@/shared/ui/page-section'
import {
  AI_FEATURE_ITEMS,
  AI_FEATURE_STATUS_LABELS,
  AI_FEATURE_STATUS_TONES,
} from '@/widgets/ai-feature-list'

const GROUPED_ITEMS = {
  planned: {
    title: '개발 예정',
    description: '로드맵에 포함된 AI 기능',
    items: AI_FEATURE_ITEMS.filter(([, status]) => status === 'planned'),
  },
  review: {
    title: '검토 중',
    description: '내부 검토 및 기술 타당성 평가 중',
    items: AI_FEATURE_ITEMS.filter(([, status]) => status === 'review'),
  },
  future: {
    title: '향후 검토',
    description: '중장기 로드맵 후보',
    items: AI_FEATURE_ITEMS.filter(([, status]) => status === 'future'),
  },
  excluded: {
    title: 'MVP 제외',
    description: '현재 MVP 범위에서 제외된 기능',
    items: AI_FEATURE_ITEMS.filter(([, status]) => status === 'excluded'),
  },
} as const

export function AiExtensionPage() {
  return (
    <PageShell>
      <PageHeader title="AI 확장" description="아래 항목은 향후 확장 예정 기능입니다." />
      {Object.values(GROUPED_ITEMS).map(({ title, description, items }) =>
        items.length > 0 ? (
          <section key={title} className="space-y-6">
            <SectionHeader title={title} description={description} />
            <div className="grid gap-6 md:grid-cols-2">
              {items.map(([name, status]) => (
                <PageSection key={name} title={name}>
                  <Badge tone={AI_FEATURE_STATUS_TONES[status]}>
                    {AI_FEATURE_STATUS_LABELS[status]}
                  </Badge>
                </PageSection>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </PageShell>
  )
}
