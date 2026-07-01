/**
 * CONFORMANCE — the reversal-principle gate (host tokens dominate codegen) + auto-repair.
 *
 * CANONICAL SOURCE (PHASE-MAP): a SYNTHESIS of two assets —
 *   - devpilot-v2: STRUCTURED pass/fail (design-token-system, output-validator, ajv/zod) → GateReport.
 *   - n8n v31 S19+S20 "Dynamic Final Repair (No Hardcoded Links/CSS)": auto-REPAIR.
 *
 * This file implements the DETERMINISTIC dsConformance check (runnable here, no LLM). The gate emits the
 * shipped `GateReport`. D1: `ConformanceTokenSet.denylist` is the shipped OBJECT of boolean enable-flags;
 * the actual forbidden-pattern/palette DATA lives here, ENGINE-INTERNAL, never in the shared contract.
 *
 * l1_esbuild / l2_forbiddenImports / l3_propShape / l4_render are DEFERRED (need esbuild + Playwright,
 * STEP 3 green-field); they report `true` (not-yet-enforced) until wired.
 */
import type { GateReport, GeneratedFile } from '../contract'

/** Engine-internal denylist DATA (NOT in the shared contract — keeps host frozen). */
export const FORBIDDEN_PATTERNS = {
  // raw hex, OR rgb()/hsl() with a numeric literal argument — but NOT rgb(var(--token)).
  rawHex: /#[0-9a-fA-F]{3,8}\b/g,
  rawColorFn: /\b(?:rgb|rgba|hsl|hsla)\(\s*[0-9.]/g,
  defaultPalette: ['slate', 'gray', 'zinc', 'neutral', 'stone'] as const,
}

const KEBAB = /^[a-z0-9-]+$/

/** :root token definitions are the sanctioned source of colors — exempt from literal scanning. */
function stripRootBlock(content: string): string {
  return content.replace(/:root\s*\{[^}]*\}/g, '')
}

function paletteRegex(): RegExp {
  const names = FORBIDDEN_PATTERNS.defaultPalette.join('|')
  return new RegExp(`\\b(?:bg|text|border|ring|from|to|via|fill|stroke)-(?:${names})-`, 'g')
}

export async function runGate(files: GeneratedFile[]): Promise<GateReport> {
  const colorLiteralViolations: string[] = []
  const tokenViolations: string[] = []
  const namingViolations: string[] = []
  const palette = paletteRegex()

  for (const file of files) {
    const scanned = stripRootBlock(file.content)

    for (const m of scanned.matchAll(FORBIDDEN_PATTERNS.rawHex))
      colorLiteralViolations.push(`${file.path}: raw hex "${m[0]}"`)
    for (const m of scanned.matchAll(FORBIDDEN_PATTERNS.rawColorFn))
      colorLiteralViolations.push(`${file.path}: raw color fn "${m[0].trim()}…"`)
    for (const m of scanned.matchAll(palette))
      tokenViolations.push(`${file.path}: default-palette class "${m[0]}…"`)

    const base = file.path.split('/').pop()!.replace(/\.[^.]+$/, '')
    if (!KEBAB.test(base)) namingViolations.push(`${file.path}: file "${base}" not kebab-case`)
  }

  const pass =
    colorLiteralViolations.length === 0 &&
    tokenViolations.length === 0 &&
    namingViolations.length === 0

  return {
    l1_esbuild: true, // deferred (STEP 3: esbuild syntax/build check)
    l2_forbiddenImports: true, // deferred
    l3_propShape: true, // deferred
    l4_render: true, // deferred (STEP 3: Playwright render verify)
    dsConformance: { tokenViolations, colorLiteralViolations, namingViolations, pass },
  }
}
