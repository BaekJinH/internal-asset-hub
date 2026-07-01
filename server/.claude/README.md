# Engine harness (`server/.claude/`) — STEP 2 placeholder

Tooling home for the DevPilot **engine** (distinct from the host SPA tooling at repo-root `.agents/` — see impl-note #4 in the root `CLAUDE.md`). Populated in **STEP 2** per the Rev 1.4 HARNESS PLAN ②③④:

- **Skills** — `conformance-governance`, `multipage-orchestration` (+ selected devpilot-v2 inheritances).
- **Agents** (Writer ≠ Reviewer) — `manifest-architect` (P1), `page-generator` (P2), `conformance-validator` (verify).
- **Hooks** — post-generation color-token gate; `docs/failures`; feedback loop; deny-list on `git op` outside `integrate-core-gui`.

> The root `CLAUDE.md` (① path-fence router) covers both host and engine. This dir stays empty until STEP 2.
