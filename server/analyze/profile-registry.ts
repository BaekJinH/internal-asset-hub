/**
 * PROFILE REGISTRY — resolve `AnalyzeRequest.conformanceProfile` (a string LABEL) to a concrete on-disk
 * reference PROJECT (its cushion catalog + conformance profile). This is the ((B) increment-④) layer that
 * makes the label MEAN something.
 *
 * ★ DEVIATION #2 CLOSED ★
 *   The (B)② report flagged: `resolveHostProfile(_profile)` ignores its argument, so `conformanceProfile` was
 *   an INERT label — a request could name any profile and silently get the host default, and a future registry
 *   keyed on it would be a live bug. Here the profileId becomes the KEY, and registration ASSERTS the
 *   reference project's OWN `config.profileId` equals the key it is registered under. A mismatch fails closed
 *   (throws) rather than resolving a request's conformanceProfile to the wrong — or no — reference.
 *
 * DETERMINISTIC + verifiable now (NO cloud/LLM): registration performs the disk load once (via
 *   buildReferenceFromDisk, (B)②) and caches the DiskReference; `resolveReference` is a pure SYNCHRONOUS map
 *   lookup. Discovery order is codepoint-stable. Backward-compatible: an EMPTY registry resolves every profile
 *   to null → resolveConformanceProfile falls back to the embed-host default (exactly today's behavior).
 *
 * RESILIENT + FAIL-CLOSED: `registerReferenceDir` scans a references root; a subdir that fails to load
 *   (malformed config, path-fence escape, unreadable) is SKIPPED with a reason — one bad reference never sinks
 *   registry startup — while a request for that profile still gets null (host fallback), never a half-built one.
 *   A duplicate profileId keeps the first (codepoint order) and skips the rest (no silent last-write-wins).
 *
 * TRANSPORT WIRING: `createEngineServer({ registry })` injects a registry; `analyze()` resolves
 *   `req.conformanceProfile` through it and threads the reference into the manifest — so when the cloud key
 *   lands (analyze 503→200) the reference is consumed with ZERO further wiring (one-flip). `/generate` consumes
 *   it transitively via the stored manifest's already-resolved `conformanceTokens`.
 */
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { buildReferenceFromDisk, type DiskReference } from './reference-loader'

/** A reference project registered under a profileId key (the DiskReference is loaded + cached at register time). */
export interface RegisteredReference {
  profileId: string
  root: string
  reference: DiskReference
}

/** Outcome of a directory scan: which profileIds registered, which subdirs were skipped and why, and which
 *  registered ones degraded (loader warnings surfaced — so a token-less/partial reference is observable at
 *  bootstrap rather than looking identical to a fully-conformant one). */
export interface RegisterDirResult {
  registered: string[]
  skipped: { name: string; reason: string }[]
  warnings: { name: string; notes: string[] }[]
}

/** codepoint-stable comparator — deterministic across locales/ICU builds (localeCompare is not). */
function byCodepoint(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export class ProfileRegistry {
  private readonly byId = new Map<string, RegisteredReference>()

  /**
   * Register a reference project under an EXPECTED profileId, ASSERTING the project's own config agrees
   * (deviation #2). Loads + caches the DiskReference. Throws on load failure (fail-closed) or on key mismatch.
   * An explicit re-registration of the same id overwrites (caller intent); the scan path (below) does not.
   */
  async registerReference(expectedProfileId: string, root: string): Promise<RegisteredReference> {
    const reference = await buildReferenceFromDisk(root)
    if (reference.config.profileId !== expectedProfileId) {
      throw new Error(
        `profile registry key mismatch: registered as "${expectedProfileId}" but ` +
          `reference.config.profileId is "${reference.config.profileId}" (${root})`,
      )
    }
    const entry: RegisteredReference = { profileId: expectedProfileId, root, reference }
    this.byId.set(expectedProfileId, entry)
    return entry
  }

  /**
   * Scan the IMMEDIATE subdirectories of `referencesRoot`, load each, and register it under its OWN
   * `config.profileId` (key = the reference's declared identity, so no mismatch is possible on this path).
   * A subdir that fails to load is SKIPPED with its error as the reason. A duplicate profileId keeps the first
   * (codepoint order) and skips the rest. Symlinked subdirs are SKIPPED WITH A NOTE (a way out of the loader's
   * path fence — but a fully-symlinked references root must stay diagnosable, not look empty). A registered
   * reference that degraded (absent token CSS, empty components) surfaces its loader warnings. A
   * missing/unreadable references root yields an empty result with a single skip note — it never throws.
   */
  async registerReferenceDir(referencesRoot: string): Promise<RegisterDirResult> {
    const registered: string[] = []
    const skipped: { name: string; reason: string }[] = []
    const warnings: { name: string; notes: string[] }[] = []

    // infer the readdir overload inline — an explicit annotation collapses to the Buffer overload (TS2322).
    let dirs: string[]
    let symlinked: string[]
    try {
      const entries = await readdir(referencesRoot, { withFileTypes: true })
      dirs = []
      symlinked = []
      for (const e of entries) {
        if (e.isSymbolicLink()) symlinked.push(e.name) // a symlink-to-dir reports isDirectory()===false
        else if (e.isDirectory()) dirs.push(e.name)
      }
      dirs.sort(byCodepoint)
      symlinked.sort(byCodepoint)
    } catch (err) {
      return { registered, skipped: [{ name: referencesRoot, reason: `references root unreadable: ${err instanceof Error ? err.message : String(err)}` }], warnings }
    }

    // Symlinked reference dirs are skipped for the path fence — but NOTED, so a fully-symlinked references root
    // (a real monorepo/deploy layout) is diagnosable instead of looking identical to an empty registry.
    for (const name of symlinked) {
      skipped.push({ name, reason: 'symlinked reference dir skipped (path-fence; realpath the target if intentional)' })
    }

    for (const name of dirs) {
      const root = join(referencesRoot, name)
      let reference: DiskReference
      try {
        reference = await buildReferenceFromDisk(root)
      } catch (err) {
        skipped.push({ name, reason: err instanceof Error ? err.message : String(err) })
        continue
      }
      const id = reference.config.profileId
      if (this.byId.has(id)) {
        skipped.push({ name, reason: `duplicate profileId "${id}" — keeping the first` })
        continue
      }
      this.byId.set(id, { profileId: id, root, reference })
      registered.push(id)
      // surface the loader's warnings (absent token CSS → host fallback, empty components, …) so a degraded
      // registration is loud at bootstrap, not a silent host-conforming reference (adversarial-review NIT).
      if (reference.warnings.length > 0) warnings.push({ name, notes: reference.warnings })
    }

    return { registered, skipped, warnings }
  }

  /** Pure SYNCHRONOUS lookup — null when the profile is not registered (→ resolveConformanceProfile host fallback). */
  resolveReference(profileId: string): DiskReference | null {
    return this.byId.get(profileId)?.reference ?? null
  }

  has(profileId: string): boolean {
    return this.byId.has(profileId)
  }

  /** Registered profileIds, codepoint-sorted (deterministic). */
  list(): string[] {
    return [...this.byId.keys()].sort(byCodepoint)
  }
}

/**
 * Module-default registry — starts EMPTY, so backward compatibility is exact: every profile resolves to null →
 * the embed-host default. A transport bootstrap or self-check populates it; production wiring reads a references
 * root from config/env (deferred — no absolute paths baked into the engine).
 */
export const defaultProfileRegistry = new ProfileRegistry()
