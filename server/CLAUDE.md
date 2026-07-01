# CLAUDE.md — DevPilot Engine (server/)
> Last updated: 2026-07-01 · 모든 줄은 과거 실패에 대한 백신. 상위 라우터: `../CLAUDE.md`(경로펜스).

## §0 Identity
회사용 DevPilot codegen 엔진(co-located, `internal-asset-hub/server/`, 브랜치 `integrate-core-gui`). 기획안→host DS 순응 페이지 자동생성. Phase-1 cloud analyze → BuildManifest(IR) → Phase-2 local Ollama codegen → static emitter → conformance 게이트.

## §1 Tech Stack
| 층 | 스택 |
|---|---|
| Phase-1 analyze | cloud Gemini `@google/generative-ai` (설계/미구현 STEP 3) |
| Phase-2 codegen | local Ollama `qwen3-coder:30b` 회사서버 (설계/미구현 STEP 3) |
| emit | `StaticEmitter`(기본) · react/vue pluggable(defer) |
| 계약 SoT | `../src/entities/devpilot/model/devpilot-types.ts` |

## §2 Architecture
`analyze/ generate/ emitters/ conformance/ jobs/ transport/` + `contract.ts`(@host-contract, type-only). 원칙 3: ① BuildManifest = framework-neutral IR ② 역전 원칙(host 토큰이 codegen 지배) ③ emit 후 게이트(target 무관).

## §3 Claude Code Rules
- Read-before-Write. 전체 재작성 금지 — 갭만 incremental.
- 금지: `src/`·기존 파일 수정 · `devpilot-types.ts` 수정/포크(import만) · `devpilot-v2` 수정 · `integrate-core-gui` 외 브랜치 git op.
- 버전·환경 추측 금지 → Read/위임.

## §4 Security
- 실 `.env` 금지(`.env.example`만). Ollama 엔드포인트=회사 cred, export 금지.
- `server/`는 SPA 번들 미포함(`src/` 밖 + root tsconfig references 제외).

## §5 Phase Roadmap
- [x] STEP1 스캐폴딩 · [x] STEP3 수직슬라이스(static emit+게이트 PASS) · [ ] STEP2 하네스(현재) · [ ] STEP3-cont(analyze 추출·n8n S11-S22·Ollama·HTTP·corpus·resume)

## §6 Emergency
| L | 상황 | 조치 |
|---|---|---|
| L1 | 게이트 오탐 | `gate.selfcheck.ts` 기준 대조 |
| L2 | 계약 drift | `devpilot-types.ts` diff, host 우선 |
| L3 | 브랜치 오염 | integrate-core-gui 외 변경 즉시 중단 |

## §7 Commands
`pnpm typecheck` · `pnpm slice` · `python .claude/guards/audit-claude-folder.py .claude --project-root .`

## §8 Skill Reference
| 작업 | 스킬/에이전트 |
|---|---|
| 순응·게이트·repair | `conformance-governance` / `conformance-validator` |
| 2-Phase·fan-out·resume | `multipage-orchestration` |
| manifest(IR) 설계 · 정적 조립 | `manifest-architect` / `page-generator` |
