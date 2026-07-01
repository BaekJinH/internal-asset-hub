---
name: conformance-governance
description: >
  DevPilot 산출물의 역전 원칙(host 토큰이 codegen을 지배) 강제 절차. color-token 게이트,
  No-Hardcoded Links/CSS auto-repair, denylist 규약을 다룰 때 반드시 읽는다. "conformance",
  "color-token", "역전 원칙", "게이트", "GateReport", "denylist", "No-Hardcoded", "repair",
  "토큰 순응" 키워드에서 항상 트리거. 정적/React/Vue 어느 emitter든 emit 후 이 게이트가 적용된다.
---

# conformance-governance

## 1. Trigger
codegen 산출물(HTML/CSS/JS/컴포넌트)을 emit하기 **직전·직후**, 또는 conformance 게이트/denylist/repair 로직을 수정할 때 읽는다. emitter 종류와 무관 — 게이트는 emit 후 프레임워크-중립으로 적용된다.

## 2. Procedure (IF/ELSE)   [ConfidenceCalibration]
- 색 판정 (게이트 = `server/conformance/index.ts` `runGate`):
  - IF class/스타일이 색을 실음(`FORBIDDEN_PATTERNS.rawHex` `#hex` OR `rawColorFn` `rgb(<숫자>`) → **violation** (colorLiteralViolations).
  - ELSE IF `rgb(var(--token))` 형태 → 통과 (var()는 리터럴 아님).
  - IF `:root { … }` 토큰 정의 블록 → **면제**(`stripRootBlock`) — 색 소스라 스캔 제외.
- denylist 취급:
  - shipped `ConformanceTokenSet.denylist` = `{ rawColorLiteral: boolean; defaultPalette: boolean }` (enable-flag). 실제 패턴/팔레트 DATA는 `FORBIDDEN_PATTERNS`(엔진내부 상수)에.
  - IF 게이트에 새 금지 패턴 필요 THEN `FORBIDDEN_PATTERNS`에 추가 — **절대 shipped denylist를 string[]로 바꾸지 말 것**(host frozen, D1 errata 재발).
- IF 위반 발견 THEN No-Hardcoded auto-repair(n8n S19/S20 이식분): route alias 링크 정규화 + 로컬 이미지→CSS/inline-SVG + dynamicCssBridge. repair 후 재게이트.
- 진단 짝(3요소): 게이트(`runGate`)=순응 **강제**(hard) · repair(`dynamicFinalRepair`)=**수정** · audit(`server/conformance/quality-audit.ts` `runQualityAudit`, n8n S19 품질검사 이식)=완성도 **점수화**(advisory, `qualityScore=max(0,100−issues·25−warnings·3)`). audit은 게이트를 대체하지 않음 — 밀도/구조/placeholder/미정의 class를 가리켜 보강 지점 안내. 정적 스켈레톤의 밀도 warning은 정상(Ollama 본문 보강 전).
- IF 통과 여부 확신<85% THEN 추측 금지 → 대상 파일 Read 후 재판정([UNVERIFIED]).

## 3. Example   [InlineExamples · CodeGrounding — 심볼 라이브 실재]
```ts
// server/conformance/index.ts — runGate 실동작 (검증됨: server/gate.selfcheck.ts)
const scanned = stripRootBlock(file.content)          // :root 토큰 블록 면제
for (const m of scanned.matchAll(FORBIDDEN_PATTERNS.rawHex))
  colorLiteralViolations.push(`${file.path}: raw hex "${m[0]}"`)
// pass = colorLiteral==0 && token==0 && naming==0  → shipped GateReport.dsConformance
```
```css
/* GOOD (통과): 토큰 소싱 */   .btn { background: rgb(var(--primary)); }
/* BAD (reject): 하드코딩 */   .btn { background: #4f46e5; }   /* colorLiteralViolations */
```

## 4. AntiPatterns (MUST NOT)   [NegativeFewShot]
- MUST NOT: shipped `denylist`를 `string[]`로 변경 — host frozen 위반 + 계약 drift(D1). 패턴은 `FORBIDDEN_PATTERNS`로.
- MUST NOT: `rgb(var(--x))`를 위반으로 잡기 — 오탐. 역전 원칙의 정상 형태(gate self-check가 보증).
- MUST NOT: 게이트를 우회해 "일단 emit" — 형식적 통과가 가장 위험(역전 원칙 형해화).
- MUST NOT: `:root` 채널값(`79 70 229`)을 리터럴로 오검 — 토큰 정의 소스는 면제.

## 5. NonOverlap   [경계]
이 스킬은 **순응 검증 + repair 규약**만 담당. 2-Phase 흐름·페이지 fan-out·checkpoint/resume·emitter 선택은 `multipage-orchestration` 담당. manifest(IR) 설계는 `manifest-architect` 에이전트 담당. 여기서는 "emit된 것이 토큰을 지키는가"만.
