/**
 * Quality audit self-check — S19 품질 검사 이식분이 TEETH를 갖는지 증명.
 *   dense/clean → qualityScore 100 (0 issues/warnings)   ·   dirty → 저점수 + 기대 warning 열거
 *   empty(HTML 없음) → issue(−25)   ·   floor → 다수 warning 시 max(0) 바닥 준수.
 * Run: `tsx quality.selfcheck.ts`.
 */
import { runQualityAudit } from './conformance/quality-audit'
import type { GeneratedFile } from './contract'

// ── DENSE/CLEAN: 모든 검사 통과 → 100점 ────────────────────────────────────────
const denseStyles: GeneratedFile = {
  path: 'assets/styles.css',
  content:
    ':root{--primary:79 70 229;}\n' +
    '.container{max-width:72rem;margin-inline:auto;}\n' +
    '.section{padding-block:3rem;}\n' +
    '.card{background:rgb(var(--card));border-radius:.75rem;}\n',
}
const denseApp: GeneratedFile = { path: 'assets/app.js', content: "console.log('ready');" }
const denseHtml: GeneratedFile = {
  path: 'index.html',
  content: `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>주스풀 구독 서비스</title>
    <link rel="stylesheet" href="assets/styles.css" />
  </head>
  <body>
    <main class="container">
      <section class="section">
        <div class="card">
          <h2>신선한 착즙 정기 배송</h2>
          <p>주스풀은 매일 아침 신선하게 착즙한 제철 과일 주스를 정기적으로 배송하는 구독
          서비스입니다. 우리는 농장에서 직접 수확한 과일만을 사용하며 방부제와 첨가당을 전혀
          넣지 않습니다. 착즙 후 여섯 시간 이내에 저온 상태로 문 앞까지 배송합니다.</p>
        </div>
      </section>
      <section class="section">
        <div class="card">
          <h2>유연한 구독 관리</h2>
          <p>구독자는 주간 또는 격주 단위로 배송 주기를 자유롭게 선택할 수 있고 언제든지
          일시정지하거나 해지할 수 있습니다. 첫 구독 시 전용 텀블러와 계절별 레시피 카드를
          함께 제공하며, 가족 단위 구성을 위한 대용량 옵션도 준비되어 있습니다.</p>
        </div>
      </section>
      <section class="section">
        <div class="card">
          <h2>검증된 고객 만족</h2>
          <p>지금까지 만 명이 넘는 고객이 주스풀과 함께 건강한 아침 습관을 만들었으며 평균
          만족도는 다섯 점 만점에 사 점 팔 점을 기록했습니다. 재구독률은 여든 퍼센트를 넘어섰고
          자세한 후기는 아래 고객 이야기에서 직접 확인하실 수 있습니다.</p>
        </div>
      </section>
    </main>
    <script src="assets/app.js"></script>
  </body>
</html>`,
}
const dense = runQualityAudit([denseStyles, denseApp, denseHtml])

// ── DIRTY: 여러 결함이 한 페이지에 → 다수 warning ─────────────────────────────
function dirtyPage(name: string): GeneratedFile {
  return {
    path: name,
    content: `<html><head><link rel="stylesheet" href="styles.css"></head><body>
<div class="mystery-widget">
  <img src="/images/logo.png" alt="logo">
  <h1>Get Started</h1>
  <p>lorem ipsum</p>
</div>
</body></html>`,
  }
}
const dirty = runQualityAudit([dirtyPage('page.html')]) // styles.css/app.js 파일 없음 → 약함 warning 포함

// ── EMPTY: HTML 페이지 0개 → issue(−25) ──────────────────────────────────────
const empty = runQualityAudit([{ path: 'assets/styles.css', content: '.container{}' }])

// ── FLOOR: warning 폭주 시 max(0) 바닥 ───────────────────────────────────────
const floor = runQualityAudit([1, 2, 3, 4, 5].map((i) => dirtyPage(`p${i}.html`)))

const checks: Record<string, boolean> = {
  'dense → score 100': dense.qualityScore === 100,
  'dense → 0 issues': dense.issues.length === 0,
  'dense → 0 warnings': dense.warnings.length === 0,
  'dirty → score < 80': dirty.qualityScore < 80,
  'dirty → DOCTYPE 누락 warning': dirty.warnings.some((w) => /DOCTYPE 누락/.test(w)),
  'dirty → main 누락 warning': dirty.warnings.some((w) => /main 태그 누락/.test(w)),
  'dirty → placeholder warning': dirty.warnings.some((w) => /placeholder/.test(w)),
  'dirty → 로컬 이미지 warning': dirty.warnings.some((w) => /로컬 이미지/.test(w)),
  'dirty → 미정의 class warning': dirty.warnings.some((w) => /미정의 class/.test(w)),
  'dirty → CSS/JS 경로 warning': dirty.warnings.some((w) => /assets\/styles\.css가 아닐/.test(w)),
  'scoring formula 1:1 (max(0,100−i·25−w·3))':
    dirty.qualityScore === Math.max(0, 100 - dirty.issues.length * 25 - dirty.warnings.length * 3),
  'empty → HTML 없음 issue(−25)': empty.issues.some((i) => /HTML 페이지가 없/.test(i)) && empty.htmlFiles.length === 0,
  'floor → max(0) 바닥 준수': floor.qualityScore === 0,
}

const ok = Object.values(checks).every(Boolean)

console.log('=== Quality audit self-check (S19 품질 검사 이식) ===')
for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
console.log(`  dense : score=${dense.qualityScore} issues=${dense.issues.length} warnings=${dense.warnings.length}`)
console.log(`  dirty : score=${dirty.qualityScore} issues=${dirty.issues.length} warnings=${dirty.warnings.length}`)
console.log(`  empty : score=${empty.qualityScore} issues=${empty.issues.length} (${empty.issues.join(' | ')})`)
console.log(`  floor : score=${floor.qualityScore} warnings=${floor.warnings.length}`)
console.log(ok ? 'QUALITY SELF-CHECK: PASS ✅' : 'QUALITY SELF-CHECK: FAIL ❌')
process.exitCode = ok ? 0 : 1
