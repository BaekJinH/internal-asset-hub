/**
 * Gate self-check — proves the conformance gate has TEETH (no false pass / no false positive).
 * Clean token-based output must PASS; raw-hex + default-palette output must FAIL. Run: `tsx gate.selfcheck.ts`.
 */
import { runGate } from './conformance'
import type { GeneratedFile } from './contract'

async function main() {
  const clean: GeneratedFile[] = [
    { path: 'ok.css', content: ':root{--primary:79 70 229;}\n.btn{background:rgb(var(--primary));border:1px solid rgb(var(--border));}' },
  ]
  const dirty: GeneratedFile[] = [
    { path: 'bad.html', content: '<div style="color:#ff0000" class="bg-slate-500 text-gray-700">x</div>\n.x{background:rgb(12,34,56)}' },
  ]

  const g1 = (await runGate(clean)).dsConformance
  const g2 = (await runGate(dirty)).dsConformance

  const okPass = g1.pass === true
  const badCaught =
    g2.pass === false && g2.colorLiteralViolations.length > 0 && g2.tokenViolations.length > 0

  console.log('clean → pass:', g1.pass, '(expect true, 0 violations)')
  console.log('dirty → pass:', g2.pass, '(expect false)')
  console.log('  colorLiteral:', g2.colorLiteralViolations)
  console.log('  token       :', g2.tokenViolations)
  const ok = okPass && badCaught
  console.log(ok ? 'GATE SELF-CHECK: PASS ✅ (no false pass, no false positive)' : 'GATE SELF-CHECK: FAIL ❌')
  process.exitCode = ok ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
