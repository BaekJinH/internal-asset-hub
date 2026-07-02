/**
 * Reference-extraction self-check — the (B) increment-① teeth (deterministic, NO cloud/Ollama/fs).
 *
 * Proves three things end-to-end from an in-memory reference project:
 *   1. CATALOG   — clean reference components are extracted + categorized; a broken one is REJECTED.
 *   2. PROFILE   — the reference's channel tokens dominate; raw hex/rgb() literals CANNOT enter the token set
 *                  (reversal principle enforced at the parser); structural governance stays host-canonical.
 *   3. PIPELINE  — a reference-driven BuildManifest flows through emit → gate and stays conformant, while a
 *                  no-reference build falls back to the embed-host default (backward compatibility).
 * Run: `tsx reference.selfcheck.ts`.
 */
import { buildReferenceCatalog, extractComponentMeta } from './analyze/reference-catalog'
import { extractCssVars, extractProfileFromCss } from './analyze/reference-profile'
import { resolveHostProfile, resolveConformanceProfile } from './analyze/host-profile'
import { buildManifestFromPhases } from './analyze'
import { StaticEmitter } from './emitters/static-emitter'
import { runGate } from './conformance'
import { samplePlan, sampleBlueprint } from './analyze/fixtures/sample-phase-outputs'
import {
  sampleReferenceCss,
  sampleReferenceProfile,
  sampleReferenceComponents,
} from './analyze/fixtures/sample-reference-project'
import type { AnalyzeRequest } from './contract'

async function main() {
  const host = resolveHostProfile('default')
  const HOST_PRIMARY = host.cssVars['--primary'] // embed-host default --primary (79 70 229)
  const REF_PRIMARY = '217 119 6' // reference --primary

  // ── 1. CATALOG ────────────────────────────────────────────────────────────────────────────────
  const catalog = buildReferenceCatalog(sampleReferenceComponents)
  const hero = catalog.components['HeroBanner']
  const pricing = catalog.components['PricingCard']
  const dirty = extractComponentMeta(sampleReferenceComponents[3]) // BrokenWidget

  // ── 2. PROFILE ────────────────────────────────────────────────────────────────────────────────
  const cssVars = extractCssVars(sampleReferenceCss)
  const refProfile = extractProfileFromCss(sampleReferenceProfile, host)
  const noTokens = extractProfileFromCss({ profileId: 'empty', css: 'body { color: red; }' }, host)
  const anyLiteralInTokens = Object.values(cssVars).some((v) => /#|rgb\(|hsl\(/.test(v))

  // ── 3. PIPELINE ───────────────────────────────────────────────────────────────────────────────
  const req: AnalyzeRequest = {
    spec: '제철 착즙 주스 정기구독 랜딩 (레퍼런스 프로젝트 순응)',
    designRefMode: 'reference',
    manyPages: true,
    conformanceProfile: sampleReferenceProfile.profileId,
  }
  const refManifest = buildManifestFromPhases(samplePlan, sampleBlueprint, req, sampleReferenceProfile)
  const hostManifest = buildManifestFromPhases(samplePlan, sampleBlueprint, req) // no reference → fallback

  const emitter = new StaticEmitter()
  const shared = await emitter.emitShared(refManifest)
  const styles = shared.find((f) => f.path.endsWith('styles.css'))?.content ?? ''
  const firstPage = refManifest.sitemap[0]
  const pageFiles = await emitter.emitPage(refManifest, firstPage)
  const gate = await runGate([...shared, ...pageFiles])

  // styles.css: reference token lives in :root; body strips :root before literal scan → no leak outside :root.
  const bodyOnly = styles.replace(/:root\s*\{[^}]*\}/g, '')

  const checks: Record<string, boolean> = {
    // 1. catalog
    'catalog: 3 valid components': Object.keys(catalog.components).length === 3,
    'catalog: 1 rejected (BrokenWidget)': catalog.rejected.length === 1 && catalog.rejected[0] === 'BrokenWidget',
    'catalog: hero category + props extracted': hero?.category === 'hero' &&
      hero.props.includes('title') && hero.props.includes('subtitle') && hero.props.includes('ctaLabel'),
    'catalog: hero responsive + aria detected': hero?.hasResponsive === true && hero?.hasAria === true,
    'catalog: form categorized': catalog.components['ContactForm']?.category === 'form',
    'catalog: pricing categorized, no-responsive warned': pricing?.category === 'pricing' &&
      pricing.hasResponsive === false &&
      pricing.conformance.warnings.some((w) => /responsive/i.test(w)),
    'catalog: categories index built': catalog.categories['hero']?.includes('HeroBanner') === true &&
      catalog.categories['pricing']?.includes('PricingCard') === true,
    'teeth: broken component invalid (3 blocking errors)': dirty.conformance.valid === false &&
      dirty.conformance.errors.length === 3,
    // 2. profile
    'profile: reference --primary dominates (≠ host)': cssVars['--primary'] === REF_PRIMARY &&
      REF_PRIMARY !== HOST_PRIMARY,
    'reversal: raw-hex token excluded': cssVars['--trap-hex'] === undefined,
    'reversal: raw-fn token excluded': cssVars['--trap-fn'] === undefined,
    'reversal: NO raw literal in any token value': anyLiteralInTokens === false,
    'profile: governance stays host-canonical': refProfile !== null &&
      refProfile.denylist === host.denylist &&
      refProfile.namingRules === host.namingRules &&
      refProfile.fsdLanding === host.fsdLanding,
    'profile: colorTokens derived from reference names': refProfile?.colorTokens.includes('primary') === true &&
      refProfile?.colorTokens.includes('accent') === true,
    'profile: no-channel css → null (fallback signal)': noTokens === null,
    'resolver: resolveConformanceProfile(ref) yields reference tokens':
      resolveConformanceProfile(req.conformanceProfile, sampleReferenceProfile).cssVars['--primary'] === REF_PRIMARY,
    'resolver: resolveConformanceProfile(no ref) yields host tokens':
      resolveConformanceProfile(req.conformanceProfile).cssVars['--primary'] === HOST_PRIMARY,
    // 3. pipeline
    'pipeline: reference tokens reach the manifest': refManifest.conformanceTokens.cssVars['--primary'] === REF_PRIMARY,
    'pipeline: no-reference build falls back to host': hostManifest.conformanceTokens.cssVars['--primary'] === HOST_PRIMARY,
    'pipeline: reference value emitted into :root': styles.includes(`--primary: ${REF_PRIMARY};`),
    'pipeline: body sources color via rgb(var(--token))': bodyOnly.includes('rgb(var(--background))'),
    'pipeline: body carries no raw hex outside :root': /#[0-9a-fA-F]{3,8}\b/.test(bodyOnly) === false,
    'pipeline: reference-driven output passes the gate': gate.dsConformance.pass === true,
    'pipeline: gate finds zero color-literal violations': gate.dsConformance.colorLiteralViolations.length === 0,
  }

  const ok = Object.values(checks).every(Boolean)
  console.log('=== Reference-extraction self-check ((B)①: catalog · profile · pipeline; no cloud/fs) ===')
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
  console.log(`  catalog : ${Object.keys(catalog.components).length} components, rejected=[${catalog.rejected.join(',')}]`)
  console.log(`  profile : --primary host=${HOST_PRIMARY} → reference=${cssVars['--primary']} (${refProfile?.colorTokens.length} colorTokens)`)
  console.log(`  pipeline: manifest=${refManifest.manifestId} gate=${gate.dsConformance.pass ? 'PASS' : 'FAIL'} literalViolations=${gate.dsConformance.colorLiteralViolations.length}`)
  console.log(ok ? 'REFERENCE SELF-CHECK: PASS ✅' : 'REFERENCE SELF-CHECK: FAIL ❌')
  process.exitCode = ok ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
