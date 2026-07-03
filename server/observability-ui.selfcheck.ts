/**
 * OBSERVABILITY UI self-check ((OBS)② dashboard) — deterministic, NO cloud/Ollama/browser.
 *
 * The honesty-critical bits (integration badges, dropdown labels) are SERVER-RENDERED, so this checks them
 * WITHOUT a DOM: renderDashboard() output must show an unintegrated worker as "미통합", the run report data must
 * carry the ACTUAL worker + the requested one when they differ (no UI-layer false observability), plus the
 * dashboard is served over HTTP and renders mixed tiers / empty runs honestly.
 * Run: `tsx observability-ui.selfcheck.ts`.
 */
import {
  renderDashboard,
  workerBadgeHtml,
  workerOptionLabel,
  pipelineStructure,
  listWorkers,
  DETERMINISTIC,
} from './observability'
import { createEngineServer } from './transport'
import { putManifest } from './jobs'
import { buildManifestFromPhases } from './analyze'
import { samplePlan, sampleBlueprint } from './analyze/fixtures/sample-phase-outputs'
import type { AnalyzeRequest, BuildManifest } from './contract'
import type { AddressInfo } from 'node:net'

function req0(): AnalyzeRequest {
  return { spec: '관측 UI 검증', designRefMode: 'none', manyPages: true, conformanceProfile: 'default' }
}
const OLLAMA_ENV = { OLLAMA_BASE_URL: 'http://company-ollama:11434' } as NodeJS.ProcessEnv

async function main() {
  const manifest: BuildManifest = { ...buildManifestFromPhases(samplePlan, sampleBlueprint, req0()), manifestId: 'ui-demo' }

  // SSR with OLLAMA env → qwen is AVAILABLE but NOT integrated (the honesty-critical case).
  const workers = listWorkers(OLLAMA_ENV)
  const html = renderDashboard({ structure: pipelineStructure(), workers, demoManifestId: 'demo' })
  const qwen = workers.find((w) => w.modelId === 'qwen3-coder:30b')!
  const det = workers.find((w) => w.modelId === DETERMINISTIC)!

  // ── HTTP: dashboard served + a run whose emitPage override degrades (unintegrated → deterministic) ───────────
  putManifest(manifest)
  const server = createEngineServer()
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
  const port = (server.address() as AddressInfo).port
  const base = `http://127.0.0.1:${port}`
  const dashRes = await fetch(base + '/dashboard')
  const dashCT = dashRes.headers.get('content-type') ?? ''
  const dashBody = await dashRes.text()
  const gen = await (await fetch(base + '/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ manifestId: 'ui-demo', stageModelOverrides: { 'generate.emitPage': 'qwen3-coder:30b' } }) })).json() as { jobId?: string }
  const evBody = await (await fetch(base + `/runs/${encodeURIComponent(gen.jobId ?? '')}/events`)).json() as { events: { stageId: string; model: string; requested?: string; pageId?: string }[] }
  await new Promise<void>((r) => server.close(() => r()))

  const emitPageEvents = evBody.events.filter((e) => e.stageId === 'generate.emitPage')

  const checks: Record<string, boolean> = {
    // 1. dashboard served over HTTP
    'ui: GET /dashboard → 200 text/html with the 4 panels':
      dashRes.status === 200 && dashCT.includes('text/html') &&
      dashBody.includes('파이프라인 구조') && dashBody.includes('워커 레지스트리') && dashBody.includes('실행 리포트') && dashBody.includes('DevPilot 관측'),
    // 2. ★ registry panel SSRs HONEST integration state
    'ui: ★ registry panel — qwen shown 미통합 (available≠integrated), deterministic shown integrated':
      html.includes('qwen3-coder:30b') && workerBadgeHtml(qwen).includes('미통합') && workerBadgeHtml(det).includes('integrated') &&
      /qwen3-coder:30b[\s\S]*?미통합/.test(html),
    // 3. ★ dropdown option honesty (the CTO requirement: a selectable unintegrated worker is labelled as such)
    'ui: ★ emitPage dropdown labels qwen as 미통합 (deterministic 실행)':
      workerOptionLabel(qwen).includes('미통합') && workerOptionLabel(det) === DETERMINISTIC &&
      html.includes('data-stage="generate.emitPage"') && /<option[^>]*qwen3-coder:30b[^>]*>[^<]*미통합/.test(html),
    // 4. pure honesty helpers
    'ui: workerBadgeHtml/workerOptionLabel — unintegrated=미통합, integrated=clean':
      workerBadgeHtml(qwen).includes('미통합') && !workerBadgeHtml(det).includes('미통합') && workerOptionLabel(qwen).includes('deterministic'),
    // 5. mixed tiers rendered
    'ui: structure panel renders mixed tiers (deterministic + cloud badges)':
      html.includes('badge tier det') && html.includes('badge tier cloud') && html.includes('generate.emitShared') && html.includes('analyze.plan'),
    // 5b. ★ cross-panel honesty (review polish): structure panel flags an unintegrated DEFAULT worker (analyze.* →
    // gemini) as 미통합, so a viewer of panel① alone is not misled; deterministic-default stages are NOT flagged.
    'ui: structure panel cross-references integration — 2 gemini-default stages flagged 미통합':
      (html.match(/이 스테이지의 default 워커/g) || []).length === 2,
    'ui: warn-bar dedupes fellBack stageIds (indexOf guard, no per-page repeat)': html.includes('indexOf(e.stageId)'),
    // 6. ★ run report DATA honesty — the override degrades and the report carries actual + requested (no UI lie)
    'ui-data: ★ 미통합 override run — report shows ACTUAL=deterministic, requested=qwen (truth surfaced)':
      emitPageEvents.length > 0 && emitPageEvents.every((e) => e.model === DETERMINISTIC && e.requested === 'qwen3-coder:30b'),
    // 7. the client renderer surfaces the fellBack (the HTML carries the warn-bar + requested-badge logic)
    'ui: report renderer surfaces fellBack (requested badge + warn bar in page)':
      dashBody.includes('요청:') && dashBody.includes('실제 생산자') && dashBody.includes('warnbar'),
    // 8. no false "live" cushion — SSE is honestly noted as (A)-paired, not faked
    'ui: SSE live streaming honestly deferred to (A), not faked':
      dashBody.includes('(A) 짝') && dashBody.includes('완료 후') && !dashBody.includes('EventSource'),
  }

  const ok = Object.values(checks).every(Boolean)
  console.log('=== Observability UI self-check ((OBS)②: SSR honesty · dropdown · report data · HTTP) ===')
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
  console.log(`  render  : html=${html.length}b · qwen integrated=${qwen.integrated} available=${qwen.available} · det integrated=${det.integrated}`)
  console.log(`  report  : emitPage events=${emitPageEvents.length} actual=${emitPageEvents[0]?.model} requested=${emitPageEvents[0]?.requested}`)
  console.log(ok ? 'OBSERVABILITY-UI SELF-CHECK: PASS ✅' : 'OBSERVABILITY-UI SELF-CHECK: FAIL ❌')
  process.exitCode = ok ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
