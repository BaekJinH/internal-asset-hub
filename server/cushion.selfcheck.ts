/**
 * Structural-cushion self-check — the (B)⑤ teeth (deterministic, NO cloud/Ollama/browser).
 *
 * The cushions are LATENT on the clean emitter floor (it emits no <img>/<button>/<input> and <html lang="ko">),
 * so — per the (B)⑤ mandate — the teeth feed them DIRTY REAL HTML plus a full pipeline pass. The HARDENING
 * block adds a regression tooth for every bug the adversarial review confirmed (JSON-LD script breakout, hex-in-
 * text gate trips, data-* attr false-positives, sitemap fragment poison, 404 route collision, relative-baseUrl
 * canonical, case-insensitive </head>, marker-in-body safety).
 * Run: `tsx cushion.selfcheck.ts`.
 */
import { fixAccessibility } from './post-process/a11y-fixer'
import { injectSeoIntoHtml, seoInputForPage, generateSeoTags } from './post-process/seo-injector'
import { generateSitemap, generateRobotsTxt } from './post-process/sitemap'
import { defaultStructuralSeeds } from './post-process'
import { generatePages } from './generate'
import { buildManifestFromPhases } from './analyze'
import { runGate } from './conformance'
import { samplePlan, sampleBlueprint } from './analyze/fixtures/sample-phase-outputs'
import type { AnalyzeRequest, BuildManifest, PageSpec } from './contract'

const SEED = defaultStructuralSeeds
const RAW_HEX = /#[0-9a-fA-F]{3,8}\b/

const DIRTY = `<!DOCTYPE html>
<html>
  <head><title>Dirty</title></head>
  <body>
    <h1>Title</h1>
    <h3>Skipped a level</h3>
    <img src="https://cdn.example.com/a.png">
    <button></button>
    <button type="submit" aria-label="이미 있음"></button>
    <input id="email" type="email" placeholder="이메일 주소">
    <input id="named" type="text">
    <label for="named">이름</label>
    <input type="search">
  </body>
</html>`

function req0(): AnalyzeRequest {
  return { spec: '구조적 쿠션 검증', designRefMode: 'none', manyPages: true, conformanceProfile: 'default' }
}
const spec = (over: Partial<PageSpec>): PageSpec => ({ pageId: 'p', route: '/x', title: 'T', sections: ['s'], dependsOn: [], ...over })

async function main() {
  const host = buildManifestFromPhases(samplePlan, sampleBlueprint, req0()).conformanceTokens

  // ── 1. A11Y over dirty HTML ─────────────────────────────────────────────────────────────────────
  const a = fixAccessibility([{ path: 'dirty.html', content: DIRTY }], SEED.a11y)
  const fixedHtml = a.files[0].content

  // ── 2. SEO — per-page canonical + idempotency ───────────────────────────────────────────────────
  const home: PageSpec = { pageId: 'page_home', route: '/', title: '홈', sections: ['히어로', '특징'], dependsOn: [] }
  const about: PageSpec = { pageId: 'page_about', route: '/about', title: '소개', sections: ['팀', '미션'], dependsOn: ['page_home'] }
  const seoManifest: BuildManifest = { manifestId: 'seo-m', sitemap: [home, about], sharedComponents: [], conformanceTokens: host }
  const bareHead = '<!DOCTYPE html><html lang="ko"><head><title>소개</title></head><body></body></html>'
  const aboutInput = seoInputForPage(seoManifest, about, SEED)
  const homeInput = seoInputForPage(seoManifest, home, SEED)
  const seoOnce = injectSeoIntoHtml(bareHead, aboutInput)
  const seoTwice = injectSeoIntoHtml(seoOnce, aboutInput)
  const homeSeo = injectSeoIntoHtml('<html lang="ko"><head></head><body></body></html>', homeInput)
  const seoStartCount = (s: string): number => (s.match(/<!-- devpilot:seo:start -->/g) || []).length

  // ── 3. SITEMAP + ROBOTS ─────────────────────────────────────────────────────────────────────────
  const sitemapNoDate = generateSitemap([{ path: '/' }, { path: '/about' }], 'https://example.com')
  const sitemapDated = generateSitemap([{ path: '/' }], 'https://example.com', '2026-07-03')
  const sitemapEsc = generateSitemap([{ path: '/a&b' }], 'https://example.com')
  const robots = generateRobotsTxt('https://example.com', { disallowPaths: ['/admin'] })

  // ── 4. PIPELINE — full generatePages with cushions, twice (determinism) ─────────────────────────
  const manifest = buildManifestFromPhases(samplePlan, sampleBlueprint, req0())
  const run1 = await generatePages(manifest, { seeds: SEED })
  const run2 = await generatePages(manifest, { seeds: SEED })
  const homeArtifact = run1.artifacts.find((p) => p.pageId === 'page_home')!
  const homeFiles = new Map(homeArtifact.files.map((f) => [f.path, f.content]))
  const homePage = homeFiles.get('index.html') ?? ''
  const filesEqual = JSON.stringify(run1.artifacts.map((x) => x.files)) === JSON.stringify(run2.artifacts.map((x) => x.files))
  const homeGate = await runGate(homeArtifact.files)

  // ── 5. HARDENING — one regression tooth per confirmed adversarial finding ───────────────────────
  // (F1) JSON-LD must not break out of <script> — a '</script>' in the title is \u-escaped, not raw.
  const evilTags = generateSeoTags(seoInputForPage(seoManifest, spec({ title: 'Sale </script><img src=x>' }), SEED))
  // (F5) hex-shaped token in title/description must not survive as a raw literal into the gate-scanned head.
  const hexTags = generateSeoTags(seoInputForPage(seoManifest, spec({ title: 'Theme #deadbeef', sections: ['color'] }), SEED))
  // (F2) data-* attributes must NOT count as an existing accessible name.
  const dataAttr = fixAccessibility([{ path: 'd.html', content: '<button class="x" data-title="Close"></button><img src="a.jpg" data-alt="t">' }], SEED.a11y)
  // (F7) a '#hex' route fragment must not poison the site-wide sitemap.xml.
  const smFrag = generateSitemap([{ path: '/tour#cafe' }], 'https://example.com')
  // (F4) case-insensitive </head> — no duplicate <head> is created for </HEAD>.
  const upperHead = injectSeoIntoHtml('<html lang="ko"><HEAD><title>U</title></HEAD><body></body></html>', aboutInput)
  // (F3) markers appearing in the BODY as content must not be stripped.
  const bodyMarker = injectSeoIntoHtml(
    '<!DOCTYPE html><html><head><title>t</title></head><body><p>DOC</p><!-- devpilot:seo:start -->EX<!-- devpilot:seo:end --><p>KEEP</p></body></html>', aboutInput)
  // (F6) a real page routed to /404 wins — no duplicate 404.html, and it is NOT audit-excluded.
  const collide: BuildManifest = { manifestId: 'collide', sitemap: [home, { pageId: 'page_err', route: '/404', title: '커스텀404', sections: ['안내', '링크', '홈으로'], dependsOn: [] }], sharedComponents: [], conformanceTokens: host }
  const collideRun = await generatePages(collide, { seeds: SEED })
  const errArtifact = collideRun.artifacts.find((x) => x.pageId === 'page_err')!
  const err404Count = errArtifact.files.filter((f) => f.path === '404.html').length
  // (det) a hex-shaped 404 seed must not fail the whole job's gate.
  const hexRun = await generatePages(manifest, { seeds: { ...SEED, notFound: { title: '오류 #404 페이지', body: '없음' } } })
  const hexGate = await runGate(hexRun.artifacts[0].files)
  // (F-canonical) a non-scheme baseUrl canonical must survive (SEO runs AFTER repair, so it is never rewritten to #).
  const relRun = await generatePages(manifest, { seeds: { ...SEED, baseUrl: '/cdn' } })
  const relHome = (relRun.artifacts.find((x) => x.pageId === 'page_home')!.files.find((f) => f.path === 'index.html')?.content) ?? ''
  // (re-review MINOR) a hex-shaped ogImage / a baseUrl fragment must not fail the site-wide gate.
  const ogHexTags = generateSeoTags(seoInputForPage(seoManifest, about, { ...SEED, baseUrl: 'https://x.com#deadbeef', ogImage: 'https://x.com/og#abcdef.png' }))

  const checks: Record<string, boolean> = {
    // 1. a11y
    'a11y: missing img alt injected': a.report.imgAltFixed === 1 && /<img src="https:\/\/cdn\.example\.com\/a\.png" alt="">/.test(fixedHtml),
    'a11y: empty button named, pre-labeled button untouched': a.report.buttonNamed === 1 &&
      /<button aria-label="버튼"><\/button>/.test(fixedHtml) && /aria-label="이미 있음"/.test(fixedHtml),
    'a11y: unlabeled inputs named (placeholder / fallback), <label for> respected': a.report.inputNamed === 2 &&
      /aria-label="이메일 주소"/.test(fixedHtml) && /type="search" aria-label="입력">/.test(fixedHtml) && !/id="named"[^>]*aria-label/.test(fixedHtml),
    'a11y: bare <html> gets lang injected': a.report.langFixed === 1 && /<html lang="ko">/.test(fixedHtml),
    'a11y: heading-skip (h1→h3) detected': a.report.headingWarnings.length === 1 && /h1 → h3/.test(a.report.headingWarnings[0]),
    // 2. seo
    'seo: per-page canonical (/about, NOT homepage)': seoOnce.includes('<link rel="canonical" href="https://example.com/about" />'),
    'seo: home canonical is the origin root': homeSeo.includes('<link rel="canonical" href="https://example.com/" />'),
    'seo: og:url + JSON-LD + description present': seoOnce.includes('property="og:url" content="https://example.com/about"') &&
      seoOnce.includes('application/ld+json') && /<meta name="description" content="소개 — 팀, 미션"/.test(seoOnce),
    'seo: idempotent re-inject yields ONE block': seoStartCount(seoOnce) === 1 && seoStartCount(seoTwice) === 1,
    // 3. sitemap + robots
    'sitemap: per-route loc + priority (home 1.0 / other 0.7)': sitemapNoDate.includes('<loc>https://example.com/</loc>') &&
      sitemapNoDate.includes('<loc>https://example.com/about</loc>') && sitemapNoDate.includes('<priority>1.0</priority>') && sitemapNoDate.includes('<priority>0.7</priority>'),
    'sitemap: deterministic — no wall-clock <lastmod> unless seeded': !sitemapNoDate.includes('<lastmod>') && sitemapDated.includes('<lastmod>2026-07-03</lastmod>'),
    'sitemap: <loc> XML-escaped (& → &amp;)': sitemapEsc.includes('<loc>https://example.com/a&amp;b</loc>'),
    'robots: allow + disallow + sitemap pointer': /User-agent: \*/.test(robots) && /Disallow: \/admin/.test(robots) && robots.includes('Sitemap: https://example.com/sitemap.xml'),
    // 4. pipeline
    'pipeline: site-level cushions emitted (sitemap/robots/404)': homeFiles.has('sitemap.xml') && homeFiles.has('robots.txt') && homeFiles.has('404.html'),
    'pipeline: per-page SEO reached the served page': homePage.includes('<!-- devpilot:seo:start -->') && homePage.includes('<link rel="canonical" href="https://example.com/" />'),
    'pipeline: cushioned output PASSES the gate (reversal clean)': homeGate.dsConformance.pass === true && homeGate.dsConformance.colorLiteralViolations.length === 0,
    'pipeline: deterministic — two runs byte-identical files': filesEqual,
    // 5. hardening (adversarial-review regression teeth)
    'harden(F1): JSON-LD does not break out of <script>': (evilTags.match(/<\/script>/g) || []).length === 1 && evilTags.includes('\\u003c/script'),
    'harden(F5): no raw #hex literal in emitted SEO block': RAW_HEX.test(hexTags) === false && hexTags.includes('&#35;deadbeef'),
    'harden(F2): data-* does not block a11y naming': dataAttr.report.buttonNamed === 1 && dataAttr.report.imgAltFixed === 1,
    'harden(F7): sitemap loc strips #fragment (no hex poison)': smFrag.includes('<loc>https://example.com/tour</loc>') && RAW_HEX.test(smFrag) === false,
    'harden(F4): case-insensitive </head> — no duplicate head': (upperHead.match(/<head\b/gi) || []).length === 1 && upperHead.includes('<!-- devpilot:seo:start -->'),
    'harden(F3): body markers are content, not stripped': bodyMarker.includes('<p>DOC</p>') && bodyMarker.includes('EX') && bodyMarker.includes('<p>KEEP</p>'),
    'harden(F6): real /404 wins — one 404.html, real page audited': err404Count === 1 &&
      errArtifact.gates.dsConformance.pass === true && errArtifact.ftRecord.quality.gateScore > 0.5,
    'harden(det): hex 404 seed does not fail the job gate': hexGate.dsConformance.pass === true,
    'harden(F-canon): relative baseUrl canonical not rewritten to #': relHome.includes('rel="canonical" href="/cdn/"') && !relHome.includes('rel="canonical" href="#"'),
    'harden(og): hex ogImage/baseUrl fragment does not trip the gate': RAW_HEX.test(ogHexTags) === false,
  }

  const ok = Object.values(checks).every(Boolean)
  console.log('=== Structural-cushion self-check ((B)⑤: a11y · seo · sitemap · pipeline · hardening) ===')
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
  console.log(`  a11y    : img=${a.report.imgAltFixed} button=${a.report.buttonNamed} input=${a.report.inputNamed} lang=${a.report.langFixed} headingWarn=${a.report.headingWarnings.length}`)
  console.log(`  pipeline: home=[${[...homeFiles.keys()].join(', ')}] gate=${homeGate.dsConformance.pass ? 'PASS' : 'FAIL'} deterministic=${filesEqual}`)
  console.log(`  harden  : collide 404 count=${err404Count} · hexSeed gate=${hexGate.dsConformance.pass ? 'PASS' : 'FAIL'} · relCanonical ok=${relHome.includes('href="/cdn/"')}`)
  console.log(ok ? 'CUSHION SELF-CHECK: PASS ✅' : 'CUSHION SELF-CHECK: FAIL ❌')
  process.exitCode = ok ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
