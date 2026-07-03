/**
 * WORKER-MODEL REGISTRY — the §11 single source of truth for every pipeline worker + the stage→worker bindings.
 *
 * WHY (§11 unification, measured): today the 5 worker ids are hand-duplicated across env.example, model-client.ts,
 *   README, and this design packet — only the deterministic sentinel `static-emitter@deterministic` is actually
 *   written (generate/index.ts). Adding/renaming a worker means editing many places (drift). This module is the
 *   ONE place: add a worker to WORKERS, bind it in STAGE_BINDINGS, done.
 *
 * PORT (§3, from devpilot-v2 models/model-router.ts + policies/model-routing-policy.json): the PATTERN
 *   (externalized [stage][role]→worker map, a getForRole resolver, ordered fallback, `.available` gating) is
 *   target-neutral and reused here. EXCLUDED: the Anthropic/Google/Moonshot clients, USD budget guard, and
 *   flash_only_mode (vendor/LLM-coupled). IMPROVEMENT over source: devpilot casts the policy string `as ModelName`
 *   with NO runtime membership check (a typo → undefined-client crash); here every binding is asserted at import
 *   and every external override is zod-validated FAIL-CLOSED against the stage's availableModels.
 */
import { z } from 'zod'

export type Tier = 'deterministic' | 'cloud' | 'local'
export type StageKind = 'deterministic' | 'llm-deferred' | 'mixed'
export type WorkerRole = 'emit' | 'analyze' | 'codegen' | 'understand' | 'verify'

export interface Worker {
  tier: Tier
  provider: 'engine' | 'google' | 'ollama'
  role: WorkerRole
  /** env var that gates availability (presence only — the value is a secret, never read/emitted). undefined = always available. */
  availabilityEnv?: string
}

/** THE WORKER CATALOG (§11 SoT). Deterministic worker is always available; the rest activate when their env lands (A). */
export const WORKERS = {
  'static-emitter@deterministic': { tier: 'deterministic', provider: 'engine', role: 'emit' },
  'gemini-3.5-flash': { tier: 'cloud', provider: 'google', role: 'analyze', availabilityEnv: 'GEMINI_API_KEY' },
  'qwen3-coder:30b': { tier: 'local', provider: 'ollama', role: 'codegen', availabilityEnv: 'OLLAMA_BASE_URL' },
  'qwen3:32b': { tier: 'local', provider: 'ollama', role: 'understand', availabilityEnv: 'OLLAMA_BASE_URL' },
  'deepseek-r1:32b': { tier: 'local', provider: 'ollama', role: 'verify', availabilityEnv: 'OLLAMA_BASE_URL' },
} satisfies Record<string, Worker>

export type ModelId = keyof typeof WORKERS
export const DETERMINISTIC: ModelId = 'static-emitter@deterministic'

export interface StageBinding {
  /** the stage's default nature; a worker's own tier lives on WORKERS. */
  tier: Tier
  kind: StageKind
  /** modelIds allowed for this stage (⊆ WORKERS). An override outside this set is fail-closed. */
  availableModels: ModelId[]
  /** default worker (∈ availableModels). */
  default: ModelId
  /** does this stage CREATE files? (drives the false-observability guard: a producing 'ok' stage must record artifacts.) */
  produces: boolean
  /** execution order for the pipeline-structure DAG. */
  order: number
}

/** THE STAGE→WORKER BINDINGS. Every id here is asserted to exist in WORKERS at import (fail-closed). */
export const STAGE_BINDINGS = {
  'job.run': { tier: 'deterministic', kind: 'deterministic', availableModels: [DETERMINISTIC], default: DETERMINISTIC, produces: false, order: 0 },
  'analyze.plan': { tier: 'cloud', kind: 'llm-deferred', availableModels: ['gemini-3.5-flash'], default: 'gemini-3.5-flash', produces: false, order: 1 },
  'analyze.blueprint': { tier: 'cloud', kind: 'llm-deferred', availableModels: ['gemini-3.5-flash'], default: 'gemini-3.5-flash', produces: false, order: 2 },
  'analyze.manifest': { tier: 'deterministic', kind: 'deterministic', availableModels: [DETERMINISTIC], default: DETERMINISTIC, produces: false, order: 3 },
  'generate.emitShared': { tier: 'deterministic', kind: 'deterministic', availableModels: [DETERMINISTIC], default: DETERMINISTIC, produces: true, order: 4 },
  'generate.cushion.sitemap': { tier: 'deterministic', kind: 'deterministic', availableModels: [DETERMINISTIC], default: DETERMINISTIC, produces: true, order: 5 },
  'generate.cushion.notfound': { tier: 'deterministic', kind: 'deterministic', availableModels: [DETERMINISTIC], default: DETERMINISTIC, produces: true, order: 6 },
  // emitPage is the enrichment seam: deterministic floor NOW, Ollama qwen3-coder:30b body-enrichment is the (A) upgrade.
  'generate.emitPage': { tier: 'deterministic', kind: 'mixed', availableModels: [DETERMINISTIC, 'qwen3-coder:30b'], default: DETERMINISTIC, produces: true, order: 7 },
  'generate.a11y': { tier: 'deterministic', kind: 'deterministic', availableModels: [DETERMINISTIC], default: DETERMINISTIC, produces: false, order: 8 },
  'generate.repair': { tier: 'deterministic', kind: 'deterministic', availableModels: [DETERMINISTIC], default: DETERMINISTIC, produces: false, order: 9 },
  'generate.seo': { tier: 'deterministic', kind: 'deterministic', availableModels: [DETERMINISTIC], default: DETERMINISTIC, produces: false, order: 10 },
  'generate.gate': { tier: 'deterministic', kind: 'deterministic', availableModels: [DETERMINISTIC], default: DETERMINISTIC, produces: false, order: 11 },
  'generate.audit': { tier: 'deterministic', kind: 'deterministic', availableModels: [DETERMINISTIC], default: DETERMINISTIC, produces: false, order: 12 },
} satisfies Record<string, StageBinding>

export type StageId = keyof typeof STAGE_BINDINGS

// ── INTEGRITY ASSERTIONS (fail-closed at import — a mis-registered binding crashes the engine, not a run) ────────
for (const [stageId, binding] of Object.entries(STAGE_BINDINGS as Record<string, StageBinding>)) {
  for (const m of binding.availableModels)
    if (!(m in WORKERS)) throw new Error(`worker-registry: stage "${stageId}" lists unregistered model "${m}"`)
  if (!binding.availableModels.includes(binding.default))
    throw new Error(`worker-registry: stage "${stageId}" default "${binding.default}" not in its availableModels`)
}

/** True if a worker's env config is present (presence only — the value is a secret, never read/emitted).
 *  NOTE: availability ≠ runnability. A worker whose CODE PATH is not yet wired (INTEGRATED_WORKERS) can be
 *  "available" (env set) yet not actually able to produce bytes — see resolveWorker. */
export function isWorkerAvailable(modelId: ModelId, env: NodeJS.ProcessEnv = process.env): boolean {
  const w: Worker = WORKERS[modelId]
  if (!w.availabilityEnv) return true
  const v = env[w.availabilityEnv]
  return typeof v === 'string' && v.length > 0
}

/**
 * ★ INTEGRATION SET — the workers whose CODE PATH actually executes and produces bytes TODAY. This is the
 * anti-false-observability switch (the R-6 vaccine): a worker being env-"available" does NOT mean its integration
 * exists. In (OBS)① only the deterministic static emitter is wired; the Ollama/Gemini codegen paths are the (A)
 * upgrade (increment-③). A stage's RESOLVED worker is only its requested worker when that worker is BOTH
 * integrated AND available — otherwise it degrades to the deterministic default, so the recorded model is always
 * the worker that TRULY produced the output. When increment-③ wires a worker's code path, add it here (one place).
 */
export const INTEGRATED_WORKERS: ReadonlySet<ModelId> = new Set<ModelId>([DETERMINISTIC])

/** True if the engine actually has a code path that runs this worker NOW (not merely env-configured). */
export function isWorkerIntegrated(modelId: ModelId, integrated: ReadonlySet<ModelId> = INTEGRATED_WORKERS): boolean {
  return integrated.has(modelId)
}

/** A worker can actually produce bytes now iff its code path is wired AND its config is present. */
export function isWorkerRunnable(
  modelId: ModelId,
  env: NodeJS.ProcessEnv = process.env,
  integrated: ReadonlySet<ModelId> = INTEGRATED_WORKERS,
): boolean {
  return isWorkerIntegrated(modelId, integrated) && isWorkerAvailable(modelId, env)
}

export interface ResolvedWorker {
  /** the worker requested (override or the stage default). */
  requested: ModelId
  /** the worker that ACTUALLY runs — falls back to the default when `requested` is registered but not yet reachable. */
  actual: ModelId
  /** true when requested !== actual (a valid but unreachable worker degraded to the deterministic default). */
  fellBack: boolean
}

/** zod schema for the external stageModelOverrides input — FAIL-CLOSED: an unknown stage or a modelId outside the
 *  stage's availableModels is a parse error (not a silent default). This is the §11 control-surface guard. */
export const stageModelOverridesSchema = z
  .record(z.string(), z.string())
  .superRefine((overrides, ctx) => {
    for (const [stageId, modelId] of Object.entries(overrides)) {
      // Object.hasOwn — NOT truthy bracket access: an inherited prototype key ('constructor', 'toString', …) used
      // as a stageId must be rejected as unknown, not resolve to Object.prototype.constructor and crash the guard.
      if (!Object.hasOwn(STAGE_BINDINGS, stageId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `unknown stageId "${stageId}"`, path: [stageId] })
        continue
      }
      const binding = (STAGE_BINDINGS as Record<string, StageBinding>)[stageId]
      if (!binding.availableModels.includes(modelId as ModelId))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [stageId],
          message: `model "${modelId}" not registered for stage "${stageId}" (allowed: ${binding.availableModels.join(', ')})`,
        })
    }
  })
export type StageModelOverrides = z.infer<typeof stageModelOverridesSchema>

/**
 * Resolve the worker for a stage. `override` (already shape-valid) is fail-closed against availableModels; a
 * registered-but-unreachable worker degrades to the deterministic default so the recorded worker is the one that
 * ACTUALLY ran (no false observability — mirrors devpilot's `.available` gating without its crash-on-typo).
 */
export function resolveWorker(
  stageId: StageId,
  override?: string,
  env: NodeJS.ProcessEnv = process.env,
  integrated: ReadonlySet<ModelId> = INTEGRATED_WORKERS,
): ResolvedWorker {
  if (!Object.hasOwn(STAGE_BINDINGS, stageId)) throw new Error(`resolveWorker: unknown stage "${stageId}"`)
  const binding: StageBinding = STAGE_BINDINGS[stageId]
  let requested: ModelId = binding.default
  if (override !== undefined) {
    if (!binding.availableModels.includes(override as ModelId))
      throw new Error(`resolveWorker: model "${override}" not registered for stage "${stageId}"`)
    requested = override as ModelId
  }
  // actual = the worker that TRULY runs: the requested worker only if its code path is wired (integrated) AND
  // configured (available), else the deterministic default — so the recorded model never over-claims an
  // unintegrated/unavailable worker (the R-6 / false-observability guard at the resolution layer).
  const actual = isWorkerRunnable(requested, env, integrated) ? requested : binding.default
  return { requested, actual, fellBack: requested !== actual }
}

export interface StageStructure {
  stageId: StageId
  tier: Tier
  kind: StageKind
  produces: boolean
  order: number
  availableModels: ModelId[]
  default: ModelId
}

/** The static pipeline DAG (GET /pipeline/structure) — ordered stages, no run required. Pure projection. */
export function pipelineStructure(): StageStructure[] {
  return (Object.keys(STAGE_BINDINGS) as StageId[])
    .map((stageId) => ({ stageId, ...STAGE_BINDINGS[stageId] }))
    .sort((a, b) => a.order - b.order)
}

export interface WorkerListing {
  modelId: ModelId
  tier: Tier
  provider: Worker['provider']
  role: WorkerRole
  availabilityEnv?: string
  /** env config present (presence only). */
  available: boolean
  /** code path wired to actually run this worker NOW (false = declared/roadmapped, deterministic fallback). */
  integrated: boolean
  /** can produce bytes now (integrated AND available). A worker resolves to itself only when runnable. */
  runnable: boolean
}

/** The worker catalog with computed availability + integration (GET /models). Never emits the env VALUE. */
export function listWorkers(env: NodeJS.ProcessEnv = process.env): WorkerListing[] {
  return (Object.keys(WORKERS) as ModelId[]).map((modelId) => ({
    modelId,
    ...WORKERS[modelId],
    available: isWorkerAvailable(modelId, env),
    integrated: isWorkerIntegrated(modelId),
    runnable: isWorkerRunnable(modelId, env),
  }))
}
