/**
 * REFERENCE LOADER — read a publisher reference PROJECT FROM DISK → the in-memory inputs (B)①③ consume.
 *
 * CANONICAL SOURCE (extract-first, read-only): devpilot-v2 src/pipeline/custom-registry/custom-component-loader.ts
 *   (extension filter · readFile utf-8 · empty-content skip). Generalized from "one user .tsx" → "a whole
 *   reference project directory" and DECOUPLED from devpilot's hardcoded path/import.meta.url (the measured
 *   trap): the project ROOT is passed in, never computed from module location.
 *
 * This is the DEFERRED external boundary from (B)①③ now IMPLEMENTED — it is deterministic file I/O (no LLM),
 *   so it is verifiable now. It closes the chain: real reference project on disk → catalog + conformance profile.
 *
 * ROBUSTNESS (the (B)② mandate — real CSS is messier than fixtures): CSS token extraction is delegated to
 *   reference-profile.ts, which scopes to the first `:root {}` block, strips comments, ignores `.dark {}` /
 *   `@media` overrides, and tolerates a missing final semicolon — so those do not corrupt the profile. A
 *   malformed reference.config.json FAILS CLOSED via zod. Missing optional files degrade to warnings.
 *
 * PATH FENCE: `root` is a trusted, caller-resolved path (from a reference registry / config), but the reference's
 *   OWN config.cssPath/componentsDir are untrusted content. confinedPath fails closed on both a lexical `..`
 *   escape AND a symLINK-at-the-path escape (realpath re-assert) — and walkFiles skips symlinked descendants.
 *   The loader only READS; it never writes and never leaves the given root, even through a symlink.
 */
import { readFile, readdir, realpath } from 'node:fs/promises'
import { basename, join, resolve, sep } from 'node:path'
import type { ReferenceComponentSource } from './reference-catalog'
import { buildReferenceCatalog, type ReferenceCatalog } from './reference-catalog'
import type { ReferenceProfileSource } from './reference-profile'
import { extractProfileFromCss } from './reference-profile'
import type { ConformanceTokenSet } from '../contract'
import { resolveHostProfile } from './host-profile'
import { ReferenceConfigSchema, defaultReferenceConfig, type ReferenceConfig } from './reference-config'

const COMPONENT_EXT = /\.(tsx|jsx)$/i

export interface LoadedReference {
  config: ReferenceConfig
  /** globals.css → profile source (null when the CSS file is absent/unreadable). */
  profileSource: ReferenceProfileSource | null
  /** discovered component sources (non-empty .tsx/.jsx), sorted by path for determinism. */
  componentSources: ReferenceComponentSource[]
  /** non-fatal notes (missing optional file, skipped empty component, …). */
  warnings: string[]
}

/**
 * PATH FENCE (two layers): resolve `rel` under `root` and assert it does not escape. The reference project
 * (incl. its reference.config.json) is external content, so cssPath/componentsDir are untrusted.
 *   1. LEXICAL — a `..` / absolute-path escape fails closed before any fs access.
 *   2. SYMLINK — a symLINK sitting AT the path (e.g. `globals.css` → /etc/passwd, or `components/` → an
 *      external dir) is textually inside root and passes the lexical check, but readFile/readdir would follow
 *      it OUT of the tree. So realpath the target and re-assert containment against the REAL root. A missing
 *      target (ENOENT) is not an escape — it degrades to absent (the caller's read returns null / [] → host
 *      fallback). The root prefix is realpath'd first so a legitimately symlinked references root is not itself
 *      mistaken for an escape. (adversarial-review (B)④ round: closes the symlink hole the (B)② lexical fence left.)
 */
async function confinedPath(root: string, rel: string): Promise<string> {
  let rootAbs = resolve(root)
  try {
    rootAbs = await realpath(rootAbs)
  } catch {
    // root itself does not exist — keep the lexical prefix; downstream reads degrade to absent.
  }
  const abs = resolve(rootAbs, rel)
  if (abs !== rootAbs && !abs.startsWith(rootAbs + sep)) {
    throw new Error(`reference path escapes project root (${rel})`)
  }
  let real: string | null
  try {
    real = await realpath(abs)
  } catch {
    real = null // absent — not an escape
  }
  if (real !== null && real !== rootAbs && !real.startsWith(rootAbs + sep)) {
    throw new Error(`reference path escapes project root via symlink (${rel})`)
  }
  return real ?? abs
}

/** codepoint-stable comparator — deterministic across locales/ICU builds (localeCompare is not). */
function byCodepoint(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** read a file as utf-8, or null if it does not exist / cannot be read. */
async function readTextOrNull(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return null
  }
}

/**
 * Recursively list files under dir (codepoint-sorted, deterministic); [] if dir is absent/unreadable.
 * SYMLINKS are skipped (both file and directory) — following them is a second way out of the path fence.
 */
async function walkFiles(dir: string): Promise<string[]> {
  const out: string[] = []
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const e of [...entries].sort((a, b) => byCodepoint(a.name, b.name))) {
      if (e.isSymbolicLink()) continue
      const full = join(dir, e.name)
      if (e.isDirectory()) out.push(...(await walkFiles(full)))
      else out.push(full)
    }
  } catch {
    return []
  }
  return out
}

/**
 * Load a reference project from `root`. Throws (fail-closed) only when reference.config.json is present but
 * malformed; otherwise degrades to warnings. `profileId` falls back to the directory name when unspecified.
 */
export async function loadReferenceProject(root: string): Promise<LoadedReference> {
  const warnings: string[] = []

  // config — fail-closed on malformed, default when absent
  const rawConfig = await readTextOrNull(join(root, 'reference.config.json'))
  let config: ReferenceConfig
  if (rawConfig === null) {
    config = defaultReferenceConfig(basename(root))
    warnings.push('reference.config.json absent — using defaults')
  } else {
    let parsed: unknown
    try {
      parsed = JSON.parse(rawConfig)
    } catch (err) {
      throw new Error(`reference.config.json is not valid JSON: ${err instanceof Error ? err.message : String(err)}`)
    }
    const result = ReferenceConfigSchema.safeParse(parsed)
    if (!result.success) {
      throw new Error(`reference.config.json failed validation: ${result.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`)
    }
    config = result.data
  }

  // profile source — the tokens CSS (path-fenced: cssPath cannot escape root)
  const cssRel = config.cssPath ?? 'globals.css'
  const css = await readTextOrNull(await confinedPath(root, cssRel))
  let profileSource: ReferenceProfileSource | null = null
  if (css === null) {
    warnings.push(`tokens CSS not found at ${cssRel} — conformance falls back to the embed-host profile`)
  } else {
    profileSource = {
      profileId: config.profileId,
      css,
      colorBearingPrefixes: config.colorBearingPrefixes,
      utilityLayerClasses: config.utilityLayerClasses,
    }
  }

  // component sources — discover .tsx/.jsx (path-fenced), filter non-components, skip empties + basename collisions
  const componentsRel = config.componentsDir ?? 'components'
  const files = await walkFiles(await confinedPath(root, componentsRel))
  if (files.length === 0) warnings.push(`no files under ${componentsRel}`)
  const componentSources: ReferenceComponentSource[] = []
  const seen = new Set<string>()
  for (const file of files) {
    if (!COMPONENT_EXT.test(file)) continue // extension filter (README.md, .css, …)
    const name = basename(file)
    if (seen.has(name)) {
      // ids are derived from the basename → a same-named file in another subdir would silently overwrite
      warnings.push(`duplicate component basename ${name} — keeping the first, skipping ${file}`)
      continue
    }
    const content = await readTextOrNull(file)
    if (content === null || content.trim().length === 0) {
      warnings.push(`skipped empty/unreadable component ${name}`)
      continue
    }
    seen.add(name)
    componentSources.push({ filename: name, content })
  }

  return { config, profileSource, componentSources, warnings }
}

export interface DiskReference {
  config: ReferenceConfig
  catalog: ReferenceCatalog
  /** reference-dominant conformance tokens (host base merged under, governance host-canonical). */
  profile: ConformanceTokenSet
  profileSource: ReferenceProfileSource | null
  warnings: string[]
}

/**
 * Convenience: load a reference project and build both the cushion catalog and the conformance profile.
 * `base` defaults to the embed-host 'default' profile; the reference tokens dominate it (see reference-profile).
 */
export async function buildReferenceFromDisk(
  root: string,
  base: ConformanceTokenSet = resolveHostProfile('default'),
): Promise<DiskReference> {
  const loaded = await loadReferenceProject(root)
  const catalog = buildReferenceCatalog(loaded.componentSources)
  const profile = (loaded.profileSource && extractProfileFromCss(loaded.profileSource, base)) ?? base
  return { config: loaded.config, catalog, profile, profileSource: loaded.profileSource, warnings: loaded.warnings }
}
