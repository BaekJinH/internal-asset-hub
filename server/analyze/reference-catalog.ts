/**
 * REFERENCE CATALOG — extract a cushion catalog from a publisher's reference project (the (B) increment-①).
 *
 * CANONICAL SOURCE (extract-first, read-only): devpilot-v2
 *   src/pipeline/custom-registry/custom-extractor.ts  (guessCategory · extractProps · feature detection)
 *   src/pipeline/custom-registry/custom-validator.ts  (blocking/advisory rule engine)
 *   src/pipeline/custom-registry/types.ts             (CustomComponentMeta / CustomValidationResult shapes)
 *
 * GENERALIZATION (workorder §0/§1①): devpilot-v2 extracts a USER's custom .tsx component into metadata; the
 *   company engine generalizes the same mechanism to a PUBLISHER REFERENCE PROJECT — the accumulating cushion
 *   corpus that is the conformance source (compounding IP). The ALGORITHM (keyword→category matching, props
 *   regex, responsive/aria detection, blocking/advisory validation) is ported verbatim; the DATA that was
 *   hardcoded in the source (Korean keyword taxonomy, React/.tsx/Tailwind assumptions, Korean messages) is
 *   lifted into injectable rules (§3: mechanism = ported, aesthetic/localized data = overridable seed).
 *
 * PURITY: every export is a pure function over IN-MEMORY sources ({ filename, content } strings). Filesystem /
 *   URL discovery (turning a reference project on disk into these sources) is the DEFERRED external boundary —
 *   the same discipline as the deferred Gemini/Ollama calls — so this module is deterministic + verifiable now.
 *   No `new Date()` (the source's non-deterministic registeredAt is intentionally dropped).
 *
 * REVERSAL PRINCIPLE: this module extracts STRUCTURAL signal only (category, prop names, responsive/aria flags).
 *   It never reads colors — token conformance is reference-profile.ts's job. No literal can leak into the IR here.
 */

/** One reference-project component, in memory (no fs). Source = the deferred loader's output unit. */
export interface ReferenceComponentSource {
  /** file name (with extension), used for id + category hinting */
  filename: string
  /** raw component source text */
  content: string
}

/** Validation verdict for a single reference component (faithful to devpilot CustomValidationResult). */
export interface ReferenceConformance {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/** Extracted metadata for one reference component (generalized CustomComponentMeta — structural signal only). */
export interface ReferenceComponentMeta {
  id: string
  filename: string
  category: string
  props: string[]
  hasResponsive: boolean
  hasAria: boolean
  conformance: ReferenceConformance
  /**
   * Domains this component suits (devpilot ComponentMeta.recommendedDomains). The increment-① regex extractor
   * cannot infer this, so it is left undefined here; a richer reference metadata source (later) populates it,
   * and component-selector uses it for domain-aware selection when present (else it degrades to first-in-category).
   */
  recommendedDomains?: string[]
}

/** The cushion catalog: forward-compatible with devpilot ComponentManifest (categories index + components map). */
export interface ReferenceCatalog {
  /** valid components, keyed by id */
  components: Record<string, ReferenceComponentMeta>
  /** category → [component ids], the index component-selector consumes (increment-③) */
  categories: Record<string, string[]>
  /** ids that FAILED blocking validation — excluded from the catalog (reference conformance gate) */
  rejected: string[]
}

/** Keyword→category taxonomy + responsive breakpoint prefixes. Overridable per reference project (§3 seed). */
export interface ExtractionRules {
  categoryKeywords: Array<{ keywords: string[]; category: string }>
  /** CSS-framework responsive prefixes; default = Tailwind. A non-Tailwind reference supplies its own. */
  responsivePrefixes: string[]
  /** category returned when no keyword matches */
  fallbackCategory: string
}

/** Blocking (→ error, rejects component) + advisory (→ warning) validation rules. Overridable per reference. */
export interface ValidationRules {
  /** component is rejected if a blocking pattern is ABSENT */
  blockingRequired: Array<{ id: string; pattern: RegExp; message: string }>
  /** warn if an advisory pattern is PRESENT (e.g. inline style) */
  advisoryForbidden: Array<{ id: string; pattern: RegExp; message: string }>
  /** warn if an advisory pattern is ABSENT (e.g. no responsive classes) */
  advisoryExpected: Array<{ id: string; pattern: RegExp; message: string }>
}

// ── ported regexes (verbatim from custom-extractor.ts / custom-validator.ts) ────────────────────────
const PROPS_BLOCK = /interface\s+\w*Props\s*\{([^}]*)\}/s
const PROPS_MEMBER = /^\s+(\w+)\s*[?:]?\s*:/gm
const ARIA = /aria-\w+/

/**
 * DEFAULT extraction rules — the exact devpilot taxonomy (English + Korean) as an OVERRIDABLE SEED.
 * Per §3 this keyword DATA is localized/aesthetic; the matching MECHANISM is the port. First match wins.
 */
export const DEFAULT_EXTRACTION_RULES: ExtractionRules = {
  categoryKeywords: [
    { keywords: ['hero', 'Hero', '히어로', '메인'], category: 'hero' },
    { keywords: ['feature', 'Feature', '기능', '서비스'], category: 'feature' },
    { keywords: ['form', 'Form', 'input', 'Input', '문의', '폼'], category: 'form' },
    { keywords: ['nav', 'Nav', 'Navbar', 'navbar', 'header', 'Header'], category: 'navigation' },
    { keywords: ['footer', 'Footer', '푸터'], category: 'navigation' },
    { keywords: ['pricing', 'Pricing', '가격', '요금'], category: 'pricing' },
    { keywords: ['testimonial', 'Testimonial', 'review', '후기', '리뷰'], category: 'social_proof' },
    { keywords: ['cta', 'CTA', 'CallToAction'], category: 'cta' },
    { keywords: ['blog', 'Blog', 'card', 'Card', '콘텐츠'], category: 'content' },
    { keywords: ['faq', 'FAQ', '질문'], category: 'faq' },
    { keywords: ['team', 'Team', '팀', '의료진'], category: 'team' },
    { keywords: ['gallery', 'Gallery', '갤러리'], category: 'content' },
    { keywords: ['stats', 'Stats', '통계', '수치'], category: 'social_proof' },
    { keywords: ['dashboard', 'Dashboard', 'sidebar', 'Sidebar'], category: 'functional' },
    { keywords: ['layout', 'Layout', 'section', 'Section', 'divider', 'Divider'], category: 'layout' },
  ],
  responsivePrefixes: ['sm:', 'md:', 'lg:', 'xl:', '2xl:'],
  fallbackCategory: 'custom',
}

/**
 * DEFAULT validation rules — verbatim devpilot React/TSX conformance. Overridable so a Vue/HTML reference can
 * supply its own contract (framework-neutral IR goal). Messages kept English-neutral (source used Korean).
 */
export const DEFAULT_VALIDATION_RULES: ValidationRules = {
  blockingRequired: [
    { id: 'export', pattern: /\bexport\b/, message: 'missing `export` — component is not exported' },
    { id: 'react-import', pattern: /import\s+.*(?:React|react|'react'|"react")/, message: 'missing React import' },
    { id: 'props-interface', pattern: /interface\s+\w*Props/, message: 'missing a `*Props` interface' },
  ],
  advisoryForbidden: [
    { id: 'inline-style', pattern: /style\s*=\s*\{/, message: 'inline style detected — prefer utility classes' },
  ],
  advisoryExpected: [
    { id: 'responsive', pattern: /(?:sm:|md:|lg:|xl:|2xl:)/, message: 'no responsive (breakpoint) classes detected' },
    { id: 'aria', pattern: ARIA, message: 'no aria-* attributes detected' },
  ],
}

/** filename + content → category, sequential first-match over the rules (devpilot guessCategory, generalized). */
export function guessCategory(filename: string, content: string, rules: ExtractionRules): string {
  const target = `${filename}\n${content}`
  for (const { keywords, category } of rules.categoryKeywords)
    for (const kw of keywords) if (target.includes(kw)) return category
  return rules.fallbackCategory
}

/**
 * Extract prop names from the first `interface *Props { ... }` block (devpilot extractProps, VERBATIM regex).
 * KNOWN LIMITATION (inherited from the source, kept faithful): the block regex `[^}]*` stops at the first `}`,
 * so a nested object-typed member (`theme: { color: string }`) truncates the block — its inner member leaks in
 * as a top-level name and members after it are lost. Impact is metadata-only (prop TYPES are already 'unknown'
 * and no emitter consumes props today); richer AST-based prop-shape extraction is a later increment.
 */
export function extractProps(content: string): string[] {
  const block = content.match(PROPS_BLOCK)
  if (!block) return []
  const props: string[] = []
  const member = new RegExp(PROPS_MEMBER.source, 'gm')
  let m: RegExpExecArray | null
  while ((m = member.exec(block[1])) !== null) if (m[1]) props.push(m[1])
  return props
}

/** blocking-absent → error; advisory-present/absent → warning. Faithful to custom-validator's severity split. */
export function validateComponent(content: string, rules: ValidationRules): ReferenceConformance {
  const errors: string[] = []
  const warnings: string[] = []
  for (const r of rules.blockingRequired) if (!r.pattern.test(content)) errors.push(r.message)
  for (const r of rules.advisoryForbidden) if (r.pattern.test(content)) warnings.push(r.message)
  for (const r of rules.advisoryExpected) if (!r.pattern.test(content)) warnings.push(r.message)
  return { valid: errors.length === 0, errors, warnings }
}

/** one source → structural metadata (devpilot extractMeta, deterministic: no registeredAt timestamp). */
export function extractComponentMeta(
  source: ReferenceComponentSource,
  exRules: ExtractionRules = DEFAULT_EXTRACTION_RULES,
  valRules: ValidationRules = DEFAULT_VALIDATION_RULES,
): ReferenceComponentMeta {
  const { filename, content } = source
  const id = filename.replace(/\.(tsx|jsx|vue|svelte|html)$/i, '')
  const responsive = new RegExp(exRules.responsivePrefixes.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'))
  return {
    id,
    filename,
    category: guessCategory(filename, content, exRules),
    props: extractProps(content),
    hasResponsive: responsive.test(content),
    hasAria: ARIA.test(content),
    conformance: validateComponent(content, valRules),
  }
}

/**
 * Build the cushion catalog from a reference project's component sources.
 * Components that FAIL blocking validation are rejected (not added) — the reference conformance gate: only
 * well-formed reference components become cushion. valid components are indexed by id and by category.
 */
export function buildReferenceCatalog(
  sources: ReferenceComponentSource[],
  exRules: ExtractionRules = DEFAULT_EXTRACTION_RULES,
  valRules: ValidationRules = DEFAULT_VALIDATION_RULES,
): ReferenceCatalog {
  const components: Record<string, ReferenceComponentMeta> = {}
  const categories: Record<string, string[]> = {}
  const rejected: string[] = []

  for (const source of sources) {
    const meta = extractComponentMeta(source, exRules, valRules)
    if (!meta.conformance.valid) {
      rejected.push(meta.id)
      continue
    }
    components[meta.id] = meta
    ;(categories[meta.category] ??= []).push(meta.id)
  }

  for (const ids of Object.values(categories)) ids.sort()
  return { components, categories, rejected: rejected.sort() }
}
