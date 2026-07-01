/**
 * EMITTERS — target-pluggable code generation (framework polymorphism).
 *
 * DECISION (2026-07-01): output format = static HTML/CSS/JS is the DEFAULT; React, Vue, … must be
 *   pluggable. The BuildManifest is a framework-neutral IR ("what to build"); each Emitter renders it
 *   into a concrete target ("how / in which framework"). Conformance gating runs AFTER emit, per target.
 *
 *   static  (default, MVP)  ← this repo, deterministic spine of n8n v31 S11-S22
 *   react   (deferred)      ← reference: devpilot-v2 phase_4 (React/TSX)
 *   vue     (deferred)      ← future
 *
 * CONTRACT NOTE: MVP is static-only, so the host contract stays frozen. A `target` selector
 *   (`AnalyzeRequest.target?`) is an ADDITIVE contract extension deferred until a non-static emitter
 *   actually ships — do NOT edit the frozen host type now.
 */
import type { BuildManifest, PageSpec, GeneratedFile } from '../contract'
import { StaticEmitter } from './static-emitter'

export type EmitTarget = 'static' | 'react' | 'vue'

export interface Emitter {
  readonly target: EmitTarget
  /** Manifest-level shared assets (styles.css, app.js) — emitted once per build. */
  emitShared(manifest: BuildManifest): Promise<GeneratedFile[]>
  /** One page → its files (e.g. <route>.html for static). */
  emitPage(manifest: BuildManifest, page: PageSpec): Promise<GeneratedFile[]>
}

const registry = new Map<EmitTarget, Emitter>()

export function registerEmitter(emitter: Emitter): void {
  registry.set(emitter.target, emitter)
}

export function getEmitter(target: EmitTarget = 'static'): Emitter {
  const emitter = registry.get(target)
  if (!emitter) throw new Error(`No emitter registered for target "${target}".`)
  return emitter
}

// Built-in: the default static emitter is always available.
registerEmitter(new StaticEmitter())
