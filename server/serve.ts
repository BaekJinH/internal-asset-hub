/**
 * SERVE — bootstrap entrypoint for the DevPilot engine HTTP server.
 *
 * `transport/index.ts` intentionally exports `createEngineServer()` WITHOUT listening
 * ("a bootstrap entrypoint (port/host, graceful shutdown) is a later concern"). This IS that
 * bootstrap — additive, no transport change.
 *
 * LIVE NOW (deterministic, no LLM): `/health`, `/generate`, `/jobs/*` (static emit→repair→gate→audit).
 * CLOUD-GATED: `/analyze` returns an honest 503 until a GEMINI key lands (stub→real = one-line flip).
 * REGISTRY: no reference-root is bootstrapped here (populating references-root = production concern), so the
 *   DEFAULT EMPTY registry applies — every `conformanceProfile` resolves to the host default. When a references
 *   root is provisioned, register it here (or inject via `createEngineServer({ registry })`).
 *
 * Config (repo-relative, NO secrets): `PORT` (default 8787), `HOST` (default 127.0.0.1 — localhost only).
 * Run: `pnpm serve`  (or `tsx serve.ts`).
 */
import { createEngineServer } from './transport'

const PORT = Number(process.env.PORT ?? 8787)
const HOST = process.env.HOST ?? '127.0.0.1'

const server = createEngineServer()

server.listen(PORT, HOST, () => {
  const base = `http://${HOST}:${PORT}`
  console.log(`▶ DevPilot engine listening on ${base}`)
  console.log(`  GET  ${base}/health                    → { ok: true }`)
  console.log(`  POST ${base}/analyze                   → BuildManifest  (503 until GEMINI key)`)
  console.log(`  POST ${base}/generate  {manifestId}    → { jobId }  (deterministic, live)`)
  console.log(`  GET  ${base}/jobs/:jobId               → JobStatus`)
  console.log(`  GET  ${base}/jobs/:jobId/pages/:pageId → PageArtifact`)
  console.log(`  host SPA seam: set VITE_DEVPILOT_API_BASE_URL=${base}`)
})

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') console.error(`✗ port ${PORT} already in use — set PORT=<free port> and retry.`)
  else console.error('✗ server error:', err instanceof Error ? err.message : err)
  process.exit(1)
})

function shutdown(signal: string): void {
  console.log(`\n${signal} received — closing engine server…`)
  server.close(() => {
    console.log('server closed.')
    process.exit(0)
  })
  setTimeout(() => process.exit(0), 3000).unref() // force-exit if a keep-alive connection lingers
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
