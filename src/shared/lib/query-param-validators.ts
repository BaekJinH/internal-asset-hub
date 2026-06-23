import type { AssetCategory, AssetStatus } from '@/entities/asset/model/asset-types'
import type { ProjectStatus, ProjectTeamCategory } from '@/entities/project/model/project-types'

export const PROJECT_TEAM_VALUES = ['dev', 'publishing', 'design'] as const satisfies readonly ProjectTeamCategory[]

export const PROJECT_STATUS_FILTER_VALUES = [
  'all',
  'active',
  'completed',
  'paused',
  'internal',
  'cancelled',
] as const satisfies readonly (ProjectStatus | 'all')[]

export const PROJECT_DETAIL_TAB_VALUES = ['overview', 'assets', 'operations'] as const

export const ASSET_CATEGORY_FILTER_VALUES = [
  'all',
  'planning',
  'design',
  'development',
  'meeting',
  'media',
  'ai-output',
  'delivery',
] as const satisfies readonly (AssetCategory | 'all')[]

export const ASSET_STATUS_FILTER_VALUES = [
  'all',
  'draft',
  'review',
  'confirmed',
  'archived',
  'discarded',
] as const satisfies readonly (AssetStatus | 'all')[]

export const PROFIT_VIEW_VALUES = ['amount', 'md'] as const

export function isAllowedQueryValue<T extends string>(
  value: string,
  allowed: readonly T[],
): value is T {
  return (allowed as readonly string[]).includes(value)
}
