# 2026-07-01 · server/.claude/guards · ESM 가드 크래시 + regex 경계 미차단

| 필드 | 값 |
|---|---|
| Date | 2026-07-01 |
| Module | server/.claude/guards/{post-write-check.js, dangerous-command-check.js} |
| Severity | major |
| Session | STEP 2 하네스 산출 |
| Strike | 1회차 |

## Symptom
가드 adversarial 셀프테스트 중 2건: (a) `post-write-check.js`가 `require is not defined in ES module scope`로 크래시 — server/package.json이 `"type":"module"`이라 .js가 ESM. (b) `dangerous-command-check.js`의 src/ 리다이렉트 deny 정규식이 `>` 뒤 `\b` 경계 버그로 `echo x > ../src/foo.ts`를 **미차단**.

## Root Cause
**하네스 버그(가드 저작)** — (a) ESM 패키지 하위 .js에서 CommonJS `require` 사용. (b) 정규식에서 비단어 문자(`>`) 뒤 `\b`는 매칭 안 됨(word boundary 오해).

## Solution
(a) `require('node:fs')` → `import { existsSync, readFileSync } from 'node:fs'`. (b) 리다이렉트/파일조작 패턴 분리: `(?:>|>>)\s*["']?(?:\.\.\/|\/)*src\/` + `\b(?:rm|mv|cp|tee|sed\s+-i)\b[^\n]*\bsrc\/`. 둘 다 재테스트로 teeth 확인(exit 2).

## Prevention (백신화 체크)
- [x] CLAUDE.md/Skill: (해당 없음 — 가드 저작 규칙)
- [x] Hook/Guard: 가드는 **작성 즉시 adversarial 셀프테스트**(blocked/safe/no-crash 케이스) 후에만 신뢰. 이번에 그 자가검증이 실제로 2버그를 잡음.
- [x] Test/fixture: `git switch structure`·`> ../src/`·`rm ../src/` → exit2, 안전 read → exit0 케이스 상시 보관.
- **일반 규칙:** server/ 하위 `.js` 스크립트는 ESM(import)로 작성(package.json `"type":"module"`). CommonJS 필요 시 `.cjs`.

## Tags
ErrorTaxonomy: `env_assumption · resilience`
