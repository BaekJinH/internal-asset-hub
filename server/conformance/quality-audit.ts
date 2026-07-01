/**
 * QUALITY AUDIT — deterministic static quality check, no LLM.
 *
 * PORT of n8n v31 "S19 품질 검사" (`n8n-nodes-base.code`, deterministic — verified: the node is a Code
 * node, NOT the sibling LLM `S19 최종 리페어` chainLlm). PHASE-MAP · 회사 검증 자산.
 *   stripTags / words / classesUsed / cssClassesDefined + per-file checks + scoring = 소스 알고리즘 그대로(faithful).
 *   score = max(0, 100 − issues·25 − warnings·3)  ← 소스 채점식 1:1 이식.
 *
 * faithful-adaptation (S20과 동일 경계): 소스의 parsePack/routeMap/extractIntent 는 n8n 파이프라인-state
 *   어댑터(prev JSON blob 파싱)라 이식 안 함 — 구조화된 GeneratedFile[]/BuildManifest 를 직접 읽는다.
 *
 * DEFERRED: 소스의 intent 기반 검사(navigation_pattern/content_collection_pattern 대비 구조 warning)는
 *   layoutIntentJson(=analyze/Phase-1 산출)이 있어야 참조축이 성립한다. 현재 IR(BuildManifest)엔 없으므로
 *   보류 — devpilot-v2 layout_intent 를 IR에 배선(analyze 추출)할 때 활성화. 없는 축을 검사하면 dead-code라
 *   정직하게 미포함. (RepairReport 옆의 진단 짝: repair가 *고치고*, audit이 *점수화*.)
 *
 * 역할: conformance 게이트(runGate = hard pass/fail)를 보완하는 ADVISORY 진단. 게이트는 순응을 강제하고,
 *   audit은 완성도(밀도·구조·placeholder·미정의 class)를 점수화해 어디를 보강할지 가리킨다.
 */
import type { BuildManifest, GeneratedFile } from '../contract'
import { routeToFile } from '../emitters/static-emitter'

/** 소스의 미정의-class whitelist — 레이아웃 primitive는 CSS 정의 없이도 정상. (faithful) */
const LAYOUT_PRIMITIVES = new Set<string>([
  'container', 'container-wide', 'container-narrow', 'section', 'section-sm', 'section-lg',
  'measure', 'measure-heading', 'stack', 'cluster', 'sr-only', 'reveal',
  'text-center', 'text-left', 'text-muted', 'js-ready',
])

/** script/style/tag 제거 → 순수 텍스트. (faithful) */
function stripTags(html: string): string {
  return String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 단어 토큰 수(유니코드 letter/number/_/-). (faithful) */
function words(text: string): number {
  return (String(text || '').match(/[\p{L}\p{N}_-]+/gu) || []).length
}

/** HTML에서 실제 사용된 class 집합. (faithful) */
function classesUsed(html: string): Set<string> {
  const set = new Set<string>()
  for (const m of String(html || '').matchAll(/class\s*=\s*["']([^"']+)["']/g))
    for (const c of m[1].split(/\s+/)) if (c) set.add(c)
  return set
}

/** CSS에서 정의된 class 선택자 집합. (faithful) */
function cssClassesDefined(css: string): Set<string> {
  const set = new Set<string>()
  for (const m of String(css || '').matchAll(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g)) set.add(m[1])
  return set
}

export interface QualityReport {
  qualityScore: number // 0..100
  issues: string[] // severe (−25 each) — 실행 불가급
  warnings: string[] // soft (−3 each) — 완성도 보강 지점
  htmlFiles: string[]
  routeCount: number
}

const basename = (p: string): string => p.split('/').pop() || p

/**
 * 정적 품질 audit. files = emit(+repair) 산출물, manifest = route contract 소스(선택).
 * 소스 S19의 결정적 검사부를 그대로 이식; 채점식 1:1.
 */
export function runQualityAudit(files: GeneratedFile[], manifest?: BuildManifest): QualityReport {
  const issues: string[] = []
  const warnings: string[] = []

  // header/footer partial은 페이지가 아니므로 제외. (소스 그대로)
  const htmlFiles = files.filter((f) => /\.html?$/i.test(f.path) && !/header|footer/i.test(basename(f.path)))
  const css = files.filter((f) => /\.css$/i.test(f.path)).map((f) => f.content).join('\n')
  const defined = cssClassesDefined(css)
  const fileNames = new Set(files.map((f) => basename(f.path).toLowerCase()))

  if (htmlFiles.length === 0) issues.push('실행 가능한 HTML 페이지가 없습니다.')
  if (!fileNames.has('styles.css') && !css.trim()) warnings.push('styles.css 또는 CSS pack이 약합니다.')
  if (![...fileNames].some((k) => /app\.js$/i.test(k))) warnings.push('app.js pack이 약합니다.')

  // Route Contract 대비 HTML 누락 — 소스는 prev routeMap, 여기선 manifest.sitemap→routeToFile. (faithful-adaptation)
  const routes = manifest ? manifest.sitemap.map((p) => routeToFile(p.route)) : []
  const htmlNames = htmlFiles.map((f) => basename(f.path).toLowerCase())
  for (const rf of routes)
    if (rf && !htmlNames.includes(rf.toLowerCase()))
      warnings.push('Route Contract 대비 HTML 누락 가능성: ' + rf)

  for (const f of htmlFiles) {
    const name = basename(f.path)
    const html = f.content
    const wc = words(stripTags(html))
    const cls = classesUsed(html)
    const missing = [...cls].filter((c) => !defined.has(c) && !LAYOUT_PRIMITIVES.has(c))

    if (!/<!DOCTYPE html>/i.test(html)) warnings.push(name + ': DOCTYPE 누락')
    if (!/<main\b/i.test(html)) warnings.push(name + ': main 태그 누락')
    if (!/assets\/styles\.css/i.test(html)) warnings.push(name + ': CSS 경로가 assets/styles.css가 아닐 수 있음')
    if (!/assets\/app\.js/i.test(html)) warnings.push(name + ': JS 경로가 assets/app.js가 아닐 수 있음')
    if (wc < 90) warnings.push(name + ': 텍스트 밀도가 낮음 (' + wc + ' words)')
    if (/lorem ipsum|placeholder|todo|tbd|Brand Name|Your Company|Get Started|Our Services/i.test(html))
      warnings.push(name + ': generic/placeholder 텍스트 가능성')
    // 로컬 이미지 경로(외부 http는 페이지 전체에 하나라도 있으면 소스 규칙상 억제). (faithful)
    if (
      /(src|href)=["'](?:\/images\/|\.\/images\/|images\/|assets\/images\/|[^"']+\.(?:png|jpe?g|webp|svg))["']/i.test(html) &&
      !/https?:\/\//i.test(html)
    )
      warnings.push(name + ': 로컬 이미지 경로 가능성')
    if (missing.length > 0)
      warnings.push(
        name + ': CSS 미정의 class 가능성 -> ' + missing.slice(0, 16).join(', ') + (missing.length > 16 ? ' ...' : ''),
      )
  }

  const qualityScore = Math.max(0, 100 - issues.length * 25 - warnings.length * 3)
  return { qualityScore, issues, warnings, htmlFiles: htmlFiles.map((f) => basename(f.path)), routeCount: routes.length }
}
