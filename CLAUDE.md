# internal-asset-hub — path-fence router (host ↔ engine)

This repo holds TWO co-located build targets on branch `integrate-core-gui`. Work in the fence for the files you touch.

## `src/` — HOST (React SPA, Feature-Sliced Design)
- Static SPA (Vite 8 / React 19), deployed to Vercel. Tooling convention: **`.agents/`**.
- **Pass-1 devpilot surface is COMPLETE and FROZEN.** Do not modify `src/` or existing host files — engine work is additive under `server/` only.
- The contract `src/entities/devpilot/model/devpilot-types.ts` is the **Source of Truth**. The engine imports it type-only; never edit or fork it.

## `server/` — ENGINE (DevPilot codegen, server-side)
- Separate build target — **never bundled into the SPA** (`server/` is outside `src/`; the SPA never imports it; `server/tsconfig.json` is NOT in root `tsconfig.json` references). Runtime = Node/GPU host, NOT Vercel.
- Tooling convention: **`server/.claude/`** (impl-note #4 — keep host `.agents/` and engine `.claude/` distinct; don't fragment).
- Build/verify: `cd server && pnpm install && pnpm typecheck`.

## Model architecture (2-Phase, grounded)
- **Phase-1 (이해 / analyze)** — cloud Gemini (`@google/generative-ai`), devpilot-v2 `phase_0-3` structure → emits `BuildManifest`.
- **Phase-2 (생성 / codegen)** — local **Ollama** on the company server (`qwen3-coder:30b` codegen, `deepseek-r1:32b` verify), n8n `S11-S22` structure. Consumes `BuildManifest`.
- **Boundary** = shipped `BuildManifest` (framework-neutral IR). **Emitters** are pluggable: `static` (default) / `react` / `vue`.

## Reversal principle
Host design tokens DOMINATE codegen. Generated output must conform to the host `ConformanceTokenSet`; the conformance gate + "No Hardcoded Links/CSS" auto-repair enforce it. `denylist` = boolean enable-flags (shipped shape); forbidden-pattern DATA is engine-internal (`server/conformance`).

## MUST NOT
- Modify `src/` or existing host files · edit/fork `devpilot-types.ts` · touch `devpilot-v2` (read-only source).
- Change any branch other than `integrate-core-gui`.
- Put engine code in `src/` or let the SPA import `server/` (bundle contamination).
- Write real `.env` values (`.env.example` only) · hardcode absolute paths (repo-relative only).
