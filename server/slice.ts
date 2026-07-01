/**
 * VERTICAL SLICE (STEP 3, first proof) — fixture BuildManifest → static emitter → conformance gate.
 *
 * Proves the deterministic spine end-to-end without an LLM: "회사용 DevPilot이 실제로 페이지를 뽑는다."
 * Run: `pnpm slice` (from server/). Writes a real static site to server/runs/slice/ (gitignored).
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { getEmitter } from './emitters'
import { runGate } from './conformance'
import { threePageManifest } from './fixtures/three-page-manifest'

async function main() {
  const manifest = threePageManifest
  const emitter = getEmitter('static')
  const outDir = join(process.cwd(), 'runs', 'slice')
  rmSync(outDir, { recursive: true, force: true })

  const files = [...(await emitter.emitShared(manifest))]
  for (const page of manifest.sitemap) files.push(...(await emitter.emitPage(manifest, page)))

  for (const f of files) {
    const dest = join(outDir, f.path)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, f.content, 'utf8')
  }

  const gate = await runGate(files)
  const ds = gate.dsConformance

  console.log('=== DevPilot static vertical slice ===')
  console.log(`manifest : ${manifest.manifestId} · pages: ${manifest.sitemap.length} · target: ${emitter.target}`)
  console.log(`emitted  : ${files.length} files → ${outDir}`)
  for (const f of files) console.log(`   - ${f.path} (${f.content.length}B)`)
  console.log('--- conformance gate (reversal principle) ---')
  console.log(`   colorLiteralViolations: ${ds.colorLiteralViolations.length}`)
  console.log(`   tokenViolations       : ${ds.tokenViolations.length}`)
  console.log(`   namingViolations      : ${ds.namingViolations.length}`)
  for (const v of [...ds.colorLiteralViolations, ...ds.tokenViolations, ...ds.namingViolations])
    console.log(`   ✗ ${v}`)
  console.log(`GATE: ${ds.pass ? 'PASS ✅' : 'FAIL ❌'}`)
  process.exitCode = ds.pass ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
