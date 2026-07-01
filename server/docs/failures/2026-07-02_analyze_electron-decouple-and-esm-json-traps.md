# 2026-07-02 · server/analyze · Electron decouple 실측 + 라이브 포트 함정 (사전 백신)

| 필드 | 값 |
|---|---|
| Date | 2026-07-02 |
| Module | server/analyze (devpilot-v2@d262aa3 phase_0-3 추출) |
| Severity | minor(현 증분) / major(라이브 포트 시) |
| Session | STEP 3-continued · analyze 추출 |
| Strike | 0회차 (선제 백신 — 아직 안 침) |

## Symptom (예상 — 라이브 orchestrator 포트 시 첫 컴파일/런 실패 지점)
extract-first PORT-MANIFEST(2 병렬 에이전트)로 devpilot-v2 phase_0-3를 실측한 결과, **Electron 결합 절단은 사실상 non-problem**(closure에 electron import 0건, 유일 browser API인 `renderer/utils/image-preprocessor.ts` Canvas는 phase0가 `import type`로만 참조). 진짜 험지는 **라이브 Gemini 호출 때만 작동하는 리소스/paths/ESM-JSON/prompt-loader 기계장치**다. 현 증분은 결정적 코어(IR·mapper·seam)만 이식했고 라이브 machinery는 cloud-key 마일스톤으로 defer 했으므로 아직 함정을 치지 않았다. 아래는 **칠 때 터질 것들**을 선제 기록.

## Root Cause (함정 목록 — 발생 확률 순)
1. **`shared/paths.ts` 루트 가정 (1순위 런타임 크래시):** `DEV_ROOT = resolve(SCRIPT_DIR, '../..')`가 "이 파일은 `<root>/src/shared`에 있다"를 하드코딩. `server/analyze/`로 옮기면 `../..`가 엉뚱한 곳을 가리켜 `loadPhase1Prompts`의 `readFileSync('.../prompts/v1/requirements-extract.md')`가 throw. → **`DEVPILOT_ROOT` env 설정 또는 resolver 재작성 먼저.**
2. **Bare JSON import vs Node ESM:** `model-router.ts`(policy 3종)·`validator.ts`(schema 4종)가 `import x from '...json'`. Vite/tsx(`resolveJsonModule`)에선 되나 **순수 Node ESM은 `ERR_IMPORT_ASSERTION_TYPE_MISSING`**. → bundle(esbuild/tsx) 또는 `with { type: 'json' }`.
3. **`.js` 확장 import가 `.ts`를 가리킴:** 모든 내부 import가 `'../x.js'`. tsx/Vite/NodeNext-emit은 OK, 순진한 `ts-node`/`tsc`+run은 해석 실패. → tsx 런타임 또는 bundle.
4. **Validator가 4스키마 eager 컴파일:** `validator.ts`가 phase1만 써도 `screen-blueprint`·`theme-config` schema JSON+zod .ts 전부 필요. `ajv`는 `strict:false`+**`ajv-formats` 필수**(date-time 포맷).
5. **zod 3.x 고정:** 코드가 `result.error.issues`/`.safeParse` 사용. zod 4로 auto-bump 금지(에러 형태 breaking).
6. **ModelRouter ctor 부작용:** Sonnet+Gemini+Kimi 무조건 new. 키 없으면 warn+`available=false`(no throw)이나 `reviewer→kimi`는 fallback 없어 throw — phase1은 review를 try/catch로 감싸 skip. → **extractor+normalizer만 resolve되게**(flash-only 또는 키).
7. **prompt-loader 취약성:** `loadPhase1Prompts`가 `requirements-extract.md`에서 `## System/User/Normalizer/Reviewer Prompt` 4섹션 + 각 ``` fence를 못 찾으면 throw. → md verbatim 복사, 헤더/fence 편집 금지.
8. **FS 쓰기:** `run()`이 `PATHS.runs/<runId>`에 mkdir+3파일 write. → 쓰기 가능 dir 또는 text-in/JSON-out 오버로드로 persistence 옵션화.
9. **dotenv 미자동로드:** dep이나 여기서 자동 안 됨. 서버가 `GEMINI_API_KEY`(+`GEMINI_MODEL_ID`) 직접 로드해야.
10. **Closure 확장 금지:** phase1에 `auto-runner/types.ts` import 금지 — phase0 `ImageInput`+`page-tier-classifier`를 끌어와 phase0/renderer 타입을 되살림.
11. **Phase2/3는 훨씬 큰 포트:** `@sovereign/design-system` 워크스페이스(foundations JSON·token-merger·component-prop-types·presets/screen-patterns fs 트리)를 tsconfig paths로 해석해야 — phase1보다 materially larger.

## Solution (현 증분에서 취한 결정)
- **contract-first 포트:** IR(zod faithful-subset)·host-profile resolver(역전)·결정적 mapper·ModelClient 심만 이식. 라이브 machinery(model-router/clients/ajv-validator/policies/prompt-loader + phase2/3 @sovereign)는 cloud-key 마일스톤으로 defer.
- **typecheck green 유지:** `@google/generative-ai` 정적 import 없음(미설치 dep). 심은 deferred placeholder(`available=false`), WIRING RECIPE는 주석으로 verbatim 기록.
- **역전 원칙:** conformanceTokens=host profile(globals.css 실토큰), ThemeConfig raw-hex는 IR에 유출 금지(self-check가 증명).
- **Phase0 defer:** vision 클라이언트+Canvas-only preprocessor 필요, 출력은 optional hint(phase1 미소비) — 첫 컷 제외.

## Prevention (백신화 체크)
- [x] CLAUDE.md/Skill: analyze는 IR→mapper→emit 흐름을 `multipage-orchestration` 스킬이 커버(2-Phase).
- [x] Hook/Guard: 해당 없음(설계 백신).
- [x] Test/fixture: `analyze.selfcheck.ts` — fixture→validate→map→emit→repair→gate→audit + 역전 no-hex-leak 상시 보관.
- **일반 규칙:** devpilot-v2에서 포트할 땐 **먼저 PORT-MANIFEST(closure 분류·결합점)를 추출**한 뒤 이식(S19/S20/analyze 모두 이 규율로 험지 회피). 라이브 orchestrator를 칠 땐 위 1→11 순서로 방어.

## Tags
ErrorTaxonomy: `env_assumption · resilience · integration_boundary`
