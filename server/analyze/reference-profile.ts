/**
 * REFERENCE PROFILE — extract a ConformanceTokenSet from a publisher reference project (workorder §1② + §4).
 *
 * CANONICAL SOURCE (extract-first, read-only): devpilot-v2
 *   src/pipeline/intelligence/design-token-system.ts — token definition/merge/precedence machinery.
 *
 * §3 MECHANISM vs AESTHETIC judgment: design-token-system.ts is mostly HARDCODED AESTHETIC DATA — brand hue
 *   rotations (-22°), fixed lightness deltas, mesh-gradient alphas, motion durations, 3 curated ColorArchetype
 *   palettes. That entire color-DERIVATION layer is EXCLUDED (it belongs to Phase-2 aesthetic enrichment, and
 *   it is exactly the "personal effects" §2 rules out). What is PORTABLE for increment-① is the token-EXTRACTION
 *   + merge/precedence MECHANISM: read a project's design tokens, treat them as law, merge over a host base.
 *
 * GENERALIZATION (§4): host-profile.ts hardcodes tinto-gui globals.css as the conformance source. Here the
 *   REFERENCE PROJECT's tokens become law; tinto-gui is only the embed host / fallback base. The reference
 *   dominates the COLOR/TOKEN layer (cssVars, colorTokens, and — if the reference declares them — color-bearing
 *   prefixes + utility classes). STRUCTURAL governance (denylist enable-flags, namingRules, fsdLanding) stays
 *   host-canonical — those are frozen literal-typed contract fields, not per-project aesthetics.
 *
 * ★ REVERSAL PRINCIPLE, ENFORCED AT THE PARSER ★
 *   The static emitter writes every cssVar verbatim into `:root` and the conformance gate STRIPS the `:root`
 *   block before scanning for raw color literals — so a hex value smuggled into a token would evade the gate
 *   AND break `rgb(var(--token))` rendering. Therefore extraction only accepts SPACE-SEPARATED RGB CHANNEL
 *   TRIPLES (`--name: R G B;`). A `--x: #4F46E5;` or `--y: rgb(1,2,3);` line CANNOT match, so a raw literal is
 *   structurally unable to enter the token set. The reference's tokens are law, but only in the sanctioned form.
 *
 * PURITY: pure functions over an IN-MEMORY css string. Fetching the reference globals.css is the deferred
 *   external boundary (see host-profile.ts). Deterministic + verifiable now via fixtures.
 */
import type { ConformanceTokenSet } from '../contract'

/** In-memory reference-project profile source (the deferred loader's output). */
export interface ReferenceProfileSource {
  /** stable id, e.g. 'ref:juice-landing' — mirrored into AnalyzeRequest.conformanceProfile by the loader */
  profileId: string
  /** the reference project's globals.css (or any CSS declaring `:root` channel tokens) */
  css: string
  /** optional: color-bearing class prefixes the reference uses (else inherit host base) */
  colorBearingPrefixes?: string[]
  /** optional: semantic utility classes the reference defines (else inherit host base) */
  utilityLayerClasses?: string[]
}

/**
 * Match ONLY sanctioned channel tokens: `--name: R G B` where R/G/B are 0–255 decimals separated by spaces,
 * terminated by `;` OR end-of-block (CSS lets the final declaration omit its semicolon). This is the reversal
 * gate at the parser — hex / rgb()/hsl() literals cannot match and are silently excluded.
 */
const CHANNEL_TOKEN = /--([a-z0-9-]+)\s*:\s*(\d{1,3}\s+\d{1,3}\s+\d{1,3})\s*(?:;|$)/gi

/** true if the value is three 0–255 integers separated by whitespace (defensive re-validation). */
function isChannelTriple(value: string): boolean {
  const parts = value.trim().split(/\s+/)
  return parts.length === 3 && parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255)
}

/**
 * The FIRST `:root { ... }` block body (comments stripped). `:root` is the sanctioned source of tokens (mirrors
 * the conformance gate, which exempts only the `:root` block). Scoping here means alternate-selector blocks
 * (`.dark {}`, `@media (prefers-color-scheme: dark) {}`) and commented-out declarations CANNOT override the
 * light-mode tokens — last-write-wins over the whole file would otherwise silently pick the wrong triples.
 */
function firstRootBody(css: string): string {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const m = noComments.match(/:root\s*\{([^}]*)\}/i)
  return m ? m[1] : ''
}

/** parse a reference CSS string → { '--token': 'R G B' } map, keeping only sanctioned channel tokens in :root. */
export function extractCssVars(css: string): Record<string, string> {
  const cssVars: Record<string, string> = {}
  for (const m of firstRootBody(css).matchAll(CHANNEL_TOKEN)) {
    const name = `--${m[1].toLowerCase()}`
    const value = m[2].replace(/\s+/g, ' ').trim()
    if (isChannelTriple(value)) cssVars[name] = value
  }
  return cssVars
}

/** derive the semantic colorTokens list from extracted cssVar names (drop the leading `--`, sorted, unique). */
function deriveColorTokens(cssVars: Record<string, string>): string[] {
  return Object.keys(cssVars)
    .map((k) => k.replace(/^--/, ''))
    .sort()
}

/**
 * Build a reference ConformanceTokenSet: the reference's tokens are LAW for color; `base` (the host profile)
 * supplies structural governance (denylist / namingRules / fsdLanding) and any TOKEN the reference omits.
 * Returns null if the reference declares NO sanctioned channel tokens (caller falls back to `base`).
 *
 * MERGE PRECEDENCE (`{ ...base.cssVars, ...extracted }`): the reference OVERRIDES tokens it declares but
 * INHERITS the rest from the host base — so the emitter-referenced token set is always complete (a partial
 * reference that omits, say, --card/--border cannot leave `rgb(var(--card))` pointing at an undefined var,
 * which would render broken while the gate — it strips :root — passes). Reversal is unaffected: base.cssVars
 * are themselves sanctioned channel triples.
 */
export function extractProfileFromCss(
  source: ReferenceProfileSource,
  base: ConformanceTokenSet,
): ConformanceTokenSet | null {
  const extracted = extractCssVars(source.css)
  if (Object.keys(extracted).length === 0) return null
  const cssVars = { ...base.cssVars, ...extracted }

  return {
    // COLOR/TOKEN layer — reference dominates for declared tokens, inherits the rest from the host base:
    cssVars,
    colorTokens: deriveColorTokens(cssVars),
    colorBearingPrefixes: source.colorBearingPrefixes ?? base.colorBearingPrefixes,
    utilityLayerClasses: source.utilityLayerClasses ?? base.utilityLayerClasses,
    // STRUCTURAL governance — host-canonical (frozen literal-typed fields), reference cannot override:
    denylist: base.denylist,
    namingRules: base.namingRules,
    fsdLanding: base.fsdLanding,
  }
}
