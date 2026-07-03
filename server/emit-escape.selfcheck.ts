/**
 * EMITTER-ESCAPE self-check — the §15-1 injection/gate-trip teeth (deterministic, NO cloud/Ollama/browser).
 *
 * The static emitter interpolates FREE TEXT (title, section, nav label, page-id, manifest-id) into HTML, and the
 * repair layer copies alt/route text into gate-scanned HTML. Before this hardening those sites were raw, so a title
 * carrying `</script>` could inject markup and a token carrying a `#hex` could FALSE-TRIP the conformance gate's
 * raw-color scan. These teeth feed the emitter+repair DIRTY REAL content and prove: (1) markup cannot break out,
 * (2) the gate still PASSES (no false hex trip), (3) '&' is escaped once, (4) attribute-injection via page-id is
 * neutralized, (5) faithfulness — clean text UNCHANGED, the emitter's own rgb(var(--token)) CSS is NEVER touched.
 *
 * HARDENING block: one regression tooth per adversarial-review finding —
 *   F1 (404 double-encode: notFoundSpec pre-neutralize × esc → &amp;#35;), F4 (javascript: route → live href sink),
 *   F5 (esc on nav href desyncs from the repair alias map → href="#"), F2 (repair escAttr missing color-neutralize
 *   on img alt), F3 (repair preserves a hex-shaped #fragment → gate trip).
 * Run: `tsx emit-escape.selfcheck.ts`.
 */
import { StaticEmitter } from './emitters/static-emitter'
import { dynamicFinalRepair } from './emitters/dynamic-final-repair'
import { runGate } from './conformance'
import { generatePages } from './generate'
import { buildManifestFromPhases } from './analyze'
import { samplePlan, sampleBlueprint } from './analyze/fixtures/sample-phase-outputs'
import { defaultStructuralSeeds } from './post-process'
import type { AnalyzeRequest, BuildManifest, PageSpec, ConformanceTokenSet } from './contract'

const RAW_HEX = /#[0-9a-fA-F]{3,8}\b/

function req0(): AnalyzeRequest {
  return { spec: 'emitter escape 검증', designRefMode: 'none', manyPages: true, conformanceProfile: 'default' }
}
const mkManifest = (tokens: ConformanceTokenSet, sitemap: PageSpec[], manifestId = 'm'): BuildManifest => ({
  manifestId,
  sitemap,
  sharedComponents: [],
  conformanceTokens: tokens,
})

async function main() {
  const host = buildManifestFromPhases(samplePlan, sampleBlueprint, req0()).conformanceTokens
  const emitter = new StaticEmitter()

  // ── DIRTY real content: breakout markup + hex tokens + pre-escaped '&' + attribute-injection ────────────────
  const home: PageSpec = {
    pageId: 'pg"x onerror=alert(1)', // attribute-injection vector on data-page-id
    route: '/',
    title: 'Sale #FF0000 </script><b>x</b>', // hex token + <script> breakout in one
    sections: ['#404 안내', 'Tom & Jerry &amp; Co', 'inject <script>evil</script>'],
    dependsOn: [],
  }
  const quoteRoute: PageSpec = { pageId: 'p3', route: '/a"b', title: 'Nav<i>', sections: ['s'], dependsOn: [] }
  const dirty = mkManifest(host, [home, quoteRoute], 'brand #abcdef <x> & co')

  const html = (await emitter.emitPage(dirty, home))[0].content
  const styles = (await emitter.emitShared(dirty)).find((f) => f.path === 'assets/styles.css')!.content
  const gate = await runGate([...(await emitter.emitShared(dirty)), (await emitter.emitPage(dirty, home))[0]])

  // ── CLEAN control — faithfulness: ordinary text must round-trip unchanged ────────────────────────────────────
  const clean = mkManifest(host, [{ pageId: 'page_home', route: '/', title: '소개', sections: ['미션'], dependsOn: [] }], 'site')
  const cleanHtml = (await emitter.emitPage(clean, clean.sitemap[0]))[0].content

  // ── HARDENING fixtures (adversarial-review regression teeth) ─────────────────────────────────────────────────
  // F1: hex-shaped 404 seed must render SINGLE-encoded (esc alone), not double-encoded (&amp;#35;) by a redundant pre-neutralize.
  const nf404 = (await generatePages(buildManifestFromPhases(samplePlan, sampleBlueprint, req0()), {
    seeds: { ...defaultStructuralSeeds, notFound: { title: '오류 #404 페이지', body: '없음' } },
  })).artifacts[0].files.find((f) => f.path === '404.html')!.content
  // F4: a javascript: route must be sanitized into a relative filename — never a live scheme sink in the nav.
  const xss = mkManifest(host, [
    { pageId: 'home', route: '/', title: 'H', sections: ['s'], dependsOn: [] },
    { pageId: 'x', route: 'javascript:alert(document.domain)', title: 'X', sections: ['s'], dependsOn: [] },
  ])
  const xssHome = (await emitter.emitPage(xss, xss.sitemap[0]))[0].content
  // F5: a nav link to a live page with an HTML-special char in a non-terminal path segment must still resolve
  // (routeToFile is now sanitized + in sync with the repair alias map) — NOT rewritten to href="#".
  const rnd = mkManifest(host, [
    { pageId: 'home', route: '/', title: 'Home', sections: ['s'], dependsOn: [] },
    { pageId: 'rnd', route: '/r&d/report', title: 'R&D', sections: ['y'], dependsOn: [] },
  ])
  const rndHomeRaw = (await emitter.emitPage(rnd, rnd.sitemap[0]))[0]
  const rndHome = dynamicFinalRepair([rndHomeRaw], rnd).files[0].content
  // F2: repair copies an <img> alt into aria-label + text — a hex-shaped alt token must be color-neutralized.
  const imgRepair = dynamicFinalRepair([{ path: 'index.html', content: '<img src="/logo.svg" alt="Save #FF0000 now">' }], clean)
  const imgOut = imgRepair.files[0].content
  const imgGate = await runGate(imgRepair.files)
  // F3: repair preserves a link's #fragment for navigation — a hex-shaped fragment must be color-neutralized.
  const fragManifest = mkManifest(host, [{ pageId: 'about', route: '/about', title: 'A', sections: ['s'], dependsOn: [] }])
  const fragRepair = dynamicFinalRepair([{ path: 'index.html', content: '<a href="/about#ff0000">x</a><a href="widget#deadbeef">y</a>' }], fragManifest)
  const fragOut = fragRepair.files[0].content
  const fragGate = await runGate(fragRepair.files)
  // G1 (re-review): the VERBATIM-return branches (pure #fragment href, external URL) must also color-neutralize.
  const extRepair = dynamicFinalRepair([{ path: 'index.html', content: '<a href="#ff0000">z</a><a href="https://cdn.example.com/theme#deadbeef">w</a>' }], clean)
  const extOut = extRepair.files[0].content
  const extGate = await runGate(extRepair.files)
  // G2 (re-review): a pathological rgb(-shaped route must not trip the gate via SEO canonical / sitemap <loc>.
  const rgbRun = await generatePages(mkManifest(host, [{ pageId: 'p', route: '/rgb(1,2,3)', title: 'T', sections: ['s'], dependsOn: [] }]), { seeds: defaultStructuralSeeds })
  const rgbGate = await runGate(rgbRun.artifacts[0].files)

  const checks: Record<string, boolean> = {
    // 1. markup breakout
    'esc: <title> breakout neutralized (no raw </script>, entity form present)':
      !html.includes('Sale #FF0000 </script><b>x</b>') &&
      html.includes('<title>Sale &#35;FF0000 &lt;/script&gt;&lt;b&gt;x&lt;/b&gt;</title>'),
    'esc: <h2> section breakout neutralized (no raw <script>)':
      !html.includes('<script>evil</script>') && html.includes('inject &lt;script&gt;evil&lt;/script&gt;'),
    // 2. gate does NOT false-trip on hex-shaped content
    'esc: gate PASSES on hex-laden content (no false rawHex trip)':
      gate.dsConformance.pass === true && gate.dsConformance.colorLiteralViolations.length === 0,
    'esc: no raw #hex survives anywhere in the emitted page':
      RAW_HEX.test(html) === false && html.includes('&#35;FF0000') && html.includes('&#35;404') && html.includes('&#35;abcdef'),
    // 3. '&' escaped exactly once
    "esc: '&' escaped once — 'Tom & Jerry &amp; Co' → 'Tom &amp; Jerry &amp;amp; Co'":
      html.includes('<h2>Tom &amp; Jerry &amp;amp; Co</h2>'),
    // 4. attribute injection
    'esc: data-page-id quote-injection neutralized (&quot;, no raw break)':
      html.includes('data-page-id="pg&quot;x onerror=alert(1)"') && !/data-page-id="pg"\s/.test(html),
    'esc: header <strong> manifestId escaped (markup + hex + &)':
      html.includes('<strong>brand &#35;abcdef &lt;x&gt; &amp; co</strong>'),
    'esc: nav LABEL escaped (Nav<i> → Nav&lt;i&gt;)': html.includes('>Nav&lt;i&gt;</a>'),
    // 5. faithfulness + reversal
    'faithful: clean title/section round-trip unchanged':
      cleanHtml.includes('<title>소개</title>') && cleanHtml.includes('<h2>미션</h2>') && cleanHtml.includes('© 소개'),
    'reversal: styles.css rgb(var(--token)) untouched (no &#40; / &#35; leaked into CSS)':
      styles.includes('rgb(var(--foreground))') && styles.includes('rgb(var(--primary))') &&
      !styles.includes('&#40;') && !styles.includes('&#35;'),
    'reversal: dirty page is still gate-conformant': gate.dsConformance.pass === true,
    // ── HARDENING (one regression tooth per confirmed adversarial finding) ──────────────────────────────────────
    'harden(F1): hex 404 seed renders SINGLE-encoded (&#35;404, no double-encode)':
      nf404.includes('오류 &#35;404 페이지') && !nf404.includes('&amp;#35;') && !nf404.includes('&amp;amp;'),
    'harden(F4): javascript: route sanitized to a relative filename (no live scheme in nav href)':
      !xssHome.includes('href="javascript:') && xssHome.includes('href="javascript-alert-document.domain.html"'),
    'harden(F5): non-terminal special-char route stays in sync with repair alias map (no href="#")':
      rndHome.includes('href="r-d/report.html"') && !rndHome.includes('data-unresolved-route'),
    'harden(F2): repair img-alt color-neutralized (no gate trip on hex-shaped alt)':
      imgOut.includes('&#35;FF0000') && RAW_HEX.test(imgOut) === false && imgGate.dsConformance.pass === true,
    'harden(F3): repair #fragment color-neutralized, mapped + unresolved (no gate trip)':
      fragOut.includes('href="about.html&#35;ff0000"') && fragOut.includes('data-unresolved-route="widget&#35;deadbeef"') &&
      RAW_HEX.test(fragOut) === false && fragGate.dsConformance.pass === true,
    'harden(G1): repair verbatim branch (pure #frag / external URL) color-neutralized':
      extOut.includes('href="&#35;ff0000"') && extOut.includes('theme&#35;deadbeef') &&
      RAW_HEX.test(extOut) === false && extGate.dsConformance.pass === true,
    'harden(G2): rgb(-shaped route does not trip gate via SEO canonical / sitemap loc':
      rgbGate.dsConformance.pass === true,
  }

  const ok = Object.values(checks).every(Boolean)
  console.log('=== Emitter-escape self-check (§15-1: injection + hex gate-trip + adversarial-review teeth) ===')
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
  console.log(`  gate    : pass=${gate.dsConformance.pass} colorViolations=${gate.dsConformance.colorLiteralViolations.length}`)
  console.log(`  harden  : 404-single=${!nf404.includes('&amp;#35;')} · js-sanitized=${!xssHome.includes('href="javascript:')} · rnd-synced=${rndHome.includes('href="r-d/report.html"')}`)
  console.log(ok ? 'EMIT-ESCAPE SELF-CHECK: PASS ✅' : 'EMIT-ESCAPE SELF-CHECK: FAIL ❌')
  process.exitCode = ok ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
