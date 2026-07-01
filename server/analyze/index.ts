/**
 * PHASE-1 — 이해 / ANALYSIS (cloud, high-intelligence NL).
 *
 * CANONICAL SOURCE (PHASE-MAP): devpilot-v2@d262aa3 phase_0→phase_3
 *   phase_0 vision (ImageAnalysis) · phase_1 requirements (DevelopmentPlan) ·
 *   phase_2 blueprint (ScreenBlueprint) · phase_3 theme (ThemeConfig).
 * Enriched by n8n v31 DOMAIN RULES only (Screen ID Contract, MVP AC, storyboard 5-states,
 *   Route Contract, selector conventions) — NOT a second pipeline (dedup: no double analysis).
 *
 * OUTPUT = BuildManifest (framework-neutral IR). This is the Phase-1→Phase-2 handoff.
 * MODEL = cloud Gemini (@google/generative-ai). devpilot-v2 ran flash_only on cloud; that structure ports as-is.
 *
 * TODO(STEP 3 — adapt): extract phase_0-3 orchestrators from the devpilot-v2 Electron monorepo
 *   (strip main/renderer/IPC coupling), map ScreenBlueprint + ThemeConfig → BuildManifest.
 */
import type { AnalyzeRequest, BuildManifest } from '../contract'

export async function analyze(_req: AnalyzeRequest): Promise<BuildManifest> {
  throw new Error('SCAFFOLD: Phase-1 analyze not yet ported (STEP 3).')
}
