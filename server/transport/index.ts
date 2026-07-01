/**
 * TRANSPORT — HTTP API server (the SERVER side of the DevPilotTransport seam).
 *
 * STATUS: GREEN-FIELD (PHASE-MAP). Neither source has an HTTP server — devpilot-v2 uses Electron IPC +
 *   MCP stdio; n8n uses its own webhook engine. This layer is built new.
 *
 * The host SPA's `HttpDevPilotTransport` (already shipped) calls these endpoints via
 *   `VITE_DEVPILOT_API_BASE_URL`. Endpoints mirror the four DevPilotTransport methods:
 *     POST /analyze           → BuildManifest
 *     POST /generate          → { jobId }
 *     GET  /jobs/:jobId       → JobStatus
 *     GET  /jobs/:jobId/pages/:pageId → PageArtifact
 *
 * HTTP framework: TBD (express vs fastify — P/L branch precedent = express). Scaffold uses the
 *   built-in node:http so no framework is committed before STEP 3.
 * Auth: deferred to the engine/server side (host attaches no auth header — see http-devpilot-transport).
 *
 * TODO(STEP 3): wire routes → analyze()/generate()/getJob(); pick framework; add health check.
 */
import { createServer } from 'node:http'

export function createEngineServer() {
  return createServer((_req, res) => {
    res.writeHead(501, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: 'SCAFFOLD: DevPilot engine transport not yet implemented (STEP 3).' }))
  })
}

// Intentionally not started here — entrypoint/bootstrap is a STEP-3 concern.
