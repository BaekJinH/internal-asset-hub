/**
 * Selection/assembly self-check — the (B) increment-③ teeth (deterministic, NO cloud/Ollama/fs).
 *
 * Proves the chain: reference catalog → SELECT (keyword→category→pick, dedup, chrome wrapper, domain-aware,
 * gated-out, graceful skip, fallback) → ASSEMBLE (single-page BuildManifest) → emit → gate PASS with reference
 * tokens dominant. Run: `tsx selection.selfcheck.ts`.
 */
import { buildReferenceCatalog, type ReferenceCatalog, type ReferenceComponentMeta } from './analyze/reference-catalog'
import { selectComponents, isBlueprintGated } from './analyze/component-selector'
import { assembleManifest } from './analyze/assembler'
import { StaticEmitter } from './emitters/static-emitter'
import { runGate } from './conformance'
import { sampleReferenceComponents, sampleReferenceProfile } from './analyze/fixtures/sample-reference-project'
import type { AnalyzeRequest } from './contract'

/** helper: a valid catalog meta with overridable fields (for synthetic branch tests). */
function meta(id: string, category: string, recommendedDomains?: string[]): ReferenceComponentMeta {
  return {
    id,
    filename: `${id}.tsx`,
    category,
    props: [],
    hasResponsive: true,
    hasAria: true,
    conformance: { valid: true, errors: [], warnings: [] },
    recommendedDomains,
  }
}

async function main() {
  const catalog = buildReferenceCatalog(sampleReferenceComponents)
  const REF_PRIMARY = '217 119 6'

  // rich requirements → hero + feature + pricing + form
  const requirements = '히어로 메인 섹션, 서비스 소개, 가격 요금 안내, 문의 연락'
  const sel = selectComponents(requirements, catalog)

  // domain-aware branch (synthetic catalog: two heroes, one recommends 'saas')
  const domainCatalog: ReferenceCatalog = {
    components: { GenericHero: meta('GenericHero', 'hero'), SaasHero: meta('SaasHero', 'hero', ['saas']) },
    categories: { hero: ['GenericHero', 'SaasHero'] },
    rejected: [],
  }
  const domainPick = selectComponents('히어로', domainCatalog, { domain: 'saas' })
  const noDomainPick = selectComponents('히어로', domainCatalog, {})

  // gated category (custom keyword map → 'threejs'); must be excluded from auto selection
  const gatedCatalog: ReferenceCatalog = {
    components: { Fancy3D: meta('Fancy3D', 'threejs') },
    categories: { threejs: ['Fancy3D'] },
    rejected: [],
  }
  const gatedSel = selectComponents('삼차원', gatedCatalog, {
    keywordMap: [{ keywords: ['삼차원'], category: 'threejs' }],
  })

  // matched category with NO component in the catalog → skipped, no crash, no needless fallback
  const skipSel = selectComponents('히어로 후기', catalog) // hero matches, social_proof has no component

  // subType declared-but-absent → degrade to the plain category pick (regression: review finding)
  const subTypeCatalog: ReferenceCatalog = {
    components: { Testimonials: meta('Testimonials', 'social_proof') },
    categories: { social_proof: ['Testimonials'] },
    rejected: [],
  }
  const subTypeDegrade = selectComponents('통계 수치', subTypeCatalog, { subTypeCandidates: { stats: ['FancyStats'] } })

  // no keyword matches → fallback set (hero/feature/cta)
  const fallbackSel = selectComponents('존재하지않는요구사항', catalog)

  // assemble → emit → gate
  const req: AnalyzeRequest = {
    spec: '제철 착즙 주스 정기구독 랜딩',
    designRefMode: 'reference',
    manyPages: false,
    conformanceProfile: sampleReferenceProfile.profileId,
  }
  const { manifest, selection } = assembleManifest({
    manifestId: 'juice-landing',
    title: '제철 착즙 주스',
    requirements,
    catalog,
    req,
    reference: sampleReferenceProfile,
  })
  const emitter = new StaticEmitter()
  const shared = await emitter.emitShared(manifest)
  const pageFiles = await emitter.emitPage(manifest, manifest.sitemap[0])
  const gate = await runGate([...shared, ...pageFiles])

  const checks: Record<string, boolean> = {
    // select — matching + order
    'select: matched hero/feature/pricing/form in order':
      JSON.stringify(sel.matched.map((m) => m.category)) === JSON.stringify(['hero', 'feature', 'pricing', 'form']),
    'select: body picks first-in-category':
      JSON.stringify(sel.body) === JSON.stringify(['HeroBanner', 'FeatureGrid', 'PricingCard', 'ContactForm']),
    'select: not fallback (real matches)': sel.usedFallback === false,
    // select — chrome wrapper (generalizes Navbar_v1/Footer_v1)
    'wrapper: header resolved from navigation category': sel.header === 'SiteHeader',
    'wrapper: footer resolved from navigation category': sel.footer === 'SiteFooter',
    'wrapper: header is first, footer is last':
      sel.ordered[0] === 'SiteHeader' && sel.ordered[sel.ordered.length - 1] === 'SiteFooter',
    'wrapper: no duplicate ids': new Set(sel.ordered).size === sel.ordered.length,
    // domain-aware
    'domain: recommendedDomains match wins': domainPick.body[0] === 'SaasHero',
    'domain: no domain → first-in-category': noDomainPick.body[0] === 'GenericHero',
    // gating + graceful degradation
    'gate: isBlueprintGated(threejs) true, hero false': isBlueprintGated('threejs') && !isBlueprintGated('hero'),
    'gate: gated category excluded from selection': !gatedSel.ordered.includes('Fancy3D') && gatedSel.body.length === 0,
    'teeth: empty category skipped without fallback':
      JSON.stringify(skipSel.body) === JSON.stringify(['HeroBanner']) && skipSel.usedFallback === false,
    'teeth: subType declared-but-absent degrades to category pick':
      JSON.stringify(subTypeDegrade.body) === JSON.stringify(['Testimonials']),
    'fallback: no match → hero/feature fallback used':
      fallbackSel.usedFallback === true && fallbackSel.body.includes('HeroBanner') && fallbackSel.body.includes('FeatureGrid'),
    // assemble
    'assemble: single home page at /': manifest.sitemap.length === 1 && manifest.sitemap[0].route === '/',
    'assemble: body → ordered sections':
      JSON.stringify(manifest.sitemap[0].sections) ===
      JSON.stringify(['Hero Banner', 'Feature Grid', 'Pricing Card', 'Contact Form']),
    'assemble: chrome → sharedComponents':
      JSON.stringify(manifest.sharedComponents.map((c) => c.name)) === JSON.stringify(['Site Header', 'Site Footer']),
    'assemble: reference tokens dominate': manifest.conformanceTokens.cssVars['--primary'] === REF_PRIMARY,
    // emit → gate (chain closed)
    'pipeline: assembled page passes the gate': gate.dsConformance.pass === true,
    'pipeline: zero color-literal violations': gate.dsConformance.colorLiteralViolations.length === 0,
  }

  const ok = Object.values(checks).every(Boolean)
  console.log('=== Selection/assembly self-check ((B)③: select · wrapper · domain · gate · assemble; no cloud/fs) ===')
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
  console.log(`  select : matched=[${sel.matched.map((m) => m.category).join(',')}] → ordered=[${sel.ordered.join(', ')}]`)
  console.log(`  assemble: ${manifest.manifestId} · sections=${manifest.sitemap[0].sections.length} · shared=${manifest.sharedComponents.length} · --primary=${manifest.conformanceTokens.cssVars['--primary']}`)
  console.log(`  pipeline: gate=${gate.dsConformance.pass ? 'PASS' : 'FAIL'} literalViolations=${gate.dsConformance.colorLiteralViolations.length} (selection body=${selection.body.length})`)
  console.log(ok ? 'SELECTION SELF-CHECK: PASS ✅' : 'SELECTION SELF-CHECK: FAIL ❌')
  process.exitCode = ok ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
