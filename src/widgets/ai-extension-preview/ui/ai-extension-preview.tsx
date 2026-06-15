import { Card } from '@/shared/ui/card'

const AI_FEATURE_ITEMS = [
  ['문서 자동 요약', 'Planned'],
  ['자동 태그 추천', 'Future'],
  ['자동 파일 분류', 'MVP Excluded'],
  ['내부 문서 챗봇', 'Under Review'],
] as const

export function AiExtensionPreview() {
  return (
    <Card>
      <h3 className="mb-3 text-base font-semibold">AI 확장 미리보기</h3>
      <ul className="space-y-2 text-sm">
        {AI_FEATURE_ITEMS.map(([name, status]) => (
          <li key={name} className="flex justify-between">
            <span>{name}</span>
            <span className="text-text-secondary">{status}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
