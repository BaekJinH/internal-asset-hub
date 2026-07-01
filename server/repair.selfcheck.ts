/**
 * Dynamic Final Repair self-check — 하드코딩 링크/이미지가 실제로 고쳐지는지 증명.
 * dirty HTML → dynamicFinalRepair → 변환 검증 + post-repair conformance 게이트 PASS. Run: `tsx repair.selfcheck.ts`.
 */
import { dynamicFinalRepair } from './emitters/dynamic-final-repair'
import { runGate } from './conformance'
import { threePageManifest } from './fixtures/three-page-manifest'
import type { GeneratedFile } from './contract'

async function main() {
  const dirty: GeneratedFile[] = [
    { path: 'assets/styles.css', content: ':root{--primary:79 70 229;}\n.btn{background:rgb(var(--primary));}' },
    {
      path: 'index.html',
      content: `<!DOCTYPE html><html><head><link rel="stylesheet" href="./styles.css"></head><body>
<img src="/images/logo.png" alt="Brand Logo">
<img src="/media/hero.jpg" alt="Hero">
<a href="/about">소개</a>
<a href="/nonexistent">없음</a>
<a href="https://external.com">외부</a>
<div class="custom-widget">x</div>
</body></html>`,
    },
  ]

  const { files, report } = dynamicFinalRepair(dirty, threePageManifest)
  const html = files.find((f) => f.path === 'index.html')!.content
  const css = files.find((f) => f.path === 'assets/styles.css')!.content

  const checks: Record<string, boolean> = {
    'asset path → assets/styles.css': /href="assets\/styles\.css"/.test(html) && !/href="\.\/styles\.css"/.test(html),
    'app.js injected': /src="assets\/app\.js"/.test(html),
    'logo img → text-logo (하드코딩 이미지 제거)': /generated-text-logo/.test(html) && !/\/images\/logo\.png/.test(html),
    'media img → fallback': /generated-media-fallback/.test(html),
    '/about → about.html (route alias)': /href="about\.html"/.test(html),
    '/nonexistent → href="#" unresolved': /href="#" data-unresolved-route="\/nonexistent"/.test(html),
    'external link 보존': /href="https:\/\/external\.com"/.test(html),
    'custom-widget bridged (미정의 class)': css.includes('.custom-widget'),
  }

  const gate = (await runGate(files)).dsConformance
  const allChecks = Object.values(checks).every(Boolean)
  const ok = allChecks && gate.pass

  console.log('=== Dynamic Final Repair self-check ===')
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
  console.log(`  report: unresolved=${report.unresolvedRoutes} imagesReplaced=${report.imagesReplaced} bridged=${report.bridgedClasses}`)
  console.log(`  post-repair gate: ${gate.pass ? 'PASS' : 'FAIL'} (colorLiteral=${gate.colorLiteralViolations.length}, token=${gate.tokenViolations.length})`)
  console.log(ok ? 'REPAIR SELF-CHECK: PASS ✅' : 'REPAIR SELF-CHECK: FAIL ❌')
  process.exitCode = ok ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
