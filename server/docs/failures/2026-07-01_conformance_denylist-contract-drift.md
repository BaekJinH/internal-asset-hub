# 2026-07-01 · server/conformance · denylist 계약 drift (packet errata D1)

| 필드 | 값 |
|---|---|
| Date | 2026-07-01 |
| Module | server/conformance/index.ts · src/entities/devpilot/model/devpilot-types.ts |
| Severity | major |
| Session | SoT 게이트 (Rev 1.2 계약 diff) |
| Strike | 1회차 |

## Symptom
Rev 1.2/1.3 packet의 INTERFACE CONTRACT가 `ConformanceTokenSet.denylist`를 `string[]`(금지 리터럴 목록)로 기술. 그러나 shipped `devpilot-types.ts:34`의 실제 shape는 `{ rawColorLiteral: boolean; defaultPalette: boolean }`(enable-flag 객체). Porter가 packet을 믿고 `denylist.includes(...)`로 게이트를 짜면 import한 실 타입(객체)과 **컴파일 불일치**.

## Root Cause
**하네스 버그(SoT 관리)** — packet(문서)을 코드보다 정본처럼 취급하면 이미 shipped된 계약과 drift. host frozen 원칙이 흔들림. (같은 계열: colorLiteralViolations 드롭 D2, resolvedProfileSha 추가 D3.)

## Solution
shipped 코드 = SoT 확정. 엔진은 `devpilot-types.ts`를 `@host-contract`로 **type-only import**(`server/contract.ts`), denylist는 boolean enable-flag 그대로 사용. 실제 금지 패턴/팔레트 DATA는 shared 계약이 아니라 `server/conformance/index.ts`의 `FORBIDDEN_PATTERNS`(엔진내부 상수)로 격리. host 무변경.

## Prevention (백신화 체크)
- [x] CLAUDE.md 규칙: "devpilot-types.ts 수정/포크 금지 — import만" (§3)
- [x] Skill 절차: `conformance-governance` AntiPatterns "denylist를 string[]로 변경 금지"
- [x] Agent: `manifest-architect`/`conformance-validator` Context Binding에 D1 명시
- [x] Contract: `server/contract.ts` type-only 재export로 in-place 참조(drift 구조적 차단)

## Tags
ErrorTaxonomy: `contract_violation · drift`
