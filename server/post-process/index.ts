/**
 * STRUCTURAL CUSHIONS ((B)⑤) — deterministic, browser-less post-emit quality enrichment atop the conformance
 * gate/repair/audit. NONE require a real render (that is the DEFERRED render-verify family — a JSDOM stand-in
 * would be a FALSE cushion). All operate purely on the in-memory GeneratedFile[].
 *
 * MEMBERS (ported from devpilot-v2 src/pipeline/post-processor, read-only copy-in + provenance):
 *   · a11y-fixer     — accessible names (img/button/input) + heading-skip detect + html lang inject.
 *   · seo-injector   — <head> meta/OG/Twitter/JSON-LD, per-page canonical.
 *   · sitemap        — sitemap.xml + robots.txt (site-level).
 *
 * ★ router-injector §3 VERDICT = EXCLUDE (honest, measured). devpilot's router-injector is React-Router SPA
 *   EMISSION end to end (react-router-dom, JSX <Routes>/<NavLink>, ReactDOM.createRoot, raw Tailwind palette
 *   literals, hardcoded Korean 404 copy) → it belongs with the DEFERRED react emitter, not the static layer.
 *   Its only target-neutral core (route→nav projection) is REDUNDANT: the static emitter already builds
 *   <nav aria-current> from the sitemap and dynamic-final-repair already does route-alias + internal-link
 *   normalization. The one genuinely missing static piece is a 404 fallback PAGE — ported here as a TOKEN-ONLY
 *   static page spec (host tokens only, gate-conformant), NOT devpilot's palette-literal JSX. (The `*` catch-all
 *   that actually serves 404.html is a host/static-hosting rewrite concern — out of ⑤ scope.)
 */
import type { BuildManifest, GeneratedFile, PageSpec } from '../contract'
import { neutralizeColorLiteralsHtml } from './neutralize'
import type { A11ySeeds } from './a11y-fixer'
import type { PageCategory, SeoSeeds } from './seo-injector'
import { generateSitemap, generateRobotsTxt, type SitemapPage } from './sitemap'

export interface StructuralSeeds extends SeoSeeds {
  /** a11y last-resort accessible names + html lang. */
  a11y: A11ySeeds
  /** sitemap last-modified (YYYY-MM-DD); omitted → no <lastmod> (determinism). */
  lastmod?: string
  /** robots.txt Disallow paths. */
  disallowPaths: string[]
  /** static 404 page copy (router-injector's salvaged static piece). */
  notFound: { title: string; body: string }
}

/** Backward-compatible defaults — an un-configured pipeline still gets full structural cushions. baseUrl is a
 *  documented placeholder; the deployer overrides it (canonical/OG/sitemap are only as correct as the origin). */
export const defaultStructuralSeeds: StructuralSeeds = {
  baseUrl: 'https://example.com',
  locale: 'ko_KR',
  defaultCategory: 'corporate' as PageCategory,
  categoryKeywords: {
    landing: ['랜딩', '소개', '서비스'],
    corporate: ['기업', '회사', '소개'],
    portfolio: ['포트폴리오', '작품', '프로젝트'],
    ecommerce: ['쇼핑몰', '상품', '판매'],
    admin: ['관리자', '대시보드', '통계'],
  },
  a11y: { buttonLabel: '버튼', inputLabel: '입력', htmlLang: 'ko' },
  disallowPaths: [],
  notFound: { title: '404 — 페이지를 찾을 수 없습니다', body: '요청하신 페이지를 찾을 수 없습니다.' },
}

/** The synthetic PageSpec for the static 404 page (route '/404' → 404.html via routeToFile). The seed copy is
 *  neutralized so a hex-shaped token in the 404 title/body (e.g. 'Error #404') cannot trip the site-wide gate. */
export function notFoundSpec(seeds: StructuralSeeds): PageSpec {
  return {
    pageId: 'not_found',
    route: '/404',
    title: neutralizeColorLiteralsHtml(seeds.notFound.title),
    sections: [neutralizeColorLiteralsHtml(seeds.notFound.body)],
    dependsOn: [],
  }
}

/** SITE-LEVEL cushions emitted ONCE per manifest: sitemap.xml + robots.txt. (404.html is emitted via the
 *  emitter in the generate seam because it reuses the token page skeleton.) */
export function buildSiteCushions(manifest: BuildManifest, seeds: StructuralSeeds): GeneratedFile[] {
  const pages: SitemapPage[] = manifest.sitemap.map((p) => ({ path: p.route }))
  return [
    { path: 'sitemap.xml', content: generateSitemap(pages, seeds.baseUrl, seeds.lastmod) },
    { path: 'robots.txt', content: generateRobotsTxt(seeds.baseUrl, { disallowPaths: seeds.disallowPaths }) },
  ]
}

export type { A11yReport, A11ySeeds } from './a11y-fixer'
export type { SeoSeeds, PageCategory } from './seo-injector'
export type { SitemapPage, ChangeFreq } from './sitemap'
