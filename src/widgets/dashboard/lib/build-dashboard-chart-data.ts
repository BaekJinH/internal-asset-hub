import { ASSET_CATEGORY_LABELS } from '@/entities/asset/model/asset-constants'
import type { Asset, AssetCategory } from '@/entities/asset/model/asset-types'
import type { Project } from '@/entities/project'
import { formatChartProjectLabel } from '@/shared/lib/format-chart-label'

const UPLOAD_MONTHS = [
  { key: '2026-01', label: '1월' },
  { key: '2026-02', label: '2월' },
  { key: '2026-03', label: '3월' },
  { key: '2026-04', label: '4월' },
  { key: '2026-05', label: '5월' },
  { key: '2026-06', label: '6월' },
] as const

export interface UploadTrendPoint {
  month: string
  uploads: number
}

export interface CategoryBreakdownPoint {
  category: string
  key: AssetCategory
  count: number
}

export interface ProjectAssetPoint {
  project: string
  fullName: string
  assets: number
}

export function buildUploadTrendData(assets: Asset[]): UploadTrendPoint[] {
  return UPLOAD_MONTHS.map(({ key, label }) => ({
    month: label,
    uploads: assets.filter((asset) => asset.createdAt.startsWith(key)).length,
  }))
}

export function buildCategoryBreakdownData(assets: Asset[]): CategoryBreakdownPoint[] {
  return (Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[])
    .map((key) => ({
      key,
      category: ASSET_CATEGORY_LABELS[key],
      count: assets.filter((asset) => asset.category === key).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
}

export function buildProjectAssetDistributionData(projects: Project[]): ProjectAssetPoint[] {
  return [...projects]
    .sort((a, b) => b.assetCount - a.assetCount)
    .map((project) => ({
      project: formatChartProjectLabel(project.name),
      fullName: project.name,
      assets: project.assetCount,
    }))
}

export function getTotalRegisteredAssets(projects: Project[]) {
  return projects.reduce((total, project) => total + project.assetCount, 0)
}

export function getRecentUploadCount(assets: Asset[], since = '2026-06-01') {
  return assets.filter((asset) => asset.updatedAt >= since).length
}

/** 샘플 자산 수가 적을 때 대시보드 차트용 mock 집계 데이터 사용 */
export function shouldUseAggregateChartData(assets: Asset[]) {
  return assets.length < 50
}
