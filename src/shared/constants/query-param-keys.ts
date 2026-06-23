/** URL query parameter 키 — 탭·카테고리·필터 상태 동기화용 */
export const QUERY_PARAMS = {
  /** 검색어 (q) */
  q: 'q',
  /** 탭 (페이지별 의미 다름 — 아래 QUERY_PARAM_SCHEMA 참고) */
  tab: 'tab',
  /** 팀 탭: dev | publishing | design */
  team: 'team',
  /** 필터 상태: all 또는 enum 값 */
  status: 'status',
  /** 자산/검색 카테고리: all 또는 AssetCategory */
  category: 'category',
  /** 검색 — 프로젝트 필터 */
  project: 'project',
  /** 검색 — 담당자 */
  owner: 'owner',
  /** 검색 — 태그 */
  tags: 'tags',
  /** 검색 — 날짜 */
  date: 'date',
  /** 이익률 뷰: amount | md */
  view: 'view',
} as const

export type QueryParamKey = (typeof QUERY_PARAMS)[keyof typeof QUERY_PARAMS]

/** 라우트별 query parameter 스키마 (rules·문서용) */
export const QUERY_PARAM_SCHEMA = {
  '/projects': [QUERY_PARAMS.team, QUERY_PARAMS.status, QUERY_PARAMS.q],
  '/projects/:projectId': [QUERY_PARAMS.tab, QUERY_PARAMS.category],
  '/search': [
    QUERY_PARAMS.q,
    QUERY_PARAMS.project,
    QUERY_PARAMS.category,
    QUERY_PARAMS.status,
    QUERY_PARAMS.owner,
    QUERY_PARAMS.tags,
    QUERY_PARAMS.date,
  ],
  '/operations/profit': [QUERY_PARAMS.view],
} as const
