# DevPilot Engine (`server/`)

Co-located, server-side codegen engine for the host `/devpilot` feature. **Separate build target — never bundled into the SPA.** Same repo (`internal-asset-hub`), branch `integrate-core-gui`.

## Provenance
- **Phase-1 (analyze)** adapted from `devpilot-v2 @ d262aa3` (`D:\vibeCoding-project\devpilot-v2`) — `phase_0-3`. Read-only source; extract from the Electron monorepo, strip main/renderer/IPC coupling.
- **Phase-2 (codegen)** translated from n8n workflow `v31 - Dynamic Final Repair (No Hardcoded Links/CSS)` — stages `S11-S22`. Local **Ollama** models on the company server: `qwen3-coder:30b` (codegen/verify), `qwen3:32b` (understanding), `deepseek-r1:32b` (validation gates).

## Architecture (PHASE-MAP)
```
Phase-1 (cloud Gemini)  →  BuildManifest (framework-neutral IR)  →  Phase-2 (local Ollama)
 analyze/                    = shipped devpilot-types.ts (SoT)        generate/ → emitters/ → conformance/
```
- `analyze/` — Phase-1 understanding → `BuildManifest`.
- `generate/` — Phase-2 codegen orchestration (fan-out per page).
- `emitters/` — target-pluggable output. **static = default (n8n port)**; react/vue = deferred.
- `conformance/` — reversal gate (structured pass/fail) + "No Hardcoded" auto-repair.
- `jobs/` — orchestration, checkpoint, resume (resume executor = green-field).
- `transport/` — HTTP API server (green-field); host `HttpDevPilotTransport` calls it.

## Boundaries (do not violate)
- The host contract `../src/entities/devpilot/model/devpilot-types.ts` is **frozen SoT**. Import it type-only via the `@host-contract` path alias; never edit or fork it.
- Additive only: nothing under `../src/` is modified. Engine lives entirely under `server/` + the root `CLAUDE.md` router.
- `server/tsconfig.json` is **not** in the root `tsconfig.json` references, so the SPA build (`pnpm build`) never compiles it.

## Build / verify
```bash
cd server
pnpm install
pnpm typecheck    # tsc -p tsconfig.json --noEmit  (gate: EXIT 0)
```
> **SCAFFOLD (STEP 1)** — folders + contract wiring only; all functions throw `SCAFFOLD`. Porting = STEP 3.
> TBD before STEP 3: HTTP framework (express vs fastify), L1 gate tool (esbuild provisional), exact dep versions (reconcile vs devpilot-v2), and static-vs-react emitter priority.
