/**
 * Transport self-check — starts the real node:http engine server on an ephemeral port and exercises the
 * four DevPilotTransport endpoints over HTTP (+ negatives), with NO cloud/Ollama.
 *   seed a deterministic BuildManifest → POST /generate → GET /jobs/:id → GET /jobs/:id/pages/:pid.
 *   /analyze is cloud-gated → asserts an honest 503. Proves the host↔engine wire contract end-to-end.
 * Run: `tsx transport.selfcheck.ts`.
 */
import type { AddressInfo } from 'node:net'
import { createEngineServer } from './transport'
import { putManifest } from './jobs'
import { buildManifestFromPhases } from './analyze'
import { samplePlan, sampleBlueprint } from './analyze/fixtures/sample-phase-outputs'
import type { AnalyzeRequest } from './contract'

async function main() {
  const req: AnalyzeRequest = {
    spec: '제철 착즙 주스 정기구독 서비스 랜딩(홈/소개/문의)',
    designRefMode: 'none',
    manyPages: true,
    conformanceProfile: 'default',
  }
  // Seed the analyze→generate seam with a deterministic manifest (stands in for the cloud analyze step).
  const manifest = buildManifestFromPhases(samplePlan, sampleBlueprint, req)
  putManifest(manifest, req)

  const server = createEngineServer()
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = (server.address() as AddressInfo).port
  const base = `http://127.0.0.1:${port}`

  const call = async (
    method: string,
    path: string,
    body?: unknown,
  ): Promise<{ status: number; json: any }> => {
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
    const health = await call('GET', '/health')
    const analyze503 = await call('POST', '/analyze', req)
    const gen = await call('POST', '/generate', { manifestId: manifest.manifestId })
    const jobId: string = gen.json?.jobId
    const job = await call('GET', `/jobs/${jobId}`)
    const page = await call('GET', `/jobs/${jobId}/pages/page_home`)

    // negatives (teeth)
    const badMethod = await call('GET', '/analyze')
    const noManifest = await call('POST', '/generate', { manifestId: 'does-not-exist' })
    const noJob = await call('GET', '/jobs/nope')
    const noPage = await call('GET', `/jobs/${jobId}/pages/page_missing`)
    const badBody = await call('POST', '/generate', {})

    const checks: Record<string, boolean> = {
      'GET /health → 200 ok': health.status === 200 && health.json?.ok === true,
      'POST /analyze → 503 deferred (cloud-gated)': analyze503.status === 503 && analyze503.json?.deferred === 'phase1-analyze',
      'POST /generate → 200 { jobId }': gen.status === 200 && typeof jobId === 'string' && jobId.length > 0,
      'GET /jobs/:id → 200 done 3/3': job.status === 200 && job.json?.phase === 'done' && job.json?.total === 3 && job.json?.completed === 3,
      'GET /pages/page_home → 200 files + gate PASS': page.status === 200 && Array.isArray(page.json?.files) && page.json.files.length > 0 && page.json?.gates?.dsConformance?.pass === true,
      'PageArtifact.ftRecord.meta.jobId wired': page.json?.ftRecord?.meta?.jobId === jobId,
      'wrong method GET /analyze → 405': badMethod.status === 405,
      'unknown manifest → 404': noManifest.status === 404,
      'unknown job → 404': noJob.status === 404,
      'unknown page → 404': noPage.status === 404,
      'missing manifestId → 400': badBody.status === 400,
    }

    const ok = Object.values(checks).every(Boolean)
    console.log('=== Transport self-check (host↔engine wire contract, no cloud/Ollama) ===')
    for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? '✅' : '❌'} ${k}`)
    console.log(`  server : ${base} · seeded manifest=${manifest.manifestId}`)
    console.log(`  job    : ${jobId} · phase=${job.json?.phase} ${job.json?.completed}/${job.json?.total}`)
    console.log(`  page   : page_home files=${page.json?.files?.length} gate=${page.json?.gates?.dsConformance?.pass ? 'PASS' : 'FAIL'} gateScore=${page.json?.ftRecord?.quality?.gateScore}`)
    console.log(ok ? 'TRANSPORT SELF-CHECK: PASS ✅' : 'TRANSPORT SELF-CHECK: FAIL ❌')
    process.exitCode = ok ? 0 : 1
  } finally {
    server.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
