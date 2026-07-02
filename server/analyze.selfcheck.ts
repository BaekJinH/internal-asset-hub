/**
 * Analyze extraction self-check — proves Phase-1 front-to-back WITHOUT a cloud call.
 *   fixture phase outputs → zod validate (IR contracts) → deterministic mapper → BuildManifest
 *   → emit → Dynamic Final Repair → conformance gate → quality audit.
 * Plus the REVERSAL proof: devpilot ThemeConfig raw hex never reaches conformanceTokens (host dominates).
 * Run: `tsx analyze.selfcheck.ts`.
 */
import { DevelopmentPlanSchema, ScreenBlueprintSchema, ThemeConfigSchema } from './analyze/ir'
import { samplePlan, sampleBlueprint, sampleTheme } from './analyze/fixtures/sample-phase-outputs'
import { mapToBuildManifest } from './analyze/manifest-mapper'
import { getEmitter } from './emitters'
import { dynamicFinalRepair } from './emitters/dynamic-final-repair'
import { runGate } from './conformance'
import { runQualityAudit } from './conformance/quality-audit'
import type { AnalyzeRequest } from './contract'

async function main() {
  const req: AnalyzeRequest = {
    spec: '제철 착즙 주스 정기구독 서비스 랜딩(홈/소개/문의)',
    designRefMode: 'none',
    manyPages: true,
    conformanceProfile: 'default',
  }

  // 1. IR contracts accept realistic devpilot output
  const planOk = DevelopmentPlanSchema.safeParse(samplePlan).success
  const bpOk = ScreenBlueprintSchema.safeParse(sampleBlueprint).success
  const themeOk = ThemeConfigSchema.safeParse(sampleTheme).success

  // 2. deterministic map → BuildManifest
  const manifest = mapToBuildManifest(samplePlan, sampleBlueprint, req)
  const home = manifest.sitemap.find((p) => p.pageId === 'page_home')!
  const about = manifest.sitemap.find((p) => p.pageId === 'page_about')!
  const header = manifest.sharedComponents.find((c) => c.name === 'site_header')
  const footer = manifest.sharedComponents.find((c) => c.name === 'site_footer')

  // 2b. determinism tooth (adversarial-review (B)④): sharedComponents must be CODEPOINT-sorted, not locale-sorted.
  //     mixed-case ids 'HeroBanner' vs 'header' → codepoint keeps 'HeroBanner' first (H=72<h=104); en-US
  //     localeCompare flips them. The lowercase site_* fixture above masks this, so drive a mixed-case case.
  const detPlan = {
    project_overview: { project_name: 'det' },
    pages: [
      { page_id: 'page_home', page_name: 'Home', user_flow_order: 1 },
      { page_id: 'page_two', page_name: 'Two', user_flow_order: 2 },
    ],
  }
  const detBp = {
    pages: [
      { page_id: 'page_home', page_name: 'Home', layout_tree: [{ component_id: 'HeroBanner' }, { component_id: 'header' }] },
      { page_id: 'page_two', page_name: 'Two', layout_tree: [{ component_id: 'HeroBanner' }, { component_id: 'header' }] },
    ],
  }
  const detShared = mapToBuildManifest(detPlan, detBp, req).sharedComponents.map((c) => c.name)

  // 3. reversal proof — ThemeConfig hex must NOT be in conformanceTokens; host token must be
  const tokensStr = JSON.stringify(manifest.conformanceTokens)
  const noHexLeak = !tokensStr.includes('#') && !tokensStr.toLowerCase().includes('4f46e5')
  const hostBorder = manifest.conformanceTokens.cssVars['--border'] === '203 213 225'

  // 4. full pipeline — analyze IR feeds the proven static spine
  const emitter = getEmitter('static')
  const emitted = [...(await emitter.emitShared(manifest))]
  for (const page of manifest.sitemap) emitted.push(...(await emitter.emitPage(manifest, page)))
  const { files } = dynamicFinalRepair(emitted, manifest)
  const gate = (await runGate(files)).dsConformance
  const audit = runQualityAudit(files, manifest)

  const checks: Record<string, boolean> = {
    'IR: DevelopmentPlan validates': planOk,
    'IR: ScreenBlueprint validates': bpOk,
    'IR: ThemeConfig validates': themeOk,
    'map: manifestId = juiceful': manifest.manifestId === 'juiceful',
    'map: 3 pages': manifest.sitemap.length === 3,
    'map: home route = /': home.route === '/',
    'map: home dependsOn = []': home.dependsOn.length === 0,
    'map: about route = /about': about.route === '/about',
    'map: about dependsOn = [page_home]': about.dependsOn.length === 1 && about.dependsOn[0] === 'page_home',
    'map: home sections exclude chrome (3)': home.sections.length === 3 && !home.sections.some((s) => /header|footer/i.test(s)),
    'map: sharedComponents = 2 (header+footer)': manifest.sharedComponents.length === 2,
    'determinism: sharedComponents codepoint-sorted (HeroBanner before header)':
      detShared.length === 2 && detShared[0] === 'HeroBanner' && detShared[1] === 'header',
    'map: site_header reusedBy 3 + props.title:string': !!header && header.reusedBy.length === 3 && header.props.title === 'string',
    'map: site_footer reusedBy 3': !!footer && footer.reusedBy.length === 3,
    'reversal: no ThemeConfig hex in tokens': noHexLeak,
    'reversal: host --border sourced (203 213 225)': hostBorder,
    'pipeline: conformance gate PASS': gate.pass,
    'pipeline: quality audit ran': typeof audit.qualityScore === 'number',
  }

  const ok = Object.values(checks).every(Boolean)
  console.log('=== Analyze extraction self-check (Phase-1 front-to-back, no cloud) ===')
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
  console.log(`  manifest: ${manifest.manifestId} · pages=${manifest.sitemap.length} · shared=${manifest.sharedComponents.map((c) => c.name).join(',')}`)
  console.log(`  routes  : ${manifest.sitemap.map((p) => p.pageId + '→' + p.route).join('  ')}`)
  console.log(`  gate    : ${gate.pass ? 'PASS' : 'FAIL'} · qualityScore=${audit.qualityScore}/100 (warnings=${audit.warnings.length})`)
  console.log(ok ? 'ANALYZE SELF-CHECK: PASS ✅' : 'ANALYZE SELF-CHECK: FAIL ❌')
  process.exitCode = ok ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
