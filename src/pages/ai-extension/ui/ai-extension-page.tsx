import { Card } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'

const AI_EXTENSION_ITEMS = [
  ['Automatic document summary', 'Planned'],
  ['Automatic tag recommendation', 'Future'],
  ['Automatic file classification', 'MVP Excluded'],
  ['Internal document chatbot', 'Under Review'],
  ['Image conversion', 'Future'],
  ['Local model integration', 'Planned'],
  ['Embedding-based search', 'Under Review'],
  ['Batch file processing', 'MVP Excluded'],
] as const

export function AiExtensionPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="AI 확장" description="아래 항목은 향후 확장 예정 기능입니다." />
      <div className="grid gap-3 md:grid-cols-2">
        {AI_EXTENSION_ITEMS.map(([name, status]) => (
          <Card key={name} className="space-y-2">
            <h3 className="text-base font-semibold">{name}</h3>
            <p className="text-sm text-text-secondary">상태: {status}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
