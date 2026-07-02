/**
 * Profile-registry self-check — the (B)④ teeth (deterministic, NO cloud/Ollama).
 *
 * Proves the registry that makes `AnalyzeRequest.conformanceProfile` MEAN a concrete on-disk reference project:
 *   1. RESOLVE   — a registered profileId resolves to its reference; the reference's tokens dominate.
 *   2. ASSERT    — registering under a key that disagrees with the reference's own config.profileId FAILS
 *                  CLOSED (deviation #2 from the (B)② report — no more silently-wrong conformanceProfile).
 *   3. RESILIENT — registerReferenceDir skips malformed / path-escaping / duplicate references with a reason,
 *                  yet never crashes startup and never resolves a request to a half-built reference.
 *   4. ONE-FLIP  — the resolved reference threads into buildManifestFromPhases (what analyze() does the instant
 *                  the cloud key lands), and an unregistered profile falls back to the embed-host default.
 *   5. TRANSPORT — over real HTTP: registry → resolve → assemble → PUT → POST /generate → reference-dominant,
 *                  gate-PASSing pages; /analyze stays an honest 503 with the registry injected (no crash).
 * Run: `tsx registry.selfcheck.ts`.
 */
import type { AddressInfo } from 'node:net'
import { fileURLToPath } from 'node:url'
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ProfileRegistry } from './analyze/profile-registry'
import { analyze, buildManifestFromPhases } from './analyze'
import { assembleManifest } from './analyze/assembler'
import { resolveHostProfile } from './analyze/host-profile'
import type { ModelClient } from './analyze/model-client'
import { createEngineServer } from './transport'
import { putManifest } from './jobs'
import { samplePlan, sampleBlueprint } from './analyze/fixtures/sample-phase-outputs'
import type { AnalyzeRequest } from './contract'

const fixture = (rel: string) => fileURLToPath(new URL(`./analyze/fixtures/${rel}`, import.meta.url))

async function main() {
  const host = resolveHostProfile('default')
  const HOST_PRIMARY = host.cssVars['--primary'] // 79 70 229
  const REF_PRIMARY = '217 119 6' // juice-landing reference --primary

  // ── 1. RESOLVE + 3. RESILIENT: scan a references root holding one valid + two broken references ──────
  const reg = new ProfileRegistry()
  const scan = await reg.registerReferenceDir(fixture('reference-projects'))
  const juice = reg.resolveReference('ref:juice-landing')
  const skippedBroken = scan.skipped.find((s) => s.name === 'broken-config')
  const skippedEscape = scan.skipped.find((s) => s.name === 'escape-config')

  // ── 2. ASSERT (deviation #2): key must equal the reference's own config.profileId ───────────────────
  const juiceRoot = fixture('reference-projects/juice-landing')
  let mismatchThrew = false
  let mismatchMsg = ''
  try {
    await new ProfileRegistry().registerReference('ref:WRONG', juiceRoot)
  } catch (err) {
    mismatchThrew = true
    mismatchMsg = err instanceof Error ? err.message : String(err)
  }
  const agreeReg = new ProfileRegistry()
  const agreed = await agreeReg.registerReference('ref:juice-landing', juiceRoot)

  // ── 3. RESILIENT: duplicate profileId across subdirs keeps the first (codepoint order 'a' before 'b') ─
  const dupReg = new ProfileRegistry()
  const dupScan = await dupReg.registerReferenceDir(fixture('registry-dup'))
  const dupKept = dupReg.resolveReference('ref:dup') // 'a' (--primary 10 20 30), NOT 'b' (99 99 99)

  // ── 3. RESILIENT: a missing references root degrades to a skip note, never throws ───────────────────
  const missReg = new ProfileRegistry()
  const missScan = await missReg.registerReferenceDir(fixture('does-not-exist'))

  // ── 3. RESILIENT: a symlinked reference dir is SKIPPED WITH A NOTE (not silently dropped) — the target
  //    lives OUTSIDE the scanned root so it cannot register directly. Self-skips where links are unprivileged. ─
  const linkRoot = mkdtempSync(join(tmpdir(), 'refreg-'))
  const linkTgt = mkdtempSync(join(tmpdir(), 'reftgt-'))
  let symlinkSupported = true
  let symlinkSkipNoted = false
  try {
    const realRef = join(linkRoot, 'real-ref')
    mkdirSync(realRef, { recursive: true })
    writeFileSync(join(realRef, 'reference.config.json'), JSON.stringify({ profileId: 'ref:real' }))
    writeFileSync(join(realRef, 'globals.css'), ':root { --primary: 7 7 7; }\n')
    const target = join(linkTgt, 'linked')
    mkdirSync(target, { recursive: true })
    writeFileSync(join(target, 'reference.config.json'), JSON.stringify({ profileId: 'ref:linked' }))
    writeFileSync(join(target, 'globals.css'), ':root { --primary: 8 8 8; }\n')
    symlinkSync(target, join(linkRoot, 'linked-ref'), 'junction')
    const symReg = new ProfileRegistry()
    const symScan = await symReg.registerReferenceDir(linkRoot)
    symlinkSkipNoted =
      symScan.registered.includes('ref:real') &&
      !symReg.has('ref:linked') &&
      symScan.skipped.some((s) => s.name === 'linked-ref' && /symlink/i.test(s.reason))
  } catch {
    symlinkSupported = false
  } finally {
    try {
      rmSync(linkRoot, { recursive: true, force: true })
      rmSync(linkTgt, { recursive: true, force: true })
    } catch {
      /* best-effort cleanup */
    }
  }

  // ── 4. ONE-FLIP: the resolved reference threads into the manifest exactly as analyze() will ─────────
  const req: AnalyzeRequest = {
    spec: '제철 착즙 주스 랜딩 (registry conformance)',
    designRefMode: 'reference',
    manyPages: true,
    conformanceProfile: 'ref:juice-landing',
  }
  const threaded = buildManifestFromPhases(samplePlan, sampleBlueprint, req, juice?.profileSource ?? undefined)
  const unregistered = reg.resolveReference('ref:no-such-profile')
  const fallback = buildManifestFromPhases(samplePlan, sampleBlueprint, req, unregistered?.profileSource ?? undefined)

  // one-flip through the REAL analyze() line-67 (inject an available client so the deferred cloud gate is
  // bypassed): proves analyze() actually threads the registry-resolved reference, not just the mapper directly.
  // A regression that dropped `reference` at that line would now turn these red (the coverage gap the review found).
  const makeFakeClient = (): ModelClient => {
    let n = 0
    return {
      available: true,
      async generateText() {
        n += 1
        return { text: JSON.stringify(n === 1 ? samplePlan : sampleBlueprint) }
      },
    }
  }
  const analyzeRef = await analyze({ ...req, conformanceProfile: 'ref:juice-landing' }, reg, makeFakeClient())
  const analyzeHost = await analyze({ ...req, conformanceProfile: 'ref:unregistered' }, reg, makeFakeClient())

  // ── 5. TRANSPORT: registry → assemble → PUT → generate over real HTTP (registry injected into server) ─
  const { manifest } = assembleManifest({
    manifestId: 'registry-juice',
    title: '제철 착즙 주스',
    requirements: '히어로 메인, 서비스 소개, 가격 안내, 문의 연락',
    catalog: juice!.catalog,
    req: { ...req, conformanceProfile: juice!.config.profileId },
    reference: juice!.profileSource ?? undefined,
  })
  putManifest(manifest, req)

  const server = createEngineServer({ registry: reg })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as AddressInfo).port
  const base = `http://127.0.0.1:${port}`
  const call = async (method: string, path: string, body?: unknown) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    let json: any = null
    try {
      json = await res.json()
    } catch {
      /* non-JSON */
    }
    return { status: res.status, json }
  }

  try {
    const analyze503 = await call('POST', '/analyze', req)
    const gen = await call('POST', '/generate', { manifestId: manifest.manifestId })
    const jobId: string = gen.json?.jobId
    const page = await call('GET', `/jobs/${jobId}/pages/page_home`)
    const styles: string =
      page.json?.files?.find((f: any) => typeof f?.path === 'string' && f.path.endsWith('styles.css'))?.content ?? ''

    const checks: Record<string, boolean> = {
      // 1. resolve + reference dominance
      'scan: registers exactly the one valid reference': scan.registered.length === 1 && scan.registered[0] === 'ref:juice-landing',
      'resolve: known profileId → reference (primary dominates)': juice?.profile.cssVars['--primary'] === REF_PRIMARY,
      'resolve: unknown profileId → null (host fallback)': unregistered === null,
      'registry: has() + list() reflect registration': reg.has('ref:juice-landing') && reg.list().join(',') === 'ref:juice-landing',
      // 2. assertion (deviation #2)
      'assert: key ≠ config.profileId fails closed (throws)': mismatchThrew && /mismatch/i.test(mismatchMsg),
      'assert: matching key registers, profileId agrees': agreed.profileId === 'ref:juice-landing' && agreeReg.has('ref:juice-landing'),
      // 3. resilient
      'resilient: malformed config skipped with reason': !!skippedBroken && /valid/i.test(skippedBroken.reason),
      'resilient: path-escaping config skipped with reason': !!skippedEscape && /escape/i.test(skippedEscape.reason),
      'resilient: bad references are NOT resolvable': reg.resolveReference('ref:escape') === null,
      'dup: duplicate profileId keeps the first (a), skips the rest': dupScan.registered.join(',') === 'ref:dup' &&
        dupScan.skipped.some((s) => s.name === 'b' && /duplicate/i.test(s.reason)) &&
        dupKept?.profile.cssVars['--primary'] === '10 20 30',
      'missing-root: degrades to a skip note, no throw': missScan.registered.length === 0 && missScan.skipped.length === 1 &&
        /unreadable/i.test(missScan.skipped[0].reason),
      'resilient: degraded registration surfaces loader warnings (empty component)':
        scan.warnings.some((w) => w.name === 'juice-landing' && w.notes.some((n) => /empty/i.test(n))),
      'resilient: symlinked reference dir skipped WITH a note (real ref still registers)': !symlinkSupported || symlinkSkipNoted,
      // 4. one-flip threading
      'one-flip: resolved reference threads → manifest tokens dominate': threaded.conformanceTokens.cssVars['--primary'] === REF_PRIMARY,
      'one-flip: unregistered profile → host default in manifest': fallback.conformanceTokens.cssVars['--primary'] === HOST_PRIMARY,
      'one-flip(real analyze): registered reference dominates through analyze()':
        analyzeRef.conformanceTokens.cssVars['--primary'] === REF_PRIMARY,
      'one-flip(real analyze): unregistered profile → host default through analyze()':
        analyzeHost.conformanceTokens.cssVars['--primary'] === HOST_PRIMARY,
      // 5. transport over HTTP
      'transport: /analyze still 503 with registry injected': analyze503.status === 503 && analyze503.json?.deferred === 'phase1-analyze',
      'transport: /generate → 200 job over HTTP': gen.status === 200 && typeof jobId === 'string' && jobId.length > 0,
      'transport: emitted styles.css carries reference --primary': styles.includes(`--primary: ${REF_PRIMARY};`),
      'transport: page passes the gate, zero literal violations': page.json?.gates?.dsConformance?.pass === true &&
        page.json?.gates?.dsConformance?.colorLiteralViolations?.length === 0,
    }

    const ok = Object.values(checks).every(Boolean)
    console.log('=== Profile-registry self-check ((B)④: resolve · assert · resilient · one-flip · transport) ===')
    for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
    console.log(`  scan    : registered=[${scan.registered.join(',')}] skipped=[${scan.skipped.map((s) => s.name).join(',')}]`)
    console.log(`  resolve : ref:juice-landing --primary=${juice?.profile.cssVars['--primary']} (host=${HOST_PRIMARY})`)
    console.log(`  assert  : mismatch threw=${mismatchThrew} · dup kept a(--primary=${dupKept?.profile.cssVars['--primary']})`)
    console.log(`  resilient: warnings=${scan.warnings.length} · symlink supported=${symlinkSupported} skip-noted=${symlinkSkipNoted}`)
    console.log(`  one-flip: analyze(ref)=${analyzeRef.conformanceTokens.cssVars['--primary']} analyze(none)=${analyzeHost.conformanceTokens.cssVars['--primary']}`)
    console.log(`  transport: /analyze=${analyze503.status} /generate job=${jobId} gate=${page.json?.gates?.dsConformance?.pass ? 'PASS' : 'FAIL'}`)
    console.log(ok ? 'REGISTRY SELF-CHECK: PASS ✅' : 'REGISTRY SELF-CHECK: FAIL ❌')
    process.exitCode = ok ? 0 : 1
  } finally {
    server.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
