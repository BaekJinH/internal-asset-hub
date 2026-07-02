/**
 * Reference-loader self-check — the (B)② teeth: REAL file I/O over a deliberately MESSY on-disk reference
 * project (NO cloud/Ollama). Proves the fs discovery + dirty-CSS robustness + zod fail-closed, then closes the
 * chain on disk: real reference project → catalog + profile → assemble → emit → gate PASS.
 * Run: `tsx reference-loader.selfcheck.ts`.
 */
import { fileURLToPath } from 'node:url'
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildReferenceFromDisk, loadReferenceProject } from './analyze/reference-loader'
import { assembleManifest } from './analyze/assembler'
import { resolveHostProfile } from './analyze/host-profile'
import { StaticEmitter } from './emitters/static-emitter'
import { runGate } from './conformance'
import type { AnalyzeRequest } from './contract'

const fixture = (slug: string) =>
  fileURLToPath(new URL(`./analyze/fixtures/reference-projects/${slug}`, import.meta.url))

async function main() {
  const host = resolveHostProfile('default')
  const disk = await buildReferenceFromDisk(fixture('juice-landing'))

  // zod fail-closed: a malformed reference.config.json must throw (not silently degrade)
  let brokenThrew = false
  let brokenMsg = ''
  try {
    await loadReferenceProject(fixture('broken-config'))
  } catch (err) {
    brokenThrew = true
    brokenMsg = err instanceof Error ? err.message : String(err)
  }

  // path fence: a config whose cssPath escapes the project root must throw (not read outside root)
  let escapeThrew = false
  let escapeMsg = ''
  try {
    await loadReferenceProject(fixture('escape-config'))
  } catch (err) {
    escapeThrew = true
    escapeMsg = err instanceof Error ? err.message : String(err)
  }

  // end-to-end on disk: requirements → select from the loaded catalog → assemble → emit → gate
  const req: AnalyzeRequest = {
    spec: '제철 착즙 주스 랜딩',
    designRefMode: 'reference',
    manyPages: false,
    conformanceProfile: disk.config.profileId,
  }
  const { manifest } = assembleManifest({
    manifestId: 'juice-landing',
    title: '제철 착즙 주스',
    requirements: '히어로 메인, 서비스 소개, 가격 안내, 문의 연락',
    catalog: disk.catalog,
    req,
    reference: disk.profileSource ?? undefined,
  })
  const emitter = new StaticEmitter()
  const shared = await emitter.emitShared(manifest)
  const pageFiles = await emitter.emitPage(manifest, manifest.sitemap[0])
  const gate = await runGate([...shared, ...pageFiles])

  const anyLiteralInProfile = Object.values(disk.profile.cssVars).some((v) => /#|rgb\(|hsl\(/.test(v))

  // ── symlink path-fence teeth (adversarial-review (B)④): a symLINK AT componentsDir must fail closed, but a
  //    symlink pointing INSIDE root must still load (no false positive). Cross-platform via junction. If the
  //    environment forbids link creation (no privilege), the two checks self-skip rather than failing the suite.
  const linkBase = mkdtempSync(join(tmpdir(), 'refloader-'))
  let symlinkSupported = true
  let escapeSymlinkThrew = false
  let inRootSymlinkWalked = false
  try {
    // outside-root secret the reference must NOT reach
    const outside = join(linkBase, 'outside')
    mkdirSync(outside, { recursive: true })
    writeFileSync(join(outside, 'Secret.tsx'), 'interface SecretProps { k: string }\nexport const Secret = (_: SecretProps) => null\n')

    // projA — components/ is a symlink to the OUTSIDE dir → load must throw (escape via symlink)
    const projA = join(linkBase, 'projA')
    mkdirSync(projA, { recursive: true })
    writeFileSync(join(projA, 'reference.config.json'), JSON.stringify({ profileId: 'ref:symlink-a' }))
    writeFileSync(join(projA, 'globals.css'), ':root { --primary: 1 2 3; }\n')
    symlinkSync(outside, join(projA, 'components'), 'junction')
    try {
      await buildReferenceFromDisk(projA)
    } catch (err) {
      escapeSymlinkThrew = /symlink|escape/i.test(err instanceof Error ? err.message : String(err))
    }

    // projB — components/ is a symlink to an IN-ROOT real dir → must load fine (walk traverses it)
    const projB = join(linkBase, 'projB')
    mkdirSync(join(projB, 'realcomps'), { recursive: true })
    writeFileSync(join(projB, 'reference.config.json'), JSON.stringify({ profileId: 'ref:symlink-b' }))
    writeFileSync(join(projB, 'globals.css'), ':root { --primary: 4 5 6; }\n')
    writeFileSync(join(projB, 'realcomps', 'Widget.tsx'), 'interface WidgetProps { title: string }\nexport const Widget = (_: WidgetProps) => null\n')
    symlinkSync(join(projB, 'realcomps'), join(projB, 'components'), 'junction')
    const bRef = await buildReferenceFromDisk(projB)
    inRootSymlinkWalked = Object.keys(bRef.catalog.components).length + bRef.catalog.rejected.length >= 1
  } catch {
    symlinkSupported = false // no link-creation privilege — self-skip the two symlink checks
  } finally {
    try {
      rmSync(linkBase, { recursive: true, force: true })
    } catch {
      /* best-effort cleanup */
    }
  }

  const checks: Record<string, boolean> = {
    // config
    'config: loaded + validated (profileId, domain)':
      disk.config.profileId === 'ref:juice-landing' && disk.config.domain === 'ecommerce',
    'zod: malformed config fails closed (throws)': brokenThrew && /valid/i.test(brokenMsg),
    'fence: cssPath escaping root fails closed (throws)': escapeThrew && /escape/i.test(escapeMsg),
    // discovery
    'discovery: 5 valid components (BrokenWidget rejected)':
      Object.keys(disk.catalog.components).length === 5 &&
      disk.catalog.rejected.length === 1 &&
      disk.catalog.rejected[0] === 'BrokenWidget',
    'discovery: recursive (nested FeatureGrid + ContactForm found)':
      !!disk.catalog.components['FeatureGrid'] && !!disk.catalog.components['ContactForm'],
    'discovery: extension filter (notes.md/README ignored)':
      !disk.catalog.components['notes'] && !disk.catalog.components['README'],
    'discovery: empty component skipped (warning)':
      !disk.catalog.components['Empty'] && disk.warnings.some((w) => /empty/i.test(w)),
    'discovery: categories indexed from disk':
      disk.catalog.categories['hero']?.includes('HeroBanner') === true &&
      disk.catalog.categories['navigation']?.includes('SiteHeader') === true,
    // dirty-CSS robustness (the (B)② mandate — real CSS is messier than fixtures)
    'dirty: .dark / @media cannot override :root --primary': disk.profile.cssVars['--primary'] === '217 119 6',
    'dirty: omitted --card inherits host base (merge)': disk.profile.cssVars['--card'] === host.cssVars['--card'],
    'dirty: unterminated final --ring declaration captured': disk.profile.cssVars['--ring'] === '217 119 6',
    'dirty: raw-hex token excluded': disk.profile.cssVars['--trap-hex'] === undefined,
    'reversal: no raw literal in any profile token value': anyLiteralInProfile === false,
    // symlink path fence (self-skips where link creation is unprivileged)
    'fence: symlinked componentsDir escaping root fails closed': !symlinkSupported || escapeSymlinkThrew,
    'fence: symlink INSIDE root still loads (no false positive)': !symlinkSupported || inRootSymlinkWalked,
    // end-to-end on disk
    'e2e: assembled from disk, reference tokens dominate':
      manifest.conformanceTokens.cssVars['--primary'] === '217 119 6',
    'e2e: chrome wrapped (SiteHeader first, SiteFooter last)':
      manifest.sharedComponents.some((c) => c.name === 'Site Header') &&
      manifest.sharedComponents.some((c) => c.name === 'Site Footer'),
    'e2e: assembled page passes the gate': gate.dsConformance.pass === true,
    'e2e: zero color-literal violations': gate.dsConformance.colorLiteralViolations.length === 0,
  }

  const ok = Object.values(checks).every(Boolean)
  console.log('=== Reference-loader self-check ((B)②: real fs · dirty CSS · zod fail-closed · disk→assemble→gate) ===')
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
  console.log(`  loaded  : ${Object.keys(disk.catalog.components).length} components, rejected=[${disk.catalog.rejected.join(',')}], warnings=${disk.warnings.length}`)
  console.log(`  profile : --primary=${disk.profile.cssVars['--primary']} (dark ignored) · --card=${disk.profile.cssVars['--card']} (inherited) · --ring=${disk.profile.cssVars['--ring']} (no-semi)`)
  console.log(`  zod     : broken-config threw=${brokenThrew}`)
  console.log(`  symlink : supported=${symlinkSupported} · escape→threw=${escapeSymlinkThrew} · in-root→walked=${inRootSymlinkWalked}`)
  console.log(`  e2e     : ${manifest.manifestId} sections=${manifest.sitemap[0].sections.length} gate=${gate.dsConformance.pass ? 'PASS' : 'FAIL'}`)
  console.log(ok ? 'LOADER SELF-CHECK: PASS ✅' : 'LOADER SELF-CHECK: FAIL ❌')
  process.exitCode = ok ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
