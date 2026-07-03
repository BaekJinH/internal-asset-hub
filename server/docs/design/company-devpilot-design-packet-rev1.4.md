# 🏛️ DESIGN PACKET — 회사용 DevPilot **Rev 1.4** (canonical · co-located)

> **정본(SoT) 위치:** 이 파일 = `internal-asset-hub/server/docs/design/` (version-controlled, git = 진실). vault 사본은 미러(diff 시 git 우선).
> **folded:** Rev 1.1(color-token 게이트 재설계) → Rev 1.2(포팅 워크플로) → Rev 1.3(co-located 피벗 + SoT errata D1/D2/D3) → **Rev 1.4(2-Phase grounded · n8n Ollama · PHASE-MAP · 소스 실측 detail)** → **Rev 1.4 fold-in(2026-07-03): (B) 결정적 표면 완결 — 레퍼런스→순응 사슬 ①~⑤ + registry + 구조적 쿠션 AS-BUILT, 누적 tooth 자산, router-injector EXCLUDE 판정, 잔여 문서화-수용).**
> **BINDING 계약 = `src/entities/devpilot/model/devpilot-types.ts`(shipped, host frozen). 엔진은 `server/contract.ts`가 `@host-contract`로 type-only import. 이 문서의 타입 표기는 reference — 분기 시 shipped 파일이 이김.**

---

## 0. 실측 좌표 (STATE-SYNC 2026-07-03)
- **repo:** `D:\tinto-gui\internal-asset-hub` @ `integrate-core-gui` (origin=`BaekJinH/internal-asset-hub`; `old-origin`=삭제된 org repo — 제거 권고).
- **host base SHA:** `46c5fff` (conformanceProfile pin). **Pass-1:** `90a6169`(+`726a1a7` naming) — host devpilot 표면 완료·frozen.
- **엔진 HEAD:** `c3868bd` 관측·제어 골격 (OBS)①(§17). (`08e1ff1` escape 하드닝 §15-1 ← `ab31e2f` Rev1.4 fold-in ← `43abdbf` (B)⑤). **엔진 = co-located `server/`** (별도 repo 아님). `devpilot-v2@d262aa3`(`D:\vibeCoding-project`) = read-only 포팅 소스.
- **엔진 서빙 MVP 확정(2026-07-03):** 엔진 관측 UI는 `:8787` 별도 URL로 서빙, **`src/` 불변·경로펜스 무전환**. 검증 후 host `/devpilot` 임베드는 팀 조율 후. → 팀 코드베이스 조율 없이 결정적으로 진행 가능.
- **★ 트랙 상태:** (B) **결정적 표면 완전 폐쇄**. 잔여 = 사실상 (A) 외부 관문(Gemini 키 + Ollama 서버) — 코드 아닌 provisioning. §12~§16 참조.

## 1. OBJECTIVE / ARCHITECTURE
기획안 → host DS 순응 페이지 자동생성. **Phase-1 cloud analyze → BuildManifest(framework-neutral IR) → Phase-2 local Ollama codegen → emitter(static 기본) → conformance 게이트(emit 후, target 무관) → 구조적 쿠션(a11y/seo/sitemap/404).**
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
- ✅ **devpilot-v2 adapt:** analyze(phase_0-3) · color-token GATE(design-token-system·output-validator·ajv/zod) · orchestration(phase-chain·cost-guard·retry·batch·variant·per-page-retry) · **레퍼런스 프로젝트 추출/카탈로그/선택/조립(post-processor 계열)** · **구조적 쿠션(a11y/seo/sitemap)**. **추출 caveat:** devpilot-v2=Electron monorepo → engine `src/`를 main/renderer/IPC 결합 제거해 추출.
- ✅ **n8n adapt:** Phase-2 S11-S22 구조 · Ollama config(numCtx 16384·numPredict) · Dynamic Final Repair(No-Hardcoded). n8n=JSON → TS 번역.
- ❌ **green-field / EXCLUDE:** HTTP API 서버(소스=Electron IPC+MCP stdio) · FT corpus writer(devpilot-v2 feedback-store는 prompt-rule ≠ corpus) · checkpoint-resume executor · **profile registry(레퍼런스 매핑 — green-field, 소스에 선례 없음)** · **router-injector(React-SPA 방출 — §3 EXCLUDE, §13)** · **render-verify/responsive-verify(Playwright 의존 — DEFERRED, §13)**.

## 7. DEPENDENCIES (방향)
Phase-1 `@google/generative-ai ^0.21` · Phase-2 Ollama 클라이언트(`ollama` npm 또는 `/api/generate` fetch) · L4 `playwright ^1.58`(render-verify 실장 시) · L1 esbuild(재확인) · zod `^3.23.8`(실장, 레퍼런스 fail-closed 검증). 제거: `openai`(deprecated Kimi) · vLLM/SGLang.

## 8. AC (CLI 자동검증)
`server/` 독립빌드(`tsc -p server/tsconfig.json --noEmit`) EXIT 0 · SPA 빌드가 server/ 미번들(dist에 server 부재) · 엔진이 shipped 타입 import 컴파일 · color-token 게이트(객체 denylist) 위반0 + `button.tsx` 오탐0 · 3-page fixture→analyze→BuildManifest→generate→emit→L1~L4+color-token pass · 50-page checkpoint 후 재개 시 완료분 skip. **FT corpus는 codegen 검증 후로 시퀀싱.**

## 9. MUST NOT
`devpilot-v2` 수정 · `src/`·기존 host 파일 수정 · `devpilot-types.ts` 수정/포크(import만) · `integrate-core-gui` 외 브랜치 git op · `server/`를 `src/`에 넣거나 SPA가 import · `conformanceTokens` 밖 색/클래스 · Phase-1 페이지마다 호출 · 50+ job checkpoint 없이 · 실 `.env` · 절대경로 하드코딩.

## 10. HARNESS (7-artifact) — server/.claude/ (STEP 2 완료, audit 10.0)
① 루트 `../CLAUDE.md` 경로펜스 라우터 + `server/CLAUDE.md`(엔진) ② Skills: conformance-governance·multipage-orchestration ③ Agents(Writer≠Reviewer): manifest-architect·page-generator·conformance-validator ④ Hooks(PostToolUse color-token·PreToolUse deny-list·Stop harness-gate)·docs/failures ⑤ MCP(job·corpus·conformance) ⑥ 본 문서 ⑦ Memory.

## 11. BUILD SEQUENCE / 진행
STEP 0 STATE-SYNC ✅ · 0.5 PHASE-MAP ✅ · 1 스캐폴딩 ✅ · **3 첫 슬라이스 ✅**(fixture→emit→gate PASS) · 2 하네스 ✅(audit 10.0) · **3-cont ✅(결정적 완결):** static emitter fidelity → Dynamic Final Repair → quality audit(S19) → analyze(phase_0-3, cloud deferred) → HTTP transport → **(B) 레퍼런스→순응 사슬 ①~⑤ + registry**(§12) → **구조적 쿠션**(§13) → **emitter/repair escape 하드닝**(§15-1, 커밋 `08e1ff1`) → **serve.ts 엔진 HTTP bootstrap** → **관측·제어 골격 (OBS)①**(§17, 커밋 `c3868bd`; 워커 레지스트리 §11 단일화 + StageEvent + 거짓-관측 guard). **잔여 = (A) 외부 관문**(§16) + 관측 ②UI/③라이브(§17.1) + FT corpus + resume executor.

---

# AS-BUILT (Rev 1.4 fold-in · 2026-07-03) — (B) 결정적 표면 완결

## 12. (B) 레퍼런스→순응 사슬 — AS-BUILT (increments ①~⑤ + registry)
**★ 전 사슬이 LLM 없이 결정적으로 작동:** `레퍼런스+기획안 → 카탈로그 → 선택 → 조립 → emit → repair → gate → audit → registry(transport) → 구조적 쿠션(a11y/seo/sitemap/404)`.

### 12.1 결정적 floor (①~⑤ 이전, 이미 완결)
| 기법 | 커밋 | 소스 | 성격 |
|---|---|---|---|
| static emitter (수직 슬라이스) | `0c4c889` | n8n S11-S22 | 모든 색 `rgb(var(--token))`, host-conformant 방출 |
| Dynamic Final Repair (No-Hardcoded) | `b82fd55` | n8n | 로컬 img strip · 내부링크 정규화(절대 https skip) |
| quality audit (S19) | `b17d8c1` | n8n S19 | score=max(0,100−issues·25−warn·3), `.html`만 |
| analyze (phase_0-3 추출) | `fbf4d70` | devpilot-v2 | 기획안→BuildManifest IR (cloud Gemini deferred) |
| HTTP transport + generate/job 배선 | `5f1bc6f` | green-field | node:http seam, 결정적 generate |

### 12.2 레퍼런스→순응 사슬 (increments ①~⑤ — 이 트랙의 핵심)
> 커밋 **순서 ≠ 증분 번호**(번호=논리 파이프라인 순서, 커밋=시간순). 정직 기록.

| # | 증분 | 커밋 | 무엇을 결정적으로 닫았나 |
|---|---|---|---|
| **①** | 레퍼런스 추출 | `3d28222` | 퍼블리셔 레퍼런스 프로젝트 → cushion 카탈로그 + reference-driven conformance profile. 순응 소스가 "레퍼런스 프로젝트"(복리 자산)로 확정. |
| **②** | 레퍼런스 loader | `c437dde` | fs 발견 + zod fail-closed + brace-aware CSS 토큰 파서(`--name: R G B` 채널 토큰). 디스크 레퍼런스 → 검증된 IR. |
| **③** | 선택 + 단일페이지 조립 | `bf0d48f` | 카탈로그에서 결정적 선택 → 페이지 조립. reference-profile 파서 하드닝. |
| **④** | **profile registry** | `15e8d85` | **deviation #2 폐쇄:** `conformanceProfile:string`가 이제 **resolution KEY**(과거=inert label). registry가 `reference.config.profileId === 등록키`를 **fail-closed assertion**으로 강제. `analyze()`가 레퍼런스를 **결정적으로 resolve** → **one-flip**(§16). loader symlink 펜스 하드닝(§15) 동반. |
| **⑤** | 구조적 쿠션 | `43abdbf` | a11y/seo/sitemap/404 — §13. |

### 12.3 registry one-flip (deviation #2 폐쇄의 배당)
- `analyze(req, registry, client)`가 `registry.resolveReference(req.conformanceProfile)?.profileSource`를 **cloud 게이트 이전에** resolve → `buildManifestFromPhases(plan, blueprint, req, reference)`로 thread.
- **지금:** registry EMPTY 시작(backward-compatible) → 레퍼런스 없으면 host fallback. **Gemini 키 landing 순간(503→200):** 레퍼런스가 **추가 배선 0**으로 소비됨. 이것이 one-flip.
- `createEngineServer({ registry })` — transport `/analyze`가 registry 주입 받음.

## 13. 구조적 쿠션 (⑤) + 경계 판정
### 13.1 포팅된 쿠션 (결정적, browser-less, in-memory, `server/post-process/`)
- **a11y-fixer** — img alt · 빈버튼/미라벨input accessible-name · html lang 주입 · heading-skip 감지. JSX→HTML(`className→class`, `htmlFor→for`), fs→in-memory decouple. **저대비 Tailwind 계열 제외**(host 출력에 매칭 불가 + color 게이트 중복 + `gray-400→gray-500` fix가 되레 게이트 트립).
- **seo-injector** — per-page meta/OG/Twitter/JSON-LD. **소스 버그 수정: canonical을 전 페이지 홈으로 하드와이어 → per-page self-canonical.** 멱등 sentinel `<!-- devpilot:seo:start/end -->`.
- **sitemap-generator** — sitemap.xml + robots.txt (site-level, manifest당 1회). **결정성 수정: `lastmod`=주입 seed(부재 시 생략), `new Date()` 아님.** `<loc>` XML-escape.
- **neutralize** — 공유 방어 계층(hex/rgb→엔티티, JSON-LD `<>&#`→`\uXXXX`). 쿠션이 자기 방출 텍스트에 우연히 게이트 패턴을 만들지 않도록.
- **토큰전용 404.html** — router-injector에서 살린 유일한 정적 조각.
- **generate 배선:** a11y=repair **전**(img-alt가 local-image strip보다 먼저), SEO=repair **후** 자기 페이지 파일에만, site-file은 번들+게이트하되 per-page audit identity-제외(404 희소가 페이지 점수를 끌지 않게).

### 13.2 router-injector = §3 EXCLUDE (독립 2 에이전트 동일 결론)
- devpilot router-injector = **React-Router SPA 방출**(react-router-dom·JSX Routes·ReactDOM·raw Tailwind 팔레트·하드코딩 404 JSX). 유일한 중립 코어(route→nav)는 **이미 중복** — 정적 라우팅은 emitter `<nav aria-current>` + dynamicFinalRepair route-alias/link-normalization이 담당.
- → SPA 조립기 **제외**(react-emitter 실장 시 defer), **토큰전용 404.html만 포팅.** 이것이 §10(Architect 지시 목록을 Builder가 출처 실측으로 정정, 벌점 없이 채택)의 실사례.

### 13.3 render-verify/responsive-verify = DEFERRED (false-cushion 회피)
- extract-first 측정: 두 파일 모두 `playwright chromium` **실렌더 의존** 실증 확인.
- JSDOM 대체는 "렌더 검증됨"이라 **주장**하나 실제 미검증 → **거짓 쿠션**(쿠션 없는 것보다 나쁨). **짓지 않음.** Playwright + 실 콘텐츠 후로 defer.

## 14. 누적 tooth 자산 (하네스 복리 — 실측 2026-07-03)
> 각 self-check = 결정적 `tsx` 스크립트(no cloud/browser). "한 번 뚫린 구멍은 두 번 안 뚫린다" — 적대적 리뷰가 잡은 실버그마다 전용 회귀 tooth.

| suite | teeth (실측) | 성격 |
|---|---:|---|
| `gate:self` | clean/dirty pair (5 sub-assert, consolidated) | no false pass / no false positive |
| `repair:self` | 9 | No-Hardcoded 정규화 |
| `quality:self` | 14 | S19 audit 스코어링 |
| `analyze:self` | 19 | phase_0-3 → IR |
| `transport:self` | 12 | HTTP seam + registry 주입 |
| `reference:self` | **36** | 레퍼런스 추출/파서/카탈로그 |
| `selection:self` | 21 | 선택 + 단일페이지 조립 |
| `loader:self` | 20 | fs 발견 + zod fail-closed + symlink 펜스 |
| `registry:self` | 22 | resolve/assertion/one-flip/transport |
| `cushion:self` | **28** | a11y/seo/sitemap dirty-HTML + 하드닝 10 tooth |
| `emit-escape:self` | **18** | §15-1 escape: injection/gate-trip/faithfulness + 적대리뷰 F1~F5·G1/G2 회귀 |
| `observability:self` | **32** | (OBS)① registry·resolution·structure·거짓-관측(R-6)·빈run·HTTP + 적대리뷰 회귀 |
| **합계(named)** | **≈231 + gate** | 결정적 회귀 방어망 |

> **정정(verify-first):** 이전 세션 회상은 "reference 24→34, cushion 26"이었으나 **실측 = reference 36, cushion 28.** 정본은 실측치 채택.

## 15. 잔여 문서화-수용 + deferred 하드닝
1. **✅ emitter/repair escape 하드닝 = CLOSED (커밋 `08e1ff1`, §15-1).** static-emitter가 `page.title`/section/nav/id/manifestId를 unescaped 보간하던 갭을 봉쇄: `esc()`(HTML-escape `&<>"'` + `#hex`/`rgb()/hsl()` 중립화)를 free-text 보간 6곳 전부에 적용; `routeToFile()`이 segment를 URL/filename-safe 슬러그로 정화(스킴 콜론·따옴표 strip → nav href escape 불필요·repair alias map 동기·`javascript:` 스킴 차단); repair `escAttr`/`#fragment`/external-URL 브랜치 color-neutralize; `notFoundSpec` 중복 pre-neutralize 제거(double-encode 해소); SEO canonical + sitemap `<loc>`가 pathological `rgb(` route 중립화. **적대적 리뷰(3 렌즈, per-finding refute-verify) 5 confirmed 전부 tooth로 수정**(F1 404 double-encode·F4 `javascript:` XSS·F5 href-alias desync·F2 img-alt·F3 #fragment) + **focused 재리뷰 G1/G2**(repair verbatim 브랜치·SEO/sitemap URL) 닫음. `emit-escape:self` 18 tooth.
   - **잔여 defer(게이트-레이어 concern, 정직 기록):** repair의 **external-`<img>` 태그**는 verbatim 보존되어 alt/style의 hex가 남을 수 있음 — 여기서 중립화하면 inline `style`의 **진짜** color 위반을 masking하므로(over-escape가 실 위반 은폐) sink가 아닌 **게이트-레이어 context 구분** 문제. 동류로 ecommerce 카테고리 JSON-LD의 `rgb(`꼴 raw-route(극단적 pathological). 둘 다 정상 slug 파이프라인 미도달(routes=slugified), 방어는 게이트 refinement 또는 (A) 이후 enrichment 하드닝으로.
2. **loader realpath 펜스 (④에서 하드닝, live 검증 대기):** `confinedPath`가 lexical-only였던 것을 realpath 재-assertion으로 봉쇄(②의 펜스 갭). **production bootstrap이 references-root를 populate할 때 실 배포 환경(OS symlink 차이)에서 live 검증 필요.**
3. **ftRecord.meta.timestamp = wall-clock** (provenance 의도; `files`는 결정적이라 게이트/배포 무영향). 수용.
4. **404 route serving = host rewrite 설정** (배포 관심사; 404.html 방출은 결정적). 수용.
5. **routeToFile charset `[A-Za-z0-9._-]` ⊃ 게이트 KEBAB `[a-z0-9-]`** (pre-existing): 대문자/`_`/`.` route는 filename이 namingViolations 트립 — 게이트가 non-kebab route를 올바르게 거부하는 것(intended). 수용.

## 16. 잔여 = (A) 외부 관문 (코드 아닌 provisioning)
| 관문 | 상태 | 열리는 순간 |
|---|---|---|
| **Gemini API 키** | 로컬 `.env` 대기(`.env.example`만 커밋, repo·채팅 금지) | analyze **503→200 one-flip** — 레퍼런스 소비 배선 완료(§12.3). codegen은 이미 정적 floor로 페이지 생성 중 = **가장 싼 라이브 경로.** |
| **회사 Ollama 서버** | 엔진에서 네트워크 도달 확인 대기(엔드포인트·방화벽) | 페이지 **본문 보강**(qwen3-coder:30b) → "레퍼런스+기획안 → 실 콘텐츠 페이지" e2e 완성. |

> **소진 신호:** ⑤로 결정적으로 남는 큰 건이 사실상 소진. 남은 두 갈래 = (A) 외부 관문(진혁님 provisioning) + 잔여 하드닝(§15, 특히 emitter escape). one-flip 라이브 검증 시 11개 사전 백신(analyze/transport 계열) 방어 하에 e2e.

---

# OBSERVABILITY & CONTROL 트랙 (2026-07-03~) — 관측·제어 레이어

## 17. OBSERVABILITY LAYER (엔진 서빙 MVP, `:8787` 별도 URL, `src/` 불변)
**목적:** 파이프라인을 구조도로 보고, 스테이지별 상태/모델/생성물을 관측하고, 스테이지별 워커모델을 제어. **엔진이 자기 관측 UI를 `:8787`로 서빙**(host `/devpilot` 임베드는 검증 후 팀 조율 — 경로펜스 무전환).

### 17.1 트랙 시퀀스 (각 별도 Gate)
- **① 관측·제어 엔진 골격 (지금·결정적) — AS-BUILT ✅ (커밋 `c3868bd`):** §17.2.
- **② 관측 UI (serve.ts가 대시보드 정적 서빙):** 구조도 패널 + 스테이지별 상태/모델/생성물(StageEvent 렌더) + 모델 선택 드롭다운(`GET /models`→override→POST). 리포트(저장 events) 먼저, SSE 라이브 스트리밍 스캐폴딩은 (A) 짝. **src/ 불변.**
- **③ (A) 짝 — 라이브 활성화:** SSE 실스트리밍 + 워커모델 실호출(Gemini/Ollama) + 실 cost/duration. Gemini 키 + Ollama 서버 열릴 때. **★ 이때 `INTEGRATED_WORKERS`에 해당 워커 추가(1곳) = 코드경로 wired 선언 → resolveWorker가 실제 실행 워커를 기록.**

### 17.2 increment-① AS-BUILT (관측·제어 엔진 골격)
**★ StageEvent 위치 = server DTO** (frozen `devpilot-types.ts` 미변경, MVP 락 준수; `:8787` 엔진-내부라 host 미소비). shipped shape 재사용(FTRecord.meta·PageError·Gate/Quality/Repair/A11yReport = detail) — 병렬 vocabulary 안 만듦.

| 산출 (`server/observability/`) | 무엇 |
|---|---|
| **worker-registry.ts** | **§11 단일 SoT** — 5 워커 카탈로그(`static-emitter@deterministic`·`gemini-3.5-flash`·`qwen3-coder:30b`·`qwen3:32b`·`deepseek-r1:32b`) + 13 스테이지 바인딩 `{tier,kind,availableModels,default,produces,order}`. import-time integrity assert. `stageModelOverridesSchema`(zod, **`Object.hasOwn` fail-closed**). **★ `INTEGRATED_WORKERS`**(코드경로 실존 워커) — resolveWorker는 **integrated AND available**일 때만 `actual=requested`, 아니면 결정적 fallback. |
| **stage-events.ts** | `StageEvent` DTO + `StageEmitter`(결정적 seq) + **`verifyRunObservability`**(거짓-관측 guard, devpilot `verifyActualVsIntended` 포팅: 산출물 미기록/phantom artifact 잡음). |
| **transport 엔드포인트** | `GET /pipeline/structure`(구조도) · `GET /models`(레지스트리+availability+integration) · `GET /runs/:id/events`(리포트) · `POST /generate` + `stageModelOverrides`(fail-closed). |
| **generate/jobs 배선** | 전 스테이지 방출(결정적 포함, 즉시 done이나 관측 가능); **artifacts=실제 출력 파생**(하드코딩 금지); 버려지던 Repair/A11yReport를 detail로 포착; resolved worker를 `ftRecord.meta.model`에 stamp; `producedPaths`(독립 actual-truth) 노출. emitter 없으면 기존과 byte-identical. |

**★ CTO 거짓-관측 방지(핵심):** 적대적 리뷰가 **바로 그 R-6 갭**을 잡음 — `isWorkerAvailable`이 env 존재만 봐서, OLLAMA_BASE_URL 세팅(임박) + override `qwen3-coder:30b` 시 event/ftRecord가 `qwen3-coder:30b`를 기록하는데 실제론 static emitter가 바이트 생성(Ollama 코드경로 미존재). → **`INTEGRATED_WORKERS` 도입으로 봉쇄**: 코드경로 wired가 아니면 override해도 결정적 fallback, 기록 model = **실 바이트생산자**(requested는 별도 surface). `observability:self`에 R-6 closure tooth(override qwen+env→deterministic 기록) 3개 + prototype-pollution(→400) 2개.

**적대적 리뷰:** 3 렌즈 per-finding refute-verify → **4 confirmed 전부 tooth**(MAJOR×2 R-6 availability≠integration · MAJOR prototype-pollution fail-closed 우회 · NIT stray) + **3 refuted 정확 기각**(unified-override 관용·analyze-default latent·partial-failure는 guard가 잡으면 오히려 오작동). `observability:self` **32 tooth**. 전 12-스위트 green.

### 17.3 잔여 defer (관측)
- **analyze.* 스테이지는 /generate run에서 미방출**(정직한 부재 — override는 unified vocabulary라 수용되나 no-op). analyze 이벤트는 (A)에서 analyze 라이브 시 방출.
- **runtime verifyRunObservability 미배선**(현재 self-check tooth로만; partial-failure를 오탐하지 않도록 runtime gate는 신중히 — ② 또는 ③에서 shipped-page scope로).
- **live cost/duration = (A) 짝**(결정적 스테이지는 즉시라 라이브 값 작음; Ollama 붙으면 빛남).
