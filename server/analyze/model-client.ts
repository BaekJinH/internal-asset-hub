/**
 * MODEL CLIENT SEAM — the cloud-NL boundary for Phase-1 analyze (decoupled from devpilot's ModelRouter).
 *
 * devpilot-v2@d262aa3 seam (measured): ModelRouter.route(phase, role) picks a client, then the CALLER
 *   invokes `client.generateText(system, user)`. Router does NOT proxy the completion. We reproduce just
 *   the caller-facing surface — a minimal `ModelClient` — so the analyze orchestrator is model-agnostic.
 *
 * DEFERRED (same gate as Phase-2 Ollama): the concrete cloud call needs (1) `GEMINI_API_KEY` and
 *   (2) the `@google/generative-ai` dep, which is intentionally NOT yet added (keeps the engine dep-lean and
 *   typecheck green with no missing module). Until then `createModelClient()` returns a client whose
 *   `available=false` and whose `generateText` throws a clear deferred error. The deterministic mapper
 *   (manifest-mapper.ts) is fully exercised NOW via analyze.selfcheck.ts without any cloud call.
 *
 * WIRING RECIPE (faithful to devpilot-v2 src/models/gemini-client.ts@d262aa3 — implement at cloud-key milestone):
 *   import { GoogleGenerativeAI } from '@google/generative-ai'   // add dep: @google/generative-ai ^0.21
 *   const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
 *   const model = ai.getGenerativeModel({ model: process.env.GEMINI_MODEL_ID || 'gemini-3.5-flash',
 *                                         systemInstruction: system })
 *   const res = await model.generateContent(user)              // devpilot passes no generationConfig
 *   return { text: res.response.text() }                       // JSON-parse + zod-validate downstream
 *   // (devpilot adds: 3 retries, 90s timeout, disabled if key unset or starts with 'AIzaxxxxx' placeholder)
 */

export interface ModelClient {
  /** false → cloud model not configured; generateText will throw. */
  readonly available: boolean
  /** systemInstruction + user prompt → raw text (JSON parsing + validation happen at the call site). */
  generateText(systemPrompt: string, userPrompt: string): Promise<{ text: string }>
}

const DEFERRED_MSG =
  'Phase-1 analyze cloud call is DEFERRED: set GEMINI_API_KEY and add the @google/generative-ai dep, ' +
  'then implement the wiring recipe in model-client.ts. The deterministic mapper is verified via analyze.selfcheck.'

/** Deferred placeholder — available=false until the cloud key + SDK land. */
class DeferredModelClient implements ModelClient {
  readonly available = false
  async generateText(_systemPrompt: string, _userPrompt: string): Promise<{ text: string }> {
    throw new Error(DEFERRED_MSG)
  }
}

/**
 * Factory: returns the concrete cloud client when configured, else a Deferred placeholder.
 * Currently always Deferred (SDK dep not yet added) — the env check documents the exact gate.
 */
export function createModelClient(): ModelClient {
  const hasKey = typeof process.env.GEMINI_API_KEY === 'string' && process.env.GEMINI_API_KEY.length > 0
  // Even with a key, the concrete client is deferred until @google/generative-ai is added (see WIRING RECIPE).
  void hasKey
  return new DeferredModelClient()
}
