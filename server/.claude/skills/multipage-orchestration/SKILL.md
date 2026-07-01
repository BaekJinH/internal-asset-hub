---
name: multipage-orchestration
description: >
  DevPilot 2-Phase 파이프라인과 다중 페이지 오케스트레이션 절차. Phase-1(cloud analyze)→BuildManifest(IR)
  →Phase-2(local Ollama codegen)→emitter→게이트 흐름, 50+ 페이지 fan-out, checkpoint/resume, JobStatus를
  다룰 때 반드시 읽는다. "2-Phase", "orchestration", "fan-out", "checkpoint", "resume", "JobStatus",
  "50 페이지", "manifest→generate", "emitter 선택" 키워드에서 항상 트리거.
---

# multipage-orchestration

## 1. Trigger
파이프라인 흐름(analyze→generate→emit→gate)을 배선하거나, 다중 페이지 job·checkpoint·resume·emitter 타깃 선택을 다룰 때 읽는다. 단일 페이지 이상을 생성하는 모든 작업의 진입 절차.

## 2. Procedure (IF/ELSE)   [ConfidenceCalibration]
- 경계 계약: Phase-1(`server/analyze` `analyze`, 설계/미구현 STEP 3)은 `BuildManifest`(IR)만 방출, Phase-2(`server/generate` `generate`, 설계/미구현 STEP 3)가 소비. IR = framework-neutral(무엇을) / emitter = target(어떻게).
- emitter 선택 (`server/emitters/index.ts` `getEmitter`):
  - IF target 미지정 → `'static'`(기본, `StaticEmitter`).
  - ELSE IF `'react'`/`'vue'` → (설계/미구현) `getEmitter`가 throw. 계약 확장(`AnalyzeRequest.target?`)은 non-static emitter 실장 시 additive.
- 페이지 fan-out:
  - IF `sitemap.length >= THRESHOLD`(50+) → shared components 1회 생성 후 페이지별 병렬/배치, **각 페이지 emit 후 즉시 conformance 게이트**.
  - 각 페이지: `emitShared` 1회 + 페이지별 `emitPage` → `runGate` → pass면 checkpoint, fail이면 해당 페이지만 retry(≤N).
- checkpoint/resume (`server/jobs` `getJob`, resume executor = 설계/미구현 STEP 3):
  - IF job 중단 후 재개 THEN 완료(checkpointId) 페이지 스킵, 미완만 재생성. shipped `JobStatus{ total, completed, failed, checkpointId }` 반영.
- IF Ollama 엔드포인트/Phase-2 모델 미가용 THEN 추측·발명 금지 → [UNVERIFIED] + 회사 서버 연결 대기(결정적 spine만 실행 가능).

## 3. Example   [InlineExamples · CodeGrounding]
```ts
// 검증된 수직 슬라이스: server/slice.ts (pnpm slice)
const emitter = getEmitter('static')
const files = [...(await emitter.emitShared(manifest))]
for (const page of manifest.sitemap) files.push(...(await emitter.emitPage(manifest, page)))
const gate = await runGate(files)          // emit 후 conformance (multipage → per-page로 확장)
```

## 4. AntiPatterns (MUST NOT)   [NegativeFewShot]
- MUST NOT: Phase-1(analyze)을 페이지마다 호출 — 전역 분석은 1회(비용·일관성). 페이지별은 Phase-2.
- MUST NOT: 50+ job을 checkpoint 없이 실행 — 중단 시 전량 재작업(resilience 손실).
- MUST NOT: emit 후 게이트를 건너뛰고 다음 페이지 — 위반이 누적 전파.
- MUST NOT: emitter를 IR에 종속 결합 — BuildManifest는 target 무관(react/vue 재사용성 파괴).

## 5. NonOverlap   [경계]
이 스킬은 **흐름·fan-out·checkpoint·emitter 선택**만 담당. "emit된 것이 토큰을 지키는가"(color-token 게이트·repair·denylist)는 `conformance-governance` 담당. manifest(IR)의 필드 설계는 `manifest-architect` 에이전트, 정적 마크업 조립은 `page-generator` 에이전트 담당.
