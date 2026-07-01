# 🏛️ DESIGN PACKET — 회사용 DevPilot **Rev 1.4** (canonical · co-located)

> **정본(SoT) 위치:** 이 파일 = `internal-asset-hub/server/docs/design/` (version-controlled, git = 진실). vault 사본은 미러(diff 시 git 우선).
> **folded:** Rev 1.1(color-token 게이트 재설계) → Rev 1.2(포팅 워크플로) → Rev 1.3(co-located 피벗 + SoT errata D1/D2/D3) → **Rev 1.4(2-Phase grounded · n8n Ollama · PHASE-MAP · 소스 실측 detail)**. Builder가 소스에서 실측해 채움.
> **BINDING 계약 = `src/entities/devpilot/model/devpilot-types.ts`(shipped, host frozen). 엔진은 `server/contract.ts`가 `@host-contract`로 type-only import. 이 문서의 타입 표기는 reference — 분기 시 shipped 파일이 이김.**

---

## 0. 실측 좌표 (STATE-SYNC 2026-07-01)
- **repo:** `D:\tinto-gui\internal-asset-hub` @ `integrate-core-gui` (origin=`BaekJinH/internal-asset-hub`; `old-origin`=삭제된 org repo — 제거 권고).
- **host base SHA:** `46c5fff` (conformanceProfile pin). **Pass-1:** `90a6169`(+`726a1a7` naming) — host devpilot 표면 완료·frozen.
- **엔진 = co-located `server/`** (별도 repo 아님 — Rev 1.2 오류 정정). `devpilot-v2@d262aa3`(`D:\vibeCoding-project`) = read-only 포팅 소스.

## 1. OBJECTIVE / ARCHITECTURE
기획안 → host DS 순응 페이지 자동생성. **Phase-1 cloud analyze → BuildManifest(framework-neutral IR) → Phase-2 local Ollama codegen → emitter(static 기본) → conformance 게이트(emit 후, target 무관).**
- co-located `server/` 근거: `origin/P/L` 브랜치가 이미 co-located `server/`(Express+자체 tsconfig) 보유 = 자기 전례. 런타임은 서버/GPU, 코드만 동일 repo. `server/`는 SPA 번들 미포함(`src/` 밖 + root tsconfig references 제외).

## 2. 모델 아키텍처 (2-Phase · GROUNDED)
| Phase | 역할 | 모델 (실측) | 소스 |
|---|---|---|---|
| **1 이해/analyze** | 기획안→BuildManifest | cloud **Gemini** (`@google/generative-ai ^0.21`) | devpilot-v2 phase_0-3 |
| **2 생성/codegen** | manifest→페이지 | local **Ollama** `qwen3-coder:30b`(codegen/verify)·`qwen3:32b`(이해)·`deepseek-r1:32b`(검증) — 회사서버, cred "Ollama account 2" | n8n v31 S11-S22 |

> **HARD CONSTRAINT(레이아웃 무관):** Ollama = 회사 기존 서버(신규 프로비저닝 아님). 배포: SPA→Vercel · orchestrator→Node 호스트 · Phase-2→회사 Ollama. **vLLM/SGLang 전제 폐기(실제=Ollama).** Ollama e2e는 회사 서버 필요 — 결정적 spine만 로컬 실행 가능.

## 3. PHASE-MAP (STEP 0.5 확정 — 두 자산 dedup)
- **Phase-1 canonical = devpilot-v2 `phase_0`(vision)·`phase_1`(requirements→DevelopmentPlan)·`phase_2`(blueprint→ScreenBlueprint)·`phase_3`(theme→ThemeConfig).** n8n S01-S09는 **도메인 규칙만 흡수**(Screen ID Contract·MVP AC·5대 상태·Route Contract·selector) — 2차 파이프라인 금지.
- **Phase-2 canonical = n8n S11-S22 TS 번역**(Routes/IA·styles.css·Components Contract·partials·화면별 HTML·DOM 정규화/이미지 주입·app.js·**Dynamic Final Repair**·package). devpilot-v2 phase_4 verify 게이트만 흡수(phase_4 자체는 codegen 경로 아님).
- **핸드오프 = shipped `BuildManifest`**: `{ manifestId, sitemap:PageSpec[], sharedComponents:ComponentSpec[], conformanceTokens:ConformanceTokenSet }`. ScreenBlueprint·ThemeConfig·n8n step-context가 여기로 수렴. 경계: devpilot phase_3→4 ≈ n8n S10→S11.
- **cloud/local 물리 분리는 신규 설계**(devpilot=둘다 Gemini, n8n=둘다 Ollama; 어느 쪽도 하이브리드 아님).

## 4. EMITTER (산출 포맷 결정)
static HTML/CSS/JS = **기본 타깃**. React·Vue = **pluggable emitter seam**(처음부터). BuildManifest=neutral IR("무엇"), emitter=target("어떻게"). **MVP=static emitter만**; `AnalyzeRequest.target?` 셀렉터는 non-static emitter 실장 시 additive defer(host frozen).

## 5. INTERFACE CONTRACT errata (SoT 게이트)
- **D1** `ConformanceTokenSet.denylist` = shipped **객체** `{ rawColorLiteral:boolean; defaultPalette:boolean }`(enable-flag). 패턴/팔레트 DATA = `server/conformance` `FORBIDDEN_PATTERNS`(엔진내부). packet의 `string[]`는 errata.
- **D2** `GateReport.dsConformance`는 `colorLiteralViolations:string[]` **포함**(shipped). 엔진 필수 방출.
- **D3** `FTRecord.meta.resolvedProfileSha` 추가(엔진 방출, host 무변경).

## 6. PORTING SCOPE (3-way)
- ✅ **devpilot-v2 adapt:** analyze(phase_0-3) · color-token GATE(design-token-system·output-validator·ajv/zod) · orchestration(phase-chain·cost-guard·retry·batch·variant·per-page-retry). **추출 caveat:** devpilot-v2=Electron monorepo → engine `src/`를 main/renderer/IPC 결합 제거해 추출.
- ✅ **n8n adapt:** Phase-2 S11-S22 구조 · Ollama config(numCtx 16384·numPredict) · Dynamic Final Repair(No-Hardcoded). n8n=JSON → TS 번역.
- ❌ **green-field:** HTTP API 서버(소스=Electron IPC+MCP stdio) · FT corpus writer(devpilot-v2 feedback-store는 prompt-rule ≠ corpus) · checkpoint-resume executor.

## 7. DEPENDENCIES (방향)
Phase-1 `@google/generative-ai ^0.21` · Phase-2 Ollama 클라이언트(`ollama` npm 또는 `/api/generate` fetch) · L4 `playwright ^1.58` · L1 esbuild(재확인). 제거: `openai`(deprecated Kimi) · vLLM/SGLang. **정확한 버전 = STEP 3 소스 대조.**

## 8. AC (CLI 자동검증)
`server/` 독립빌드(`tsc -p server/tsconfig.json --noEmit`) EXIT 0 · SPA 빌드가 server/ 미번들(dist에 server 부재) · 엔진이 shipped 타입 import 컴파일 · color-token 게이트(객체 denylist) 위반0 + `button.tsx` 오탐0 · 3-page fixture→analyze→BuildManifest→generate→emit→L1~L4+color-token pass · 50-page checkpoint 후 재개 시 완료분 skip. **FT corpus는 codegen 검증 후로 시퀀싱.**

## 9. MUST NOT
`devpilot-v2` 수정 · `src/`·기존 host 파일 수정 · `devpilot-types.ts` 수정/포크(import만) · `integrate-core-gui` 외 브랜치 git op · `server/`를 `src/`에 넣거나 SPA가 import · `conformanceTokens` 밖 색/클래스 · Phase-1 페이지마다 호출 · 50+ job checkpoint 없이 · 실 `.env` · 절대경로 하드코딩.

## 10. HARNESS (7-artifact) — server/.claude/ (STEP 2 완료, audit 10.0)
① 루트 `../CLAUDE.md` 경로펜스 라우터 + `server/CLAUDE.md`(엔진) ② Skills: conformance-governance·multipage-orchestration ③ Agents(Writer≠Reviewer): manifest-architect·page-generator·conformance-validator ④ Hooks(PostToolUse color-token·PreToolUse deny-list·Stop harness-gate)·docs/failures ⑤ MCP(job·corpus·conformance) ⑥ 본 문서 ⑦ Memory.

## 11. BUILD SEQUENCE / 진행
STEP 0 STATE-SYNC ✅ · 0.5 PHASE-MAP ✅ · 1 스캐폴딩 ✅ · **3 첫 슬라이스 ✅**(fixture→emit→gate PASS) · 2 하네스 ✅(audit 10.0) · **3-continued(진행):** static emitter fidelity(n8n S11-S22 결정적분) → analyze 추출(devpilot-v2) → Ollama 배선(회사서버) → HTTP → corpus → resume.
