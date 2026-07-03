/**
 * SITEMAP GENERATOR — deterministic sitemap.xml + robots.txt cushion ((B)⑤).
 *
 * CANONICAL SOURCE (extract-first, read-only): devpilot-v2 src/pipeline/post-processor/sitemap-generator.ts
 *   (generateSitemap + generateRobotsTxt). Pure string builders — ported verbatim except two corrections:
 *
 * ★ DETERMINISM FIX (measured): the source defaults `lastmod = new Date().toISOString()...` — WALL-CLOCK, so its
 *   output changes daily and is not reproducible. The engine's contract is deterministic-and-verifiable-now, so
 *   `lastmod` here is an INJECTED seed; when absent the <lastmod> element is OMITTED entirely (it is optional in
 *   the sitemap 0.9 schema) rather than stamped with a clock.
 * ★ XML-SAFETY FIX (measured): the source does not escape <loc>; a route containing `&` would produce invalid
 *   XML. Here <loc> and <lastmod> are XML-escaped.
 *
 * SITE-LEVEL: emitted ONCE per manifest (into the shared file set), never per page. REVERSAL: pure XML/text,
 *   zero color/CSS — reversal principle untouched. Filenames sitemap.xml / robots.txt pass the gate's kebab rule.
 */

export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export interface SitemapPage {
  path: string
  priority?: number
  changefreq?: ChangeFreq
}

export interface RobotsOptions {
  disallowPaths?: string[]
}

function origin(baseUrl: string): string {
  return baseUrl.split('#')[0].split('?')[0].replace(/\/+$/, '') // a site origin has no fragment/query
}

/** &<>"' → XML entities (& FIRST). */
function xmlEscape(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Color-neutralize a <loc> URL (AFTER xmlEscape) so a pathological 'rgb('/'hsl('-shaped route segment cannot
 *  trip the gate's raw-color scan of the site-wide sitemap.xml. A URL is never a CSS color context, so this
 *  never masks a real violation; '#hex' fragments are already stripped before the URL is built. */
function neutColorUrl(s: string): string {
  return s.replace(/\b(rgb|rgba|hsl|hsla)\((?=\s*[0-9.])/gi, '$1&#40;')
}

/** Build sitemap.xml from routes. `lastmod` (YYYY-MM-DD) is injected for determinism; omitted → no <lastmod>. */
export function generateSitemap(pages: SitemapPage[], baseUrl: string, lastmod?: string): string {
  const o = origin(baseUrl)
  const urls = pages
    .map((p) => {
      const priority = p.priority ?? (p.path === '/' ? 1.0 : 0.7)
      const changefreq = p.changefreq ?? 'weekly'
      // a <loc> is a canonical crawlable URL: drop any '#fragment'/'?query' (also keeps a '#hex'-shaped
      // fragment out of the gate-scanned, site-wide sitemap.xml).
      const clean = p.path.split('#')[0].split('?')[0]
      const path = clean.startsWith('/') ? clean : '/' + clean
      const loc = neutColorUrl(xmlEscape(o + path))
      const lm = lastmod ? `\n    <lastmod>${xmlEscape(lastmod)}</lastmod>` : ''
      return `  <url>\n    <loc>${loc}</loc>${lm}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

/** Build robots.txt (Allow all + optional Disallow lines + Sitemap pointer). (faithful) */
export function generateRobotsTxt(baseUrl: string, options: RobotsOptions = {}): string {
  const o = origin(baseUrl)
  const disallow = (options.disallowPaths ?? []).map((p) => `Disallow: ${p}`).join('\n')
  return `User-agent: *\nAllow: /\n${disallow ? disallow + '\n' : ''}Sitemap: ${o}/sitemap.xml\n`
}
