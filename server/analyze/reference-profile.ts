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
 * an optional trailing `!important`, terminated by `;` OR end-of-block (CSS lets the final declaration omit
 * its semicolon). This is the reversal gate at the parser — hex / rgb()/hsl() literals cannot match. Custom
 * property names are CASE-SENSITIVE in CSS, so the captured name's case is preserved.
 */
const CHANNEL_TOKEN = /--([a-zA-Z0-9-]+)\s*:\s*(\d{1,3}\s+\d{1,3}\s+\d{1,3})\s*(?:!\s*important)?\s*(?:;|$)/g

/** true if the value is three 0–255 integers separated by whitespace (defensive re-validation). */
function isChannelTriple(value: string): boolean {
  const parts = value.trim().split(/\s+/)
  return parts.length === 3 && parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255)
}

/** strip `/* … *​/` comments, INCLUDING an unterminated trailing comment (CSS extends it to end-of-file). */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\*[\s\S]*$/, '')
}

/** the balanced `{ … }` body starting at `openIdx` (the `{`); tolerant of an unclosed block (→ to EOF). */
function balancedBody(s: string, openIdx: number): { body: string; end: number } {
  let depth = 0
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === '{') depth++
    else if (s[i] === '}' && --depth === 0) return { body: s.slice(openIdx + 1, i), end: i }
  }
  return { body: s.slice(openIdx + 1), end: s.length - 1 }
}

/** keep only chars at the block's OWN depth — nested `{ … }` (native nesting, nested @media) are dropped. */
function depthZeroDecls(body: string): string {
  let out = ''
  let depth = 0
  for (const ch of body) {
    if (ch === '{') depth++
    else if (ch === '}') depth = Math.max(0, depth - 1)
    else if (depth === 0) out += ch
  }
  return out
}

/**
 * Bodies of every TOP-LEVEL, light-mode `:root` rule (a brace-depth scanner over comment-stripped CSS):
 *   - `:root` may be any member of a selector list (`:root, :host { … }`) — matched as a list member, not by
 *     abutting `{`, so grouped selectors are not silently dropped;
 *   - a `:root` nested inside a CONDITIONAL at-rule (@media/@supports/@container/@scope) or another selector
 *     is EXCLUDED — those are dark/responsive/scoped overrides, not the base; `@layer` wrappers are transparent;
 *   - source order is NOT trusted: a conditional `:root` placed before the base one cannot become law.
 * Multiple qualifying `:root` blocks are all returned (design systems split tokens across blocks).
 */
function rootBodies(css: string): string[] {
  const s = stripComments(css)
  const bodies: string[] = []
  const stack: Array<'root' | 'cond' | 'layer' | 'other'> = []
  let prelude = ''
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (ch === '{') {
      const sel = prelude.trim()
      prelude = ''
      let type: 'root' | 'cond' | 'layer' | 'other'
      if (/^@(media|supports|container|scope)\b/i.test(sel)) type = 'cond'
      else if (/^@layer\b/i.test(sel)) type = 'layer'
      else if (sel.startsWith('@')) type = 'other'
      else if (sel.split(',').some((m) => m.trim() === ':root')) type = 'root'
      else type = 'other'
      const ancestorsClear = stack.every((f) => f === 'layer')
      if (type === 'root' && ancestorsClear) {
        const { body, end } = balancedBody(s, i)
        bodies.push(body)
        i = end + 1
        continue
      }
      stack.push(type)
    } else if (ch === '}') {
      stack.pop()
      prelude = ''
    } else if (ch === ';') {
      prelude = '' // statement (@import, declaration) boundary — reset the pending selector prelude
    } else {
      prelude += ch
    }
    i++
  }
  return bodies
}

/**
 * Parse a reference CSS string → { '--token': 'R G B' }, keeping only sanctioned channel tokens declared at the
 * top level of light-mode `:root` blocks. Later blocks override earlier ones (split-by-concern token files).
 */
export function extractCssVars(css: string): Record<string, string> {
  const cssVars: Record<string, string> = {}
  const decls = rootBodies(css).map(depthZeroDecls).join(';\n')
  for (const m of decls.matchAll(CHANNEL_TOKEN)) {
    const value = m[2].replace(/\s+/g, ' ').trim()
    if (isChannelTriple(value)) cssVars[`--${m[1]}`] = value
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
    // an empty array means "inherit" (not "blank the gate's color-bearing scan") — only a non-empty list overrides:
    colorBearingPrefixes: source.colorBearingPrefixes?.length ? source.colorBearingPrefixes : base.colorBearingPrefixes,
    utilityLayerClasses: source.utilityLayerClasses?.length ? source.utilityLayerClasses : base.utilityLayerClasses,
    // STRUCTURAL governance — host-canonical (frozen literal-typed fields), reference cannot override:
    denylist: base.denylist,
    namingRules: base.namingRules,
    fsdLanding: base.fsdLanding,
  }
}
