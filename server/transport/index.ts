/**
 * TRANSPORT — HTTP API server (the SERVER side of the DevPilotTransport seam).
 *
 * The host SPA's shipped `HttpDevPilotTransport` calls these endpoints (base = `VITE_DEVPILOT_API_BASE_URL`):
 *     POST /analyze                    → BuildManifest        (body = AnalyzeRequest)
 *     POST /generate                   → { jobId }            (body = { manifestId, pageIds? })
 *     GET  /jobs/:jobId                → JobStatus
 *     GET  /jobs/:jobId/pages/:pageId  → PageArtifact
 *   plus GET / , GET /health           → { ok: true }
 *
 * WIRING: /generate + /jobs are DETERMINISTIC and live NOW (static emit→repair→gate→audit via ../generate
 *   + ../jobs). /analyze calls the real Phase-1 analyze(), which is cloud-gated → honest 503 until a
 *   GEMINI key lands (stub→real is a one-line flip, no seam change). ((B)④) A ProfileRegistry is injected
 *   and passed to analyze(): it resolves `conformanceProfile` → reference project DETERMINISTICALLY now, so
 *   the reference is threaded the instant the cloud flips on. Auth/CORS = engine-side (host sends none).
 *
 * Framework: built-in node:http (no framework committed pre-GA; P/L precedent = express, revisit at GA).
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { AnalyzeRequest } from '../contract'
import { analyze } from '../analyze'
import { defaultProfileRegistry, type ProfileRegistry } from '../analyze/profile-registry'
import { createJob, getJob, getPage } from '../jobs'

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  return raw ? JSON.parse(raw) : {}
}

/**
 * `registry` ((B)④) maps `AnalyzeRequest.conformanceProfile` → a reference project whose tokens dominate
 * conformance. It is injectable (a bootstrap registers references from a configured root); the default is the
 * empty module registry, so an un-bootstrapped server behaves exactly as before (every profile → host default).
 */
export function createEngineServer(opts: { registry?: ProfileRegistry } = {}) {
  const registry = opts.registry ?? defaultProfileRegistry
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const method = req.method ?? 'GET'
      const path = (new URL(req.url ?? '/', 'http://localhost').pathname.replace(/\/+$/, '') || '/')

      // health
      if (method === 'GET' && (path === '/' || path === '/health'))
        return sendJson(res, 200, { ok: true, service: 'devpilot-engine' })

      // POST /analyze → Phase-1 (cloud-gated: 503 until GEMINI key wired)
      if (path === '/analyze') {
        if (method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' })
        let body: unknown
        try {
          body = await readJsonBody(req)
        } catch {
          return sendJson(res, 400, { error: 'invalid JSON body' })
        }
        try {
          return sendJson(res, 200, await analyze(body as AnalyzeRequest, registry))
        } catch (err) {
          return sendJson(res, 503, {
            error: err instanceof Error ? err.message : String(err),
            deferred: 'phase1-analyze',
          })
        }
      }

      // POST /generate → deterministic job
      if (path === '/generate') {
        if (method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' })
        let body: { manifestId?: unknown; pageIds?: unknown }
        try {
          body = (await readJsonBody(req)) as typeof body
        } catch {
          return sendJson(res, 400, { error: 'invalid JSON body' })
        }
        if (typeof body.manifestId !== 'string')
          return sendJson(res, 400, { error: 'manifestId (string) required' })
        const pageIds = Array.isArray(body.pageIds) ? (body.pageIds as string[]) : undefined
        const created = await createJob(body.manifestId, pageIds)
        if (!created) return sendJson(res, 404, { error: `manifest not found: ${body.manifestId}` })
        return sendJson(res, 200, created)
      }

      // GET /jobs/:jobId/pages/:pageId (match before the less-specific /jobs/:jobId)
      const pageMatch = path.match(/^\/jobs\/([^/]+)\/pages\/([^/]+)$/)
      if (pageMatch) {
        if (method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' })
        const artifact = getPage(decodeURIComponent(pageMatch[1]), decodeURIComponent(pageMatch[2]))
        return artifact ? sendJson(res, 200, artifact) : sendJson(res, 404, { error: 'page not found' })
      }

      // GET /jobs/:jobId
      const jobMatch = path.match(/^\/jobs\/([^/]+)$/)
      if (jobMatch) {
        if (method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' })
        const status = getJob(decodeURIComponent(jobMatch[1]))
        return status ? sendJson(res, 200, status) : sendJson(res, 404, { error: 'job not found' })
      }

      return sendJson(res, 404, { error: `no route: ${method} ${path}` })
    } catch (err) {
      sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) })
    }
  })
}

// Intentionally not started here — a bootstrap entrypoint (port/host, graceful shutdown) is a later concern.
