/**
 * SEO INJECTOR — deterministic <head> SEO cushion: meta + Open Graph + Twitter Card + schema.org JSON-LD ((B)⑤).
 *
 * CANONICAL SOURCE (extract-first, read-only): devpilot-v2 src/pipeline/post-processor/seo-injector.ts
 *   (generateSEOTags + injectSEOIntoHtml). Already framework-neutral pure string manipulation — ported verbatim
 *   for the escapeHtml, keyword tokenizer, JSON-LD @type routing, and head-splice mechanisms.
 *
 * §3 GENERALIZE: the hardcoded Korean categoryKeywords, the ko_KR locale, the og-image placeholder, and the
 *   `domain` are injectable seeds (see StructuralSeeds) — none live on the frozen BuildManifest.
 *
 * ★ SOURCE-BUG FIX (measured): the source hardwires canonical/og:url to `https://${domain}/` (the SITE ROOT)
 *   for EVERY page — so every generated page would declare the homepage as its canonical, which is an SEO
 *   defect. Here `pageUrl` is derived PER PAGE from PageSpec.route, so each page is self-canonical.
 *
 * IDEMPOTENCY: the block is wrapped in <!-- seo:start -->…<!-- seo:end --> and any prior block is stripped
 *   before re-injection, so running the pass twice yields a single block (the source appended blindly → dup tags).
 *
 * REVERSAL: introduces only <meta>/<link>/<script type=application/ld+json> — no color literal, no CSS, no
 *   host-token override. Safe through dynamicFinalRepair (canonical/og URLs are absolute https → link/asset
 *   normalization skips them) and through the gate (no hex/rgb()/palette).
 */
import type { BuildManifest, PageSpec } from '../contract'
import { neutralizeColorLiteralsHtml, neutralizeScriptText } from './neutralize'

export type PageCategory = 'landing' | 'corporate' | 'portfolio' | 'ecommerce' | 'admin'

export interface SeoSeeds {
  /** absolute site origin, e.g. 'https://example.com' (MUST be absolute so canonical/og stay external). */
  baseUrl: string
  /** OG/JSON-LD locale (the emitter's <html lang> is separate). */
  locale: string
  /** JSON-LD @type + keyword category when the IR carries none. */
  defaultCategory: PageCategory
  /** per-category keyword seeds (devpilot Korean defaults, injectable). */
  categoryKeywords: Record<PageCategory, string[]>
  /** absolute OG image URL; defaults to `${baseUrl}/og-image.png`. */
  ogImage?: string
}

export interface SeoInput {
  pageTitle: string
  pageDescription: string
  pageCategory: PageCategory
  /** per-page absolute URL (canonical + og:url) — the fix vs the source's homepage hardwire. */
  pageUrl: string
  /** site origin root (JSON-LD site-entity url). */
  origin: string
  ogImageUrl: string
  locale: string
  keywords: string[]
}

// A specific sentinel (not a generic 'seo:start') so authored page content documenting the tool cannot collide
// with — and be deleted by — the idempotency strip.
const SEO_START = '<!-- devpilot:seo:start -->'
const SEO_END = '<!-- devpilot:seo:end -->'

/** &<>"' → entities (& FIRST). (faithful) */
function escapeHtml(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** category seeds ∪ content tokens (len≥2, non-numeric, first 8) ∪ nothing, deduped, capped at 10. (faithful) */
function buildKeywords(title: string, description: string, category: PageCategory, seeds: SeoSeeds): string[] {
  const cat = seeds.categoryKeywords[category] ?? []
  const tokens = `${title} ${description}`
    .split(/[\s,.!?;:()「」『』“”‘’·\-—–]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !/^\d+$/.test(t))
  return Array.from(new Set([...cat, ...tokens.slice(0, 8)])).slice(0, 10)
}

/** schema.org JSON-LD, @type routed by category. (faithful; url = site origin for site-entity types) */
function generateJsonLd(input: SeoInput): Record<string, unknown> {
  const base = {
    '@context': 'https://schema.org',
    name: input.pageTitle,
    description: input.pageDescription,
    url: input.origin,
  }
  switch (input.pageCategory) {
    case 'ecommerce':
      return { ...base, '@type': 'Product', ...(input.ogImageUrl ? { image: input.ogImageUrl } : {}), url: input.pageUrl }
    case 'corporate':
      return { ...base, '@type': 'Organization', ...(input.ogImageUrl ? { logo: input.ogImageUrl } : {}) }
    case 'portfolio':
      return { ...base, '@type': 'Person' }
    default:
      return { ...base, '@type': 'WebSite' }
  }
}

/** escapeHtml then break any gate-forbidden color literal — for free text emitted into HTML attributes/text. */
function safeText(s: string): string {
  return neutralizeColorLiteralsHtml(escapeHtml(s))
}

/** Build the raw <head> SEO block (wrapped in idempotency markers). (faithful tag set; per-page URLs) */
export function generateSeoTags(input: SeoInput): string {
  const title = safeText(input.pageTitle)
  const description = safeText(input.pageDescription)
  const url = escapeHtml(input.pageUrl) // a canonical URL carries no '#fragment' (stripped in pageUrl)
  const ogImage = safeText(input.ogImageUrl) // a deployer-supplied og image may carry a '#hex'-shaped token
  const keywords = safeText(input.keywords.join(', '))
  const ogType = input.pageCategory === 'ecommerce' ? 'product' : 'website'
  // JSON-LD lives in a raw <script>: \u-escape <>&# so it can neither break out of </script> nor carry a '#hex'.
  const jsonLd = neutralizeScriptText(JSON.stringify(generateJsonLd(input), null, 2))

  return [
    SEO_START,
    `<meta name="description" content="${description}" />`,
    `<meta name="keywords" content="${keywords}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:locale" content="${escapeHtml(input.locale)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
    `<script type="application/ld+json">\n${jsonLd}\n</script>`,
    SEO_END,
  ]
    .map((line) => '    ' + line)
    .join('\n')
}

/** index of the LAST </head> (case-insensitive, consistent with the repair/lang passes), or -1. */
function lastHeadClose(html: string): number {
  const re = /<\/head\s*>/gi
  let idx = -1
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) idx = m.index
  return idx
}

/** Strip a prior SEO block so re-injection stays idempotent — but ONLY a well-formed block inside the head
 *  region, so a page whose BODY happens to contain the sentinel text is never mutilated (a first-pass strip
 *  would otherwise delete authored content between the markers). */
function stripExistingSeo(html: string): string {
  const headClose = lastHeadClose(html)
  const limit = headClose === -1 ? html.length : headClose
  const s = html.indexOf(SEO_START)
  if (s === -1 || s >= limit) return html
  const e = html.indexOf(SEO_END, s)
  if (e === -1 || e >= limit) return html
  return html.slice(0, s).replace(/[ \t]*$/, '') + html.slice(e + SEO_END.length).replace(/^\n?/, '')
}

/** Splice the SEO block before the last </head> (case-insensitive; fallbacks: after <html …>, else prepend). */
export function injectSeoIntoHtml(html: string, input: SeoInput): string {
  const cleaned = stripExistingSeo(html)
  const tags = generateSeoTags(input)
  const idx = lastHeadClose(cleaned)
  if (idx !== -1) return cleaned.slice(0, idx) + tags + '\n  ' + cleaned.slice(idx)
  const open = cleaned.match(/<html[^>]*>/i)
  if (open) {
    const at = cleaned.indexOf(open[0]) + open[0].length
    return cleaned.slice(0, at) + `\n<head>\n${tags}\n</head>` + cleaned.slice(at)
  }
  return tags + '\n' + cleaned
}

/** trim/absolute-ify the base origin. */
function origin(baseUrl: string): string {
  return baseUrl.split('#')[0].split('?')[0].replace(/\/+$/, '') // a site origin has no fragment/query
}

/** per-page absolute URL from a route ('/', '/about', …). A canonical/og URL carries NO '#fragment' or '?query'
 *  (fragments are not distinct crawlable URLs) — stripping them also keeps a '#hex'-shaped fragment out of the
 *  gate-scanned <loc>/canonical. */
export function pageUrl(baseUrl: string, route: string): string {
  const o = origin(baseUrl)
  const clean = route.split('#')[0].split('?')[0]
  if (clean === '/' || clean === '') return o + '/'
  return o + '/' + clean.replace(/^\/+/, '')
}

/** Synthesize a non-generic meta description from the page's own sections (avoids placeholder-text warnings).
 *  Truncates on a WORD boundary (not a raw char index) so it cannot split a token mid-run — which, combined with
 *  the escape pass, prevents manufacturing a gate-tripping '#hex' at the truncation edge. */
function synthDescription(page: PageSpec): string {
  const secs = page.sections.filter((s) => s && s.trim())
  const text = secs.length ? `${page.title} — ${secs.join(', ')}` : page.title
  if (text.length <= 160) return text
  const cut = text.slice(0, 157)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

/** Build the SeoInput for a page from the manifest + seeds (all IR-absent fields come from seeds/derivation). */
export function seoInputForPage(_manifest: BuildManifest, page: PageSpec, seeds: SeoSeeds): SeoInput {
  const category = seeds.defaultCategory
  const description = synthDescription(page)
  return {
    pageTitle: page.title,
    pageDescription: description,
    pageCategory: category,
    pageUrl: pageUrl(seeds.baseUrl, page.route),
    origin: origin(seeds.baseUrl) + '/',
    ogImageUrl: seeds.ogImage ?? origin(seeds.baseUrl) + '/og-image.png',
    locale: seeds.locale,
    keywords: buildKeywords(page.title, description, category, seeds),
  }
}
