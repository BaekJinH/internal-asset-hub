import type { AssetCategory, AssetStatus } from '@/entities/asset/model/asset-types'

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  planning: '기획',
  design: '디자인',
  development: '개발',
  meeting: '회의록',
  media: '이미지/영상',
  'ai-output': 'AI 산출물',
  delivery: '최종 납품',
}

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  draft: '초안',
  review: '검토중',
  confirmed: '확정',
  archived: '보관',
  discarded: '폐기',
}
