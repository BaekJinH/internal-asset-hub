/**
 * VERTICAL SLICE (STEP 3, first proof) — fixture BuildManifest → static emitter → conformance gate.
 *
 * Proves the deterministic spine end-to-end without an LLM: "회사용 DevPilot이 실제로 페이지를 뽑는다."
 * Run: `pnpm slice` (from server/). Writes a real static site to server/runs/slice/ (gitignored).
 */
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { getEmitter } from './emitters'
import { dynamicFinalRepair } from './emitters/dynamic-final-repair'
import { runGate } from './conformance'
import { runQualityAudit } from './conformance/quality-audit'
import { threePageManifest } from './fixtures/three-page-manifest'

async function main() {
  const manifest = threePageManifest
  const emitter = getEmitter('static')
  const outDir = join(process.cwd(), 'runs', 'slice')
  rmSync(outDir, { recursive: true, force: true })

  const emitted = [...(await emitter.emitShared(manifest))]
  for (const page of manifest.sitemap) emitted.push(...(await emitter.emitPage(manifest, page)))
  // Phase-2 pipeline: emit → Dynamic Final Repair (No-Hardcoded) → gate
  const { files, report } = dynamicFinalRepair(emitted, manifest)

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
  console.log(`repair   : unresolved=${report.unresolvedRoutes} imagesReplaced=${report.imagesReplaced} bridged=${report.bridgedClasses}`)
  for (const f of files) console.log(`   - ${f.path} (${f.content.length}B)`)
  console.log('--- conformance gate (reversal principle) ---')
  console.log(`   colorLiteralViolations: ${ds.colorLiteralViolations.length}`)
  console.log(`   tokenViolations       : ${ds.tokenViolations.length}`)
  console.log(`   namingViolations      : ${ds.namingViolations.length}`)
  for (const v of [...ds.colorLiteralViolations, ...ds.tokenViolations, ...ds.namingViolations])
    console.log(`   ✗ ${v}`)
  console.log(`GATE: ${ds.pass ? 'PASS ✅' : 'FAIL ❌'}`)

  // ADVISORY: S19 정적 품질 audit (게이트와 별개 — 하드 pass/fail은 dsConformance).
  const quality = runQualityAudit(files, manifest)
  console.log('--- quality audit (S19, advisory) ---')
  console.log(`   qualityScore: ${quality.qualityScore}/100 · issues=${quality.issues.length} warnings=${quality.warnings.length}`)
  for (const i of quality.issues) console.log(`   ✗ issue: ${i}`)
  for (const w of quality.warnings.slice(0, 8)) console.log(`   · warn: ${w}`)
  if (quality.warnings.length > 8) console.log(`   … +${quality.warnings.length - 8} more warnings`)

  // 정적 스켈레톤은 의도적으로 희소 → 밀도 warning은 정상(Ollama 본문 보강 전). 하드 게이트는 순응만.
  process.exitCode = ds.pass ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
