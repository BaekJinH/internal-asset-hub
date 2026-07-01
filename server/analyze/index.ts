/**
 * PHASE-1 — 이해 / ANALYSIS (cloud, high-intelligence NL). Entry: analyze(AnalyzeRequest) → BuildManifest.
 *
 * CANONICAL SOURCE (PHASE-MAP): devpilot-v2@d262aa3 phase_0→phase_3
 *   phase_0 vision (ImageAnalysis) · phase_1 requirements (DevelopmentPlan) ·
 *   phase_2 blueprint (ScreenBlueprint) · phase_3 theme (ThemeConfig).
 * Enriched by n8n v31 DOMAIN RULES only (Screen ID Contract, Route Contract, selector conventions) —
 *   NOT a second pipeline (dedup: no double analysis).
 *
 * OUTPUT = BuildManifest (framework-neutral IR) — the Phase-1→Phase-2 handoff.
 *
 * PORT STATUS (STEP 3-continued, analyze extraction):
 *   ✅ IR contracts (ir.ts) · host-profile resolver (reversal principle) · deterministic mapper (manifest-mapper.ts)
 *      · model-client seam (model-client.ts). Proven front-to-back by analyze.selfcheck.ts (NO cloud call).
 *   ⏳ DEFERRED (cloud-key milestone, same gate as Phase-2 Ollama): live Gemini calls + prompt-loader + ajv
 *      validator + model-router/policies (devpilot machinery is only exercised by the live call). Phase_0
 *      (vision) and Phase_2/3 heavy closure (@sovereign) are separate, larger ports — see docs/failures vaccine.
 */
import type { AnalyzeRequest, BuildManifest } from '../contract'
import { DevelopmentPlanSchema, ScreenBlueprintSchema } from './ir'
import type { DevelopmentPlan, ScreenBlueprint } from './ir'
import { mapToBuildManifest } from './manifest-mapper'
import { createModelClient } from './model-client'

/** Deterministic composition (verifiable now): validated phase outputs → BuildManifest. */
export function buildManifestFromPhases(
  plan: DevelopmentPlan,
  blueprint: ScreenBlueprint,
  req: AnalyzeRequest,
): BuildManifest {
  return mapToBuildManifest(plan, blueprint, req)
}

export async function analyze(req: AnalyzeRequest): Promise<BuildManifest> {
  const client = createModelClient()
  if (!client.available) {
    throw new Error(
      'Phase-1 analyze DEFERRED: cloud model not configured. The deterministic plan+blueprint→BuildManifest ' +
        'mapping is verified via analyze.selfcheck.ts; wire GEMINI_API_KEY + @google/generative-ai (see ' +
        'model-client.ts WIRING RECIPE) to enable end-to-end.',
    )
  }

  // ── cloud-key milestone wiring (structure fixed; enabled when client.available) ──────────────
  // Phase-1: requirements → DevelopmentPlan; Phase-2: blueprint → ScreenBlueprint. Both behind the seam.
  const planRes = await client.generateText(SYS_PHASE1, buildPhase1Prompt(req))
  const plan = DevelopmentPlanSchema.parse(JSON.parse(planRes.text))
  const bpRes = await client.generateText(SYS_PHASE2, buildPhase2Prompt(req, plan))
  const blueprint = ScreenBlueprintSchema.parse(JSON.parse(bpRes.text))
  return buildManifestFromPhases(plan, blueprint, req)
}

// Prompt scaffolds — full fidelity (devpilot prompts/v1/*.md + n8n domain rules) lands with the live wiring.
const SYS_PHASE1 = 'You extract a structured DevelopmentPlan (pages, features, overview) from a spec. Output JSON only.'
const SYS_PHASE2 = 'You map a DevelopmentPlan to a ScreenBlueprint (per-page layout_tree). Output JSON only.'
function buildPhase1Prompt(req: AnalyzeRequest): string {
  return `SPEC:\n${req.spec}\n\nmanyPages=${req.manyPages} conformanceProfile=${req.conformanceProfile}`
}
function buildPhase2Prompt(req: AnalyzeRequest, plan: DevelopmentPlan): string {
  return `DEVELOPMENT_PLAN:\n${JSON.stringify(plan)}\n\ndesignRefMode=${req.designRefMode}`
}
