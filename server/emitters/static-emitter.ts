/**
 * STATIC EMITTER (default target, MVP) — deterministic BuildManifest → HTML/CSS/JS.
 *
 * This is the deterministic SPINE of n8n v31 S11-S22 (styles.css, partials, per-screen HTML, app.js,
 * asset-path normalization). It needs NO LLM, so it runs and is gate-verifiable here. The Ollama-driven
 * content stages (qwen3-coder:30b, company server) later ENRICH page bodies through this same emitter.
 *
 * Reversal principle: every color comes from `rgb(var(--token))` sourced from the host
 * ConformanceTokenSet — NEVER a raw literal — so output passes the conformance gate by construction.
 */
import type { Emitter, EmitTarget } from './index'
import type { BuildManifest, PageSpec, GeneratedFile } from '../contract'

export function routeToFile(route: string): string {
  if (route === '/' || route === '') return 'index.html'
  // An internal route is a RELATIVE path — never a URL scheme. Reduce each segment to a URL/filename-safe slug
  // (dropping any 'scheme:' colon, quote, or angle bracket → '-'), so the SAME value is safe as an emitted
  // filename, a route-alias key, AND an href. This lets the nav href stay UN-escaped (HTML-escaping it would
  // desync from dynamic-final-repair's alias map, which is built from this very function) while still denying
  // both attribute breakout and scheme-based hrefs such as `javascript:…`.
  const path = String(route)
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('/')
    .map((seg) => seg.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('/')
  return (path || 'index') + '.html'
}

/**
 * Escape free text before interpolating it into emitted HTML. Two defenses in one pass:
 *  1) HTML-escape &<>"' — a title/section/label/id carrying `</script>`, a bare `<`, or a quote can then
 *     neither break out of its element nor its attribute (the §15-1 injection gap: content flows in from the
 *     plan/blueprint now and, later, from Ollama-generated page bodies — neither is trusted markup).
 *  2) Neutralize color literals (#hex, rgb()/hsl()) legitimate copy may contain (e.g. "Save 20% #FF0000"),
 *     so real content cannot false-trip the conformance gate's raw-color scan. Browsers decode the entity for
 *     display, so visible text is unchanged; only the raw byte stream is made inject- and gate-safe.
 * Order: HTML-escape FIRST (so the '&' it introduces is final), THEN neutralize '#'→'&#35;'.
 * Reversal principle untouched: ONLY interpolated CONTENT is routed through here — never the emitter's own
 * structural `rgb(var(--token))` CSS.
 */
function esc(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/#(?=[0-9a-fA-F]{3,8}\b)/g, '&#35;')
    .replace(/\b(rgb|rgba|hsl|hsla)\((?=\s*[0-9.])/gi, '$1&#40;')
}

function renderRootTokens(cssVars: Record<string, string>): string {
  const decls = Object.entries(cssVars).map(([k, v]) => `  ${k}: ${v};`).join('\n')
  return `:root {\n${decls}\n}`
}

export class StaticEmitter implements Emitter {
  readonly target: EmitTarget = 'static'

  async emitShared(manifest: BuildManifest): Promise<GeneratedFile[]> {
    const styles = `${renderRootTokens(manifest.conformanceTokens.cssVars)}

* { box-sizing: border-box; }
body { margin: 0; background: rgb(var(--background)); color: rgb(var(--foreground));
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; line-height: 1.6; }
.container { max-width: 72rem; margin-inline: auto; padding-inline: 1.5rem; }
.site-header { border-bottom: 1px solid rgb(var(--border)); background: rgb(var(--card));
  position: sticky; top: 0; }
.site-header .container { display: flex; align-items: center; justify-content: space-between; height: 4rem; }
.site-nav a { color: rgb(var(--foreground)); text-decoration: none; margin-inline-start: 1.25rem; }
.site-nav a[aria-current="page"] { color: rgb(var(--primary)); font-weight: 600; }
.section { padding-block: 3rem; opacity: 0; transition: opacity .4s ease; }
.section[data-revealed="true"] { opacity: 1; }
.card { background: rgb(var(--card)); border: 1px solid rgb(var(--border));
  border-radius: .75rem; padding: 1.5rem; }
.btn-primary { display: inline-block; background: rgb(var(--primary)); color: rgb(var(--card));
  padding: .625rem 1.25rem; border-radius: .5rem; text-decoration: none; }
.site-footer { border-top: 1px solid rgb(var(--border)); color: rgb(var(--foreground));
  padding-block: 2rem; margin-top: 3rem; }
`
    const app = `document.addEventListener('DOMContentLoaded', () => {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.setAttribute('data-revealed', 'true');
  }, { threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
});
`
    return [
      { path: 'assets/styles.css', content: styles },
      { path: 'assets/app.js', content: app },
    ]
  }

  async emitPage(manifest: BuildManifest, page: PageSpec): Promise<GeneratedFile[]> {
    const nav = manifest.sitemap
      .map((p) => {
        const current = p.pageId === page.pageId ? ' aria-current="page"' : ''
        // href = routeToFile (already URL/filename-safe, in sync with the repair alias map — NOT esc()-wrapped);
        // the visible label IS free text → esc().
        return `<a href="${routeToFile(p.route)}"${current}>${esc(p.title)}</a>`
      })
      .join('\n          ')

    const sections = page.sections
      .map(
        (s, i) => `      <section class="section" data-reveal data-section-index="${i}">
        <div class="container">
          <div class="card">
            <h2>${esc(s)}</h2>
          </div>
        </div>
      </section>`,
      )
      .join('\n')

    const html = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(page.title)}</title>
    <link rel="stylesheet" href="assets/styles.css" />
  </head>
  <body data-layout-intent="static" data-page-id="${esc(page.pageId)}">
    <header class="site-header">
      <div class="container">
        <strong>${esc(manifest.manifestId)}</strong>
        <nav class="site-nav">
          ${nav}
        </nav>
      </div>
    </header>
    <main class="container">
${sections}
    </main>
    <footer class="site-footer">
      <div class="container">© ${esc(page.title)}</div>
    </footer>
    <script src="assets/app.js"></script>
  </body>
</html>
`
    return [{ path: routeToFile(page.route), content: html }]
  }
}
