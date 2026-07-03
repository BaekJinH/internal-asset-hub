/**
 * DYNAMIC FINAL REPAIR (No Hardcoded Links/CSS) — deterministic, no LLM.
 *
 * PORT of n8n v31 S20 "파일 추출" deterministic backstop (PHASE-MAP · 회사 검증 자산).
 *   normalizeHtmlAssetPaths / normalizeInternalLinks / buildRouteAliasMap = 소스 알고리즘 그대로 이식(faithful).
 *   replaceLocalImages / dynamicCssBridge = 소스 의도대로 이식(faithful-adaptation; full-fidelity 정규식은 후속).
 * 역전 원칙 보강: 하드코딩 링크·로컬 이미지를 제거해 산출물이 route/토큰만 참조하도록 강제.
 */
import type { BuildManifest, GeneratedFile } from '../contract'
import { routeToFile } from './static-emitter'

interface Route {
  screenId: string
  file: string
  path: string
  label: string
}

function routesFromManifest(manifest: BuildManifest): Route[] {
  return manifest.sitemap.map((p) => ({
    screenId: p.pageId,
    file: routeToFile(p.route),
    path: p.route,
    label: p.title,
  }))
}

/** Neutralize color literals (#hex, rgb()/hsl() with a numeric arg) so decorative copy — an <img> alt, an
 *  unresolved route, a URL '#fragment' — carrying a hex-shaped token cannot FALSE-TRIP the conformance gate's
 *  raw-color scan. Parity with the emitter's esc(); MUST run AFTER any '&'-escape so the '&' it introduces is
 *  final. A browser decodes the entity back, so the link/label is unchanged; only the raw byte stream is made
 *  gate-safe. */
function neutColor(s: string): string {
  return String(s ?? '')
    .replace(/#(?=[0-9a-fA-F]{3,8}\b)/g, '&#35;')
    .replace(/\b(rgb|rgba|hsl|hsla)\((?=\s*[0-9.])/gi, '$1&#40;')
}

function escAttr(s: string): string {
  return neutColor(
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;'),
  )
}

/** S20: alias(link) → canonical html file. (소스 알고리즘 그대로) */
function buildRouteAliasMap(routes: Route[]): Map<string, string> {
  const map = new Map<string, string>()
  const add = (alias: string, file: string): void => {
    alias = String(alias || '').trim()
    if (!alias || !file) return
    const cleaned = alias.replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/$/, '').toLowerCase()
    if (cleaned) map.set(cleaned, file)
    if (cleaned.endsWith('.html')) map.set(cleaned.replace(/\.html?$/i, ''), file)
  }
  for (const r of routes) {
    add(r.file, r.file)
    add('/' + r.file, r.file)
    add(r.file.replace(/\.html?$/i, ''), r.file)
    add('/' + r.file.replace(/\.html?$/i, ''), r.file)
    add(r.path, r.file)
    add(r.screenId, r.file)
    add(r.screenId.replace(/_/g, '-'), r.file)
  }
  const home = routes.find((r) => r.file === 'index.html')?.file || routes[0]?.file || 'index.html'
  map.set('', home)
  return map
}

/** S20: stylesheet/script 참조를 assets/styles.css·assets/app.js로 강제 + 누락 시 주입. (faithful) */
export function normalizeHtmlAssetPaths(html: string): string {
  html = String(html || '')
  html = html.replace(/href=["'](?:\.\/)?styles\.css["']/gi, 'href="assets/styles.css"')
  html = html.replace(/src=["'](?:\.\/)?app\.js["']/gi, 'src="assets/app.js"')
  html = html.replace(/href=["'](?:\.\/)?assets\/assets\/styles\.css["']/gi, 'href="assets/styles.css"')
  html = html.replace(/src=["'](?:\.\/)?assets\/assets\/app\.js["']/gi, 'src="assets/app.js"')
  if (!/href=["']assets\/styles\.css["']/i.test(html) && /<\/head>/i.test(html))
    html = html.replace(/<\/head>/i, '  <link rel="stylesheet" href="assets/styles.css">\n</head>')
  if (!/src=["']assets\/app\.js["']/i.test(html) && /<\/body>/i.test(html))
    html = html.replace(/<\/body>/i, '  <script src="assets/app.js"></script>\n</body>')
  return html
}

/** S20: 내부 href → canonical route file; 미해결 내부링크 → href="#" + data-unresolved-route. (faithful) */
export function normalizeInternalLinks(html: string, routes: Route[]): string {
  const aliases = buildRouteAliasMap(routes)
  return String(html || '').replace(/\bhref=(["'])([^"']*)\1/gi, (match, quote: string, raw: string) => {
    const value = String(raw || '').trim()
    // external/scheme/pure-fragment hrefs are preserved verbatim — but a hex-shaped token in the URL (a '#ff0000'
    // fragment or a '…#ff0000' external URL) is not a color, so color-neutralize it to avoid a gate false-trip.
    // (Neutralizing a URL never masks a real color declaration — an href is never a CSS color context.)
    if (!value || /^(https?:|mailto:|tel:|#|javascript:|data:|blob:)/i.test(value)) return neutColor(match)
    const suffixMatch = value.match(/([?#].*)$/)
    const suffix = suffixMatch ? suffixMatch[1] : ''
    const base = value.replace(/([?#].*)$/, '').replace(/^\.\//, '')
    const lookup = base.replace(/^\/+/, '').replace(/\/$/, '').toLowerCase()
    const mapped = aliases.get(lookup) || aliases.get(lookup.replace(/\.html?$/i, ''))
    // the '#fragment'/'?query' suffix is preserved verbatim for navigation, but a hex-shaped fragment (e.g.
    // '#ff0000') must be color-neutralized so it does not trip the gate on an otherwise-conformant page.
    if (mapped) return `href=${quote}${mapped}${neutColor(suffix)}${quote}`
    if (/^\//.test(base) || /\.html?$/i.test(base) || /^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(base))
      return `href=${quote}#${quote} data-unresolved-route="${escAttr(value)}"`
    return match
  })
}

/** S17C/S20: 로컬 <img> → 장식 대체(외부/data는 보존). logo→text-logo, else→media-fallback. (faithful-adaptation) */
export function replaceLocalImages(html: string): string {
  return String(html || '').replace(/<img\b[^>]*>/gi, (tag) => {
    const srcM = tag.match(/\bsrc\s*=\s*(["'])([\s\S]*?)\1/i)
    const src = srcM ? srcM[2].trim() : ''
    if (!src || /^(https?:|data:|blob:|\/\/)/i.test(src)) return tag
    const altM = tag.match(/\balt\s*=\s*(["'])([\s\S]*?)\1/i)
    const alt = altM ? altM[2].trim() : ''
    if (/logo/i.test(src) || /logo/i.test(alt))
      return `<span class="generated-text-logo" role="img" aria-label="${escAttr(alt || 'logo')}">${escAttr(alt || 'LOGO')}</span>`
    return `<div class="generated-media-fallback" role="img" aria-label="${escAttr(alt || 'image')}"></div>`
  })
}

/** S20: 실제 사용된 class를 스캔해 CSS 미정의 class에 baseline 규칙 부여(하드코딩 값 없음). (faithful-adaptation) */
export function dynamicCssBridge(htmlFiles: GeneratedFile[], css: string): { css: string; bridged: string[] } {
  const used = new Set<string>()
  for (const f of htmlFiles)
    for (const m of f.content.matchAll(/\bclass=["']([^"']+)["']/gi))
      for (const c of m[1].split(/\s+/)) if (c) used.add(c)
  const defined = new Set<string>()
  for (const m of css.matchAll(/\.([A-Za-z0-9_-]+)/g)) defined.add(m[1])
  const isDefaultPalette = (c: string): boolean =>
    /^(?:bg|text|border|ring)-(?:slate|gray|zinc|neutral|stone)-/.test(c)
  const bridged = [...used].filter((c) => !defined.has(c) && !isDefaultPalette(c))
  if (!bridged.length) return { css: '', bridged }
  const rules = bridged.map((c) => `.${c.replace(/[^A-Za-z0-9_-]/g, (ch) => '\\' + ch)} { }`).join('\n')
  return { css: `\n/* dynamicCssBridge: ${bridged.length} used-but-undefined classes (baseline, no hardcoded values) */\n${rules}\n`, bridged }
}

export interface RepairReport {
  unresolvedRoutes: number
  imagesReplaced: number
  bridgedClasses: number
}

/** 오케스트레이터: HTML마다 asset-path→image→internal-link 순 정규화 + styles.css에 dynamicCssBridge. */
export function dynamicFinalRepair(
  files: GeneratedFile[],
  manifest: BuildManifest,
): { files: GeneratedFile[]; report: RepairReport } {
  const routes = routesFromManifest(manifest)
  const report: RepairReport = { unresolvedRoutes: 0, imagesReplaced: 0, bridgedClasses: 0 }
  const htmlOut: GeneratedFile[] = []

  const out = files.map((f) => {
    if (!/\.html?$/i.test(f.path)) return f
    const imgBefore = (f.content.match(/<img\b/gi) || []).length
    let c = normalizeHtmlAssetPaths(f.content)
    c = replaceLocalImages(c)
    c = normalizeInternalLinks(c, routes)
    report.unresolvedRoutes += (c.match(/data-unresolved-route=/g) || []).length
    report.imagesReplaced += imgBefore - (c.match(/<img\b/gi) || []).length
    const nf: GeneratedFile = { path: f.path, content: c }
    htmlOut.push(nf)
    return nf
  })

  const stylesIdx = out.findIndex((f) => /styles\.css$/i.test(f.path))
  if (stylesIdx >= 0) {
    const { css, bridged } = dynamicCssBridge(htmlOut, out[stylesIdx].content)
    if (css) {
      out[stylesIdx] = { path: out[stylesIdx].path, content: out[stylesIdx].content + css }
      report.bridgedClasses = bridged.length
    }
  }
  return { files: out, report }
}
