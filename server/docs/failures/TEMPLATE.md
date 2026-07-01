<!-- 복사해서 docs/failures/YYYY-MM-DD_module_symptom.md 로. 모든 실패 = 하네스 백신 후보. -->
# <YYYY-MM-DD> · <module> · <symptom 한 줄>

| 필드 | 값 |
|---|---|
| Date | YYYY-MM-DD |
| Module | <server/... 경로> |
| Severity | critical \| major \| minor |
| Session | <어느 작업 중> |
| Strike | N회차 (동일 모듈 3회 = 3-Strike → 근본 재설계) |

## Symptom
무엇이 관측됐나 (에러·오출력·게이트 결과).

## Root Cause
**코드 버그 vs 하네스 버그** 명시. (같은 이유 2회 = 하네스 버그 — 하네스 수정이 진짜 수정)

## Solution
무엇을 어떻게 고쳤나 (최소 변경).

## Prevention (백신화 체크)
- [ ] CLAUDE.md 규칙 추가?  - [ ] Hook/Guard?  - [ ] Skill 절차?  - [ ] Test/fixture?  - [ ] Contract?

## Tags
ErrorTaxonomy: `contract_violation · security · type_safety · perf · drift · env_assumption · resilience · cost · regression`
