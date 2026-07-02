/**
 * COMPONENT SELECTOR — requirements → ordered reference-catalog component ids (the (B) increment-③).
 *
 * CANONICAL SOURCE (extract-first, read-only, verbatim-confirmed): devpilot-v2
 *   src/pipeline/intelligence/component-selector.ts  (recommend / extractMatchedCategories / pickComponentForCategory)
 *   src/pipeline/intelligence/blueprint-gating.ts    (isBlueprintGated — structural gate against render-hostile categories)
 *
 * GENERALIZATION (workorder §1③ + §3): the SELECTION ALGORITHM is ported unchanged (keyword→category matching,
 *   per-category pick, dedup, fallback, chrome wrapper). The DATA that was hardcoded to devpilot's private
 *   catalog is lifted to injectable config (§3 mechanism = ported, personal ids/keywords = overridable seed):
 *     - `KEYWORD_TO_CATEGORY` (Korean requirements taxonomy) → DEFAULT_KEYWORD_MAP (overridable).
 *     - subType id lists (STATS/LOGO/GALLERY_COMPONENT_IDS = devpilot component ids) → opts.subTypeCandidates
 *       (default {} → subType degrades to a plain category pick; a reference declares its own subType candidates).
 *     - Navbar_v1 / Footer_v1 hardcoded chrome ids → a navigation-category wrapper resolved by naming pattern
 *       (the reference project's own header/footer components), so no devpilot id is assumed.
 *
 * The SELECTION TARGET is the reference cushion catalog (buildReferenceCatalog output), not devpilot's manifest —
 *   exactly the "manifest 소스 교체" the workorder specifies. Pure + deterministic (no LLM, verifiable now).
 */
import type { ReferenceCatalog } from './reference-catalog'

/** requirements keyword → category (+ optional subType). Overridable seed (ported verbatim from devpilot). */
export interface KeywordMapping {
  keywords: string[]
  category: string
  subType?: string
}

export interface SelectOptions {
  /** domain string for domain-aware picking (matched against a component's recommendedDomains). Default ''. */
  domain?: string
  /** requirements taxonomy (default = DEFAULT_KEYWORD_MAP). */
  keywordMap?: KeywordMapping[]
  /** subType → candidate component ids in the reference catalog (default {} → subType falls to category pick). */
  subTypeCandidates?: Record<string, string[]>
  /** fallback categories when nothing matched (default = DEFAULT_FALLBACK_CATEGORIES). */
  fallbackCategories?: string[]
  /** chrome wrapper resolution (generalizes devpilot's hardcoded Navbar_v1/Footer_v1). */
  wrapper?: WrapperOptions
}

export interface WrapperOptions {
  /** catalog category holding chrome components (default 'navigation'). */
  navigationCategory?: string
  /** id/filename pattern for the header/nav component to prepend (default matches nav/navbar/header). */
  headerPattern?: RegExp
  /** id/filename pattern for the footer component to append (default matches footer). */
  footerPattern?: RegExp
}

export interface SelectionResult {
  /** final ordered component ids: [header?, ...body, footer?]. */
  ordered: string[]
  /** selected body component ids (excludes the chrome wrapper). */
  body: string[]
  /** resolved chrome (null when the catalog has no matching navigation component). */
  header: string | null
  footer: string | null
  /** categories matched from the requirements (in taxonomy order). */
  matched: Array<{ category: string; subType?: string }>
  /** true when no category matched and the fallback set was used. */
  usedFallback: boolean
}

/** DEFAULT requirements taxonomy — devpilot KEYWORD_TO_CATEGORY verbatim (Korean). Overridable per project. */
export const DEFAULT_KEYWORD_MAP: KeywordMapping[] = [
  { keywords: ['히어로', '메인', '비주얼', '대문'], category: 'hero' },
  { keywords: ['서비스', '기능', '소개', '특징'], category: 'feature' },
  { keywords: ['가격', '요금', '플랜'], category: 'pricing' },
  { keywords: ['후기', '리뷰', '추천', '고객'], category: 'social_proof' },
  { keywords: ['FAQ', '질문', '자주'], category: 'faq' },
  { keywords: ['지도', '오시는 길', '위치', '주소'], category: 'location' },
  { keywords: ['문의', '연락', '상담', '신청'], category: 'form' },
  { keywords: ['공지', '뉴스', '블로그', '게시판'], category: 'content' },
  { keywords: ['팀', '의료진', '직원', '강사'], category: 'team' },
  { keywords: ['통계', '수치', '성과', '지표'], category: 'social_proof', subType: 'stats' },
  { keywords: ['로고', '파트너', '협력'], category: 'social_proof', subType: 'logos' },
  { keywords: ['갤러리', '포트폴리오', '작품'], category: 'content', subType: 'gallery' },
]

/** devpilot fallback set (recommend() lines 127). */
export const DEFAULT_FALLBACK_CATEGORIES = ['hero', 'feature', 'cta']

/** Categories excluded from auto selection — render-hostile in a standalone/static build (blueprint-gating.ts). */
export const BLUEPRINT_GATED_CATEGORIES: ReadonlySet<string> = new Set(['threejs', 'interactive'])

/** true if a category is gated out of auto selection (devpilot isBlueprintGated, verbatim). */
export function isBlueprintGated(category: string | undefined | null): boolean {
  return !!category && BLUEPRINT_GATED_CATEGORIES.has(category)
}

const DEFAULT_WRAPPER: Required<WrapperOptions> = {
  navigationCategory: 'navigation',
  headerPattern: /(?:^|[_-])?(?:nav|navbar|header)/i,
  footerPattern: /footer/i,
}

/** requirements → matched {category, subType}, deduped, first-match-per-mapping (devpilot extractMatchedCategories). */
function extractMatchedCategories(
  requirements: string,
  keywordMap: KeywordMapping[],
): Array<{ category: string; subType?: string }> {
  const matched: Array<{ category: string; subType?: string }> = []
  const seen = new Set<string>()
  for (const mapping of keywordMap) {
    for (const kw of mapping.keywords) {
      if (requirements.includes(kw)) {
        const key = `${mapping.category}:${mapping.subType ?? ''}`
        if (!seen.has(key)) {
          seen.add(key)
          matched.push({ category: mapping.category, subType: mapping.subType })
        }
        break
      }
    }
  }
  return matched
}

/** first existing catalog id in `ids` whose component recommends `domain` (domain-aware), else first existing. */
function pickFromCandidates(catalog: ReferenceCatalog, ids: string[], domain: string): string | null {
  if (domain) {
    for (const id of ids) {
      const meta = catalog.components[id]
      if (meta && meta.recommendedDomains?.includes(domain)) return id
    }
  }
  for (const id of ids) if (catalog.components[id]) return id
  return null
}

/** pick one component for a (category, subType) from the reference catalog (devpilot pickComponentForCategory). */
function pickComponentForCategory(
  catalog: ReferenceCatalog,
  category: string,
  domain: string,
  subType: string | undefined,
  subTypeCandidates: Record<string, string[]>,
): string | null {
  if (isBlueprintGated(category)) return null
  if (subType) {
    const candidates = subTypeCandidates[subType]
    // Prefer a declared subType candidate; if none is declared OR none resolves in the catalog, degrade to a
    // plain category pick rather than dropping the matched requirement (increment-① catalogs declare none).
    if (candidates && candidates.length > 0) {
      const picked = pickFromCandidates(catalog, candidates, domain)
      if (picked) return picked
    }
  }
  const categoryIds = catalog.categories[category]
  if (!categoryIds || categoryIds.length === 0) return null
  return pickFromCandidates(catalog, categoryIds, domain) ?? categoryIds[0] ?? null
}

/** resolve the header/footer chrome from the navigation category by naming pattern (generalizes Navbar_v1/Footer_v1). */
function resolveWrapper(
  catalog: ReferenceCatalog,
  used: Set<string>,
  wrapper: Required<WrapperOptions>,
): { header: string | null; footer: string | null } {
  const chrome = catalog.categories[wrapper.navigationCategory] ?? []
  const header =
    chrome.find((id) => !used.has(id) && catalog.components[id] && wrapper.headerPattern.test(id)) ?? null
  const footer =
    chrome.find(
      (id) => id !== header && !used.has(id) && catalog.components[id] && wrapper.footerPattern.test(id),
    ) ?? null
  return { header, footer }
}

/**
 * Select ordered reference-catalog component ids for a requirements string (devpilot recommend(), generalized).
 * Chrome (header/footer) is resolved from the navigation category and wraps the selected body.
 */
export function selectComponents(
  requirements: string,
  catalog: ReferenceCatalog,
  opts: SelectOptions = {},
): SelectionResult {
  const domain = opts.domain ?? ''
  const keywordMap = opts.keywordMap ?? DEFAULT_KEYWORD_MAP
  const subTypeCandidates = opts.subTypeCandidates ?? {}
  const fallbackCategories = opts.fallbackCategories ?? DEFAULT_FALLBACK_CATEGORIES
  const wrapper = { ...DEFAULT_WRAPPER, ...opts.wrapper }

  const matched = extractMatchedCategories(requirements, keywordMap)
  const body: string[] = []
  const used = new Set<string>()

  for (const { category, subType } of matched) {
    const picked = pickComponentForCategory(catalog, category, domain, subType, subTypeCandidates)
    if (picked && !used.has(picked)) {
      used.add(picked)
      body.push(picked)
    }
  }

  let usedFallback = false
  if (body.length === 0) {
    usedFallback = true
    for (const cat of fallbackCategories) {
      const picked = pickComponentForCategory(catalog, cat, domain, undefined, subTypeCandidates)
      if (picked && !used.has(picked)) {
        used.add(picked)
        body.push(picked)
      }
    }
  }

  const { header, footer } = resolveWrapper(catalog, used, wrapper)
  const ordered = [...(header ? [header] : []), ...body, ...(footer ? [footer] : [])]
  return { ordered, body, header, footer, matched, usedFallback }
}
