/**
 * OBSERVABILITY & CONTROL self-check ((OBS)① engine skeleton) — deterministic, NO cloud/Ollama/browser.
 *
 * Teeth: worker-registry fail-closed (unregistered modelId, model-outside-stage), stage→worker resolution
 * (default / valid override / unreachable-fallback), pipeline structure (mixed deterministic+llm tiers),
 * empty run, HTTP endpoints — AND the CTO false-observability guard: a StageEvent's claimed artifacts must match
 * what the run ACTUALLY produced (port of devpilot verifyActualVsIntended: "reported done without recording what
 * it produced ⇒ fail"). Run: `tsx observability.selfcheck.ts`.
 */
import {
  WORKERS,
  STAGE_BINDINGS,
  DETERMINISTIC,
  resolveWorker,
  listWorkers,
  stageModelOverridesSchema,
  StageEmitter,
  verifyRunObservability,
  type StageId,
  type ModelId,
} from './observability'
import { generatePages } from './generate'
import { createEngineServer } from './transport'
import { putManifest } from './jobs'
import { buildManifestFromPhases } from './analyze'
import { samplePlan, sampleBlueprint } from './analyze/fixtures/sample-phase-outputs'
import type { AnalyzeRequest, BuildManifest } from './contract'
import type { AddressInfo } from 'node:net'

function req0(): AnalyzeRequest {
  return { spec: '관측 검증', designRefMode: 'none', manyPages: true, conformanceProfile: 'default' }
}
const TS = '2026-07-03T00:00:00.000Z' // injected timestamp → byte-reproducible events
const NO_ENV = {} as NodeJS.ProcessEnv
const OLLAMA_ENV = { OLLAMA_BASE_URL: 'http://company-ollama:11434' } as NodeJS.ProcessEnv

async function main() {
  const manifest = buildManifestFromPhases(samplePlan, sampleBlueprint, req0())
  const host = manifest.conformanceTokens

  // ── real deterministic run through the emitter ──────────────────────────────────────────────────────────────
  const emitter = new StageEmitter('run_test', TS, {}, NO_ENV)
  const { producedPaths } = await generatePages(manifest, { emitter, jobId: 'run_test' })
  const events = emitter.collected()
  const obsVerify = verifyRunObservability(events, new Set(producedPaths))

  // ── false-observability tampering (the guard must BITE) ─────────────────────────────────────────────────────
  const phantom = verifyRunObservability(
    [...events, { runId: 'run_test', stageId: 'generate.emitPage', status: 'ok', seq: 999, model: DETERMINISTIC, timestamp: TS, outputSummary: 'lie', artifacts: ['ghost.html'] }],
    new Set(producedPaths),
  )
  const unrecorded = verifyRunObservability(
    [{ runId: 'r', stageId: 'generate.emitShared', status: 'ok', seq: 0, model: DETERMINISTIC, timestamp: TS, outputSummary: 'built nothing?', artifacts: [] }],
    new Set(producedPaths),
  )
  const observerOkEmpty = verifyRunObservability(
    [{ runId: 'r', stageId: 'generate.gate', status: 'ok', seq: 0, model: DETERMINISTIC, timestamp: TS, outputSummary: 'gate read only', artifacts: [] }],
    new Set(producedPaths),
  ) // non-producing stage with no artifact = fine

  // ── empty run (empty sitemap): shared + cushions produced, no page events, observation still honest ───────────
  const emptyManifest: BuildManifest = { manifestId: 'empty', sitemap: [], sharedComponents: [], conformanceTokens: host }
  const emptyEmitter = new StageEmitter('run_empty', TS, {}, NO_ENV)
  const emptyRun = await generatePages(emptyManifest, { emitter: emptyEmitter })
  const emptyEvents = emptyEmitter.collected()
  const emptyVerify = verifyRunObservability(emptyEvents, new Set(emptyRun.producedPaths))

  // ── ★ R-6 false-attribution guard: an override to an AVAILABLE-but-UNINTEGRATED worker (OLLAMA_BASE_URL set,
  //    but the Ollama codegen path unwired) must record the REAL deterministic byte-producer, never qwen ────────
  const r6Emitter = new StageEmitter('run_r6', TS, { 'generate.emitPage': 'qwen3-coder:30b' }, OLLAMA_ENV)
  const r6Run = await generatePages(manifest, { emitter: r6Emitter })
  const r6Events = r6Emitter.collected()
  const r6EmitPage = r6Events.filter((e) => e.stageId === 'generate.emitPage')
  const r6Models = new Set(r6EmitPage.map((e) => e.model))
  const r6FtModels = new Set(r6Run.artifacts.map((a) => a.ftRecord.meta.model))

  // ── HTTP ────────────────────────────────────────────────────────────────────────────────────────────────────
  putManifest(manifest)
  const server = createEngineServer()
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
  const port = (server.address() as AddressInfo).port
  const base = `http://127.0.0.1:${port}`
  const j = async (p: string, init?: RequestInit) => {
    const res = await fetch(base + p, init)
    return { status: res.status, body: (await res.json()) as Record<string, unknown> }
  }
  const structRes = await j('/pipeline/structure')
  const modelsRes = await j('/models')
  const genRes = await j('/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ manifestId: manifest.manifestId }) })
  const jobId = (genRes.body as { jobId?: string }).jobId ?? ''
  const eventsRes = await j(`/runs/${encodeURIComponent(jobId)}/events`)
  const badOverrideRes = await j('/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ manifestId: manifest.manifestId, stageModelOverrides: { 'generate.a11y': 'qwen3-coder:30b' } }) })
  const protoOverrideRes = await j('/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ manifestId: manifest.manifestId, stageModelOverrides: { constructor: 'qwen3-coder:30b' } }) })
  const unknownRunRes = await j('/runs/nope/events')
  await new Promise<void>((r) => server.close(() => r()))

  const eventStageIds = new Set(events.map((e) => e.stageId))
  const structStages = structRes.body.stages as { stageId: string; tier: string; kind: string; order: number }[]

  const checks: Record<string, boolean> = {
    // 1. registry integrity + availability
    'registry: every stage default ∈ availableModels, every model ∈ WORKERS':
      (Object.keys(STAGE_BINDINGS) as StageId[]).every((s) => {
        const b = STAGE_BINDINGS[s]
        return (b.availableModels as ModelId[]).includes(b.default) && (b.availableModels as ModelId[]).every((m) => m in WORKERS)
      }),
    'registry: listWorkers computes availability + integration (deterministic runnable; qwen available≠runnable)':
      (() => { const w = listWorkers(OLLAMA_ENV); const det = w.find((x) => x.modelId === DETERMINISTIC)!; const q = w.find((x) => x.modelId === 'qwen3-coder:30b')!; return w.length === 5 && det.available && det.integrated && det.runnable && q.available === true && q.integrated === false && q.runnable === false })(),
    // 2. stage→worker resolution (integration ≠ availability — the R-6 anti-false-attribution switch)
    'resolve: default worker when no override': resolveWorker('generate.emitPage', undefined, NO_ENV).actual === DETERMINISTIC,
    'resolve: override to UNAVAILABLE worker → deterministic (records byte-producer)':
      resolveWorker('generate.emitPage', 'qwen3-coder:30b', NO_ENV).actual === DETERMINISTIC,
    'resolve: ★ override to AVAILABLE-but-UNINTEGRATED worker → STILL deterministic (env present ≠ code path wired)':
      (() => { const r = resolveWorker('generate.emitPage', 'qwen3-coder:30b', OLLAMA_ENV); return r.requested === 'qwen3-coder:30b' && r.actual === DETERMINISTIC && r.fellBack === true })(),
    'resolve: override to INTEGRATED+available worker → TAKEN (the mechanism flips correctly when (A) wires it)':
      (() => { const r = resolveWorker('generate.emitPage', 'qwen3-coder:30b', OLLAMA_ENV, new Set([DETERMINISTIC, 'qwen3-coder:30b'])); return r.actual === 'qwen3-coder:30b' && r.fellBack === false })(),
    'resolve: integrated-but-UNAVAILABLE worker → deterministic (needs BOTH integration AND config)':
      resolveWorker('generate.emitPage', 'qwen3-coder:30b', NO_ENV, new Set([DETERMINISTIC, 'qwen3-coder:30b'])).actual === DETERMINISTIC,
    'resolve: FAIL-CLOSED on unregistered modelId (throws)':
      (() => { try { resolveWorker('generate.emitPage', 'gpt-4', NO_ENV); return false } catch { return true } })(),
    'resolve: FAIL-CLOSED on model not in THIS stage (throws)':
      (() => { try { resolveWorker('generate.a11y', 'qwen3-coder:30b', NO_ENV); return false } catch { return true } })(),
    // 3. overrides schema (zod fail-closed)
    'overrides: valid parse': stageModelOverridesSchema.safeParse({ 'generate.emitPage': 'qwen3-coder:30b' }).success === true,
    'overrides: FAIL-CLOSED unknown stage': stageModelOverridesSchema.safeParse({ 'nope.stage': 'x' }).success === false,
    'overrides: FAIL-CLOSED model outside stage availableModels': stageModelOverridesSchema.safeParse({ 'generate.a11y': 'qwen3-coder:30b' }).success === false,
    'overrides: FAIL-CLOSED prototype-key stageId (constructor/toString) rejected, NOT crash':
      stageModelOverridesSchema.safeParse({ constructor: 'qwen3-coder:30b' }).success === false && stageModelOverridesSchema.safeParse({ toString: 'x' }).success === false,
    // 4. pipeline structure (mixed tiers)
    'structure: 13 stages, order non-decreasing, mixed deterministic + cloud/llm tiers':
      structStages.length === 13 && structStages.every((s, i) => i === 0 || s.order >= structStages[i - 1].order) &&
      structStages.some((s) => s.tier === 'cloud' && s.kind === 'llm-deferred') && structStages.some((s) => s.kind === 'mixed') && structStages.some((s) => s.tier === 'deterministic'),
    // 5. emitter — honest observation of a real run
    'emit: deterministic run — every StageEvent artifact exists in producedPaths (honest)': obsVerify.pass === true && obsVerify.mismatches.length === 0,
    'emit: all events record model = deterministic worker (no override/env)': events.length > 0 && events.every((e) => e.model === DETERMINISTIC),
    'emit: covers the generate stages (emitShared, cushions, per-page emit/a11y/repair/seo/gate/audit)':
      ['generate.emitShared', 'generate.cushion.sitemap', 'generate.cushion.notfound', 'generate.emitPage', 'generate.a11y', 'generate.repair', 'generate.seo', 'generate.gate', 'generate.audit'].every((s) => eventStageIds.has(s as StageId)),
    'emit: a generate run emits ONLY generate.* stages — no analyze.* (they did not run) [mixed-run honesty]':
      [...eventStageIds].every((s) => !s.startsWith('analyze.')),
    // 6. ★ false-observability guard (the CTO tooth)
    'false-obs: phantom artifact (ghost.html) is CAUGHT': phantom.pass === false && phantom.mismatches.some((m) => m.includes('ghost.html')),
    'false-obs: producing stage reported ok with NO artifact is CAUGHT (verifyActualVsIntended analog)':
      unrecorded.pass === false && unrecorded.mismatches.some((m) => m.includes('generate.emitShared')),
    'false-obs: NON-producing stage with no artifact is fine (no false positive)': observerOkEmpty.pass === true,
    // 6b. ★ R-6 closure — recorded worker == actual byte-producer through a FULL run (override + env, unintegrated)
    'R-6: ★ override qwen + OLLAMA env — every emitPage event records the DETERMINISTIC byte-producer (not qwen)':
      r6Models.size === 1 && r6Models.has(DETERMINISTIC),
    'R-6: ftRecord.meta.model is the deterministic byte-producer (not the requested qwen)':
      r6FtModels.size === 1 && r6FtModels.has(DETERMINISTIC),
    'R-6: the intent is still surfaced — emitPage events carry requested=qwen (fellBack honest, not hidden)':
      r6EmitPage.length > 0 && r6EmitPage.every((e) => e.requested === 'qwen3-coder:30b'),
    // 7. empty run
    'empty run: 0 pages, shared+cushions produced, observation PASSES (no phantom)':
      emptyRun.artifacts.length === 0 && emptyVerify.pass === true && emptyRun.producedPaths.includes('assets/styles.css') && emptyRun.producedPaths.includes('404.html') &&
      emptyEvents.every((e) => !e.pageId),
    // 8. HTTP
    'http: GET /pipeline/structure → 200 stages': structRes.status === 200 && Array.isArray(structRes.body.stages),
    'http: GET /models → 200 workers (5)': modelsRes.status === 200 && (modelsRes.body.workers as unknown[]).length === 5,
    'http: POST /generate → 200 jobId; GET /runs/:id/events → 200 events stream': genRes.status === 200 && !!jobId && eventsRes.status === 200 &&
      Array.isArray((eventsRes.body as { events?: unknown[] }).events) && ((eventsRes.body as { events: unknown[] }).events.length > 0),
    'http: run events include the job.run container event': ((eventsRes.body as { events: { stageId: string }[] }).events).some((e) => e.stageId === 'job.run'),
    'http: POST /generate invalid stageModelOverrides → 400 (fail-closed)': badOverrideRes.status === 400,
    'http: POST /generate prototype-key override (constructor) → 400 (fail-closed, NOT 500)': protoOverrideRes.status === 400,
    'http: GET /runs/unknown/events → 404': unknownRunRes.status === 404,
  }

  const ok = Object.values(checks).every(Boolean)
  console.log('=== Observability & control self-check ((OBS)①: registry · resolution · structure · false-observability · HTTP) ===')
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
  console.log(`  run     : events=${events.length} obsVerify=${obsVerify.pass ? 'PASS' : 'FAIL'} producedPaths=${producedPaths.length}`)
  console.log(`  guard   : phantom=${phantom.pass ? 'MISS' : 'CAUGHT'} unrecorded=${unrecorded.pass ? 'MISS' : 'CAUGHT'} empty=${emptyVerify.pass ? 'PASS' : 'FAIL'}`)
  console.log(ok ? 'OBSERVABILITY SELF-CHECK: PASS ✅' : 'OBSERVABILITY SELF-CHECK: FAIL ❌')
  process.exitCode = ok ? 0 : 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
