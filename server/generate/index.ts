/**
 * PHASE-2 — 생성 / CODEGEN orchestration (local Ollama).
 *
 * CANONICAL SOURCE (PHASE-MAP): n8n v31 stages S11→S19 translated to TS.
 *   S11 Routes/IA · S12 styles.css · S13 Components Contract · S15 Header/Footer ·
 *   S16 per-screen HTML + verify · S18 app.js · S19 quality-check + Dynamic Final Repair.
 * devpilot-v2 phase_4 verify gates (prop-shape, per-page retry, anti-flatness) are ABSORBED here,
 *   but devpilot-v2 phase_4 (Gemini/React) is NOT the codegen path — the target is chosen via emitters/.
 *
 * INPUT = BuildManifest (from analyze). MODEL = local Ollama `qwen3-coder:30b` (company server,
 *   credential "Ollama account 2"); `deepseek-r1:32b` for verify gates. Fan-out per page.
 *
 * TODO(STEP 3 — adapt): translate n8n S11-S19 node prompts/code to TS; drive the selected emitter;
 *   run conformance gate after each emit; write FTRecord + checkpoint per page (see ../jobs).
 */
import type { BuildManifest } from '../contract'

export async function generate(_manifest: BuildManifest, _pageIds?: string[]): Promise<{ jobId: string }> {
  throw new Error('SCAFFOLD: Phase-2 generate not yet ported (STEP 3).')
}
