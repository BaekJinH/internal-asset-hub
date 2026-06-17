import type {
  CategoryBreakdownPoint,
  UploadTrendPoint,
} from '@/widgets/dashboard/lib/build-dashboard-chart-data'

/** 월별 신규 등록 자산 추이 (대시보드 시각화용 집계 mock) */
export const mockUploadTrendData: UploadTrendPoint[] = [
  { month: '1월', uploads: 168 },
  { month: '2월', uploads: 194 },
  { month: '3월', uploads: 221 },
  { month: '4월', uploads: 247 },
  { month: '5월', uploads: 289 },
  { month: '6월', uploads: 165 },
]

/** 전체 자산 기준 카테고리 분포 (대시보드 시각화용 집계 mock) */
export const mockCategoryBreakdownData: CategoryBreakdownPoint[] = [
  { key: 'planning', category: '기획', count: 312 },
  { key: 'development', category: '개발', count: 284 },
  { key: 'design', category: '디자인', count: 241 },
  { key: 'meeting', category: '회의록', count: 198 },
  { key: 'delivery', category: '최종 납품', count: 156 },
  { key: 'media', category: '이미지/영상', count: 58 },
  { key: 'ai-output', category: 'AI 산출물', count: 35 },
]
