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

function routeToFile(route: string): string {
  if (route === '/' || route === '') return 'index.html'
  return route.replace(/^\/+/, '').replace(/\/+$/, '') + '.html'
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
        return `<a href="${routeToFile(p.route)}"${current}>${p.title}</a>`
      })
      .join('\n          ')

    const sections = page.sections
      .map(
        (s, i) => `      <section class="section" data-reveal data-section-index="${i}">
        <div class="container">
          <div class="card">
            <h2>${s}</h2>
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
    <title>${page.title}</title>
    <link rel="stylesheet" href="assets/styles.css" />
  </head>
  <body data-layout-intent="static" data-page-id="${page.pageId}">
    <header class="site-header">
      <div class="container">
        <strong>${manifest.manifestId}</strong>
        <nav class="site-nav">
          ${nav}
        </nav>
      </div>
    </header>
    <main class="container">
${sections}
    </main>
    <footer class="site-footer">
      <div class="container">© ${page.title}</div>
    </footer>
    <script src="assets/app.js"></script>
  </body>
</html>
`
    return [{ path: routeToFile(page.route), content: html }]
  }
}
