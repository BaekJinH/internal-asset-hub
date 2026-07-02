/**
 * A11Y FIXER — deterministic, browser-less accessible-name + structure cushion over generated HTML ((B)⑤).
 *
 * CANONICAL SOURCE (extract-first, read-only): devpilot-v2 src/pipeline/post-processor/a11y-fixer.ts.
 *   That module discovers `.tsx` files on DISK and keys its regexes on JSX (`className`, `htmlFor`). This port
 *   is DECOUPLED: it operates PURELY on the in-memory GeneratedFile[] (no fs / fileURLToPath / import.meta.url),
 *   filters to `.html`, and retargets JSX attrs → HTML (`className`→`class`, `htmlFor`→`for`).
 *
 * §3 MECHANISM vs AESTHETIC:
 *   PORT the 3 accessible-NAME fixers (img alt, empty/self-closing button name, unlabeled input name) + the
 *     heading-skip detector, and UPGRADE the source's detect-only missing-`lang` warning into an actual FIX
 *     (inject `lang` from a seed) — a real cushion beats a warning when the value is deterministically available.
 *   EXCLUDE the entire low-contrast family (fixLowContrastGray400 + detectLowContrast + LOW_CONTRAST_PATTERNS):
 *     it is Tailwind DEFAULT-PALETTE data that (a) cannot match host output (colors are rgb(var(--token)), no
 *     Tailwind), (b) DUPLICATES the color-token gate, and (c) its "fix" (text-gray-400 → text-gray-500) is
 *     itself a default-palette class the gate REJECTS — porting it would violate the reversal principle.
 *
 * LATENCY NOTE: on the deterministic emitter floor there are no <img>/<button>/<input> and <html lang="ko"> is
 *   present, so these fixers are LATENT there (correctly no-op). Their teeth bite on Ollama-ENRICHED page bodies
 *   and partial fragments — which is exactly what cushion.selfcheck feeds them (dirty real HTML).
 *
 * Hardcoded Korean labels (버튼 / 입력) are GENERALIZED to injectable seeds (see A11ySeeds). Pure + deterministic.
 */
import type { GeneratedFile } from '../contract'
import { neutralizeColorLiteralsHtml } from './neutralize'

export interface A11ySeeds {
  /** last-resort accessible name for an empty/self-closing <button> with no aria-label/title. */
  buttonLabel: string
  /** last-resort accessible name for an <input> with no label/aria-label and no placeholder to borrow. */
  inputLabel: string
  /** language injected into a bare <html> tag that is missing `lang`. */
  htmlLang: string
}

export interface A11yReport {
  imgAltFixed: number
  buttonNamed: number
  inputNamed: number
  langFixed: number
  /** heading-hierarchy skips (detect-only — no safe deterministic auto-fix without guessing intent). */
  headingWarnings: string[]
}

/** regex metacharacter escape for building a dynamic id-lookup RegExp safely (source built one UNescaped). */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Attribute-START boundary: the attribute name must be preceded by the tag start, whitespace, or a quote — NOT a
// hyphen. `\b` treats the '-' in `data-title`/`data-alt` as a boundary, so an element whose only name-ish attr is
// a data-* one was wrongly judged "already named" and skipped. These matchers reject that false positive.
const hasAttr = (attrs: string, name: string): boolean => new RegExp(`(?:^|[\\s"'])${name}\\s*=`, 'i').test(attrs)
const attrValue = (attrs: string, name: string): string | null => {
  const m = attrs.match(new RegExp(`(?:^|[\\s"'])${name}\\s*=\\s*['"]([^'"]+)['"]`, 'i'))
  return m ? m[1] : null
}
/** the injected accessible-name value must not carry a gate-forbidden color literal (e.g. a '#fff' placeholder). */
const safeLabel = (s: string): string => neutralizeColorLiteralsHtml(s)

/** FIX-1 — inject a decorative empty alt on any <img> lacking one. (faithful; handles `>` and `/>`) */
function fixImgAlt(content: string): { content: string; fixed: number } {
  let fixed = 0
  const out = content.replace(/<img\b([^>]*?)(\s*\/?>)/gi, (m, attrs: string, close: string) => {
    if (hasAttr(attrs, 'alt')) return m
    fixed++
    return `<img${attrs} alt=""${close}`
  })
  return { content: out, fixed }
}

/** FIX-2 — name EMPTY or self-closing <button> that has neither aria-label nor title. (faithful: never
 *  inspects text children — a button WITH text already has an accessible name). */
function fixButtonName(content: string, label: string): { content: string; fixed: number } {
  let fixed = 0
  const value = safeLabel(label)
  const named = (attrs: string): boolean => hasAttr(attrs, 'aria-label') || hasAttr(attrs, 'title')
  let out = content.replace(/<button\b([^>]*?)(\s*\/>)/gi, (m, attrs: string, close: string) => {
    if (named(attrs)) return m
    fixed++
    return `<button${attrs} aria-label="${value}"${close}`
  })
  out = out.replace(/<button\b([^>]*?)>\s*<\/button>/gi, (m, attrs: string) => {
    if (named(attrs)) return m
    fixed++
    return `<button${attrs} aria-label="${value}"></button>`
  })
  return { content: out, fixed }
}

/** FIX-3 — name an <input> with no aria-label/aria-labelledby and no associated <label for=id>; borrow the
 *  placeholder if present, else the seed. (retargeted htmlFor→for; the dynamic id RegExp is ESCAPED). */
function fixInputName(content: string, fallback: string): { content: string; fixed: number } {
  let fixed = 0
  const out = content.replace(/<input\b([^>]*?)(\s*\/?>)/gi, (m, attrs: string, close: string) => {
    if (hasAttr(attrs, 'aria-label') || hasAttr(attrs, 'aria-labelledby')) return m
    const id = attrValue(attrs, 'id')
    if (id) {
      const labelRe = new RegExp(`<label[^>]*(?:^|[\\s"'])for\\s*=\\s*['"]${escapeRegExp(id)}['"]`, 'i')
      if (labelRe.test(content)) return m // an explicit <label for=id> already names it
    }
    fixed++
    return `<input${attrs} aria-label="${safeLabel(attrValue(attrs, 'placeholder') ?? fallback)}"${close}`
  })
  return { content: out, fixed }
}

/** DETECT-1 — heading hierarchy skip (h2 → h4). Detect-only: a safe auto-fix would require guessing intent. */
function detectHeadingSkip(content: string, path: string): string[] {
  const levels: number[] = []
  for (const m of content.matchAll(/<h([1-6])\b/gi)) levels.push(Number(m[1]))
  const warns: string[] = []
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] > levels[i - 1] + 1)
      warns.push(`${path}: heading 계층 건너뜀 — h${levels[i - 1]} → h${levels[i]}`)
  }
  return warns
}

/** UPGRADED FIX — inject `lang` into a bare <html> open tag missing it (source only WARNED). Scoped to the
 *  html tag's own attributes, not a whole-document match (the source's footgun). */
function fixHtmlLang(content: string, lang: string): { content: string; fixed: number } {
  const m = content.match(/<html\b([^>]*)>/i)
  if (!m) return { content, fixed: 0 }
  if (/\blang\s*=/i.test(m[1])) return { content, fixed: 0 }
  return { content: content.replace(/<html\b([^>]*)>/i, `<html$1 lang="${lang}">`), fixed: 1 }
}

/**
 * Apply the structural a11y cushions to the HTML members of `files` (non-HTML passed through untouched).
 * MUST run BEFORE dynamicFinalRepair — its replaceLocalImages strips local <img>, so img-alt would be moot after.
 */
export function fixAccessibility(
  files: GeneratedFile[],
  seeds: A11ySeeds,
): { files: GeneratedFile[]; report: A11yReport } {
  const report: A11yReport = { imgAltFixed: 0, buttonNamed: 0, inputNamed: 0, langFixed: 0, headingWarnings: [] }
  const out = files.map((f) => {
    if (!/\.html?$/i.test(f.path)) return f
    let c = f.content
    const a = fixImgAlt(c)
    c = a.content
    report.imgAltFixed += a.fixed
    const b = fixButtonName(c, seeds.buttonLabel)
    c = b.content
    report.buttonNamed += b.fixed
    const i = fixInputName(c, seeds.inputLabel)
    c = i.content
    report.inputNamed += i.fixed
    const l = fixHtmlLang(c, seeds.htmlLang)
    c = l.content
    report.langFixed += l.fixed
    report.headingWarnings.push(...detectHeadingSkip(c, f.path))
    return c === f.content ? f : { path: f.path, content: c }
  })
  return { files: out, report }
}
