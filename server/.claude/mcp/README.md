# DevPilot Engine MCP (⑤) — scaffold (STEP 3 구현)

Claude Code가 엔진 상태를 이해하는 통로. TS SDK + Zod 입력스키마 + `annotations`(readOnlyHint/destructiveHint). write tool은 **반드시 로그 1줄** 동반(`registerToolWithLogging` 패턴 → 훈련데이터 축적).

## Tools (동사+prefix 네이밍 `devpilot_*`)
| tool | 역할 | 부수효과 |
|---|---|---|
| `devpilot_run_analyze` | 기획안 → BuildManifest (Phase-1) | job 로그 |
| `devpilot_run_generate` | manifest → 페이지 fan-out (Phase-2) | job 로그 + checkpoint |
| `devpilot_run_gate` | GeneratedFile[] → GateReport | 게이트 로그 |
| `devpilot_write_corpus` | gold 산출 → FT corpus (green-field) | corpus append 로그 |

## Resources (readOnly)
| resource | 노출 |
|---|---|
| `devpilot://job/{jobId}` | shipped `JobStatus` (total/completed/failed/checkpointId) |
| `devpilot://conformance/profile` | 해석된 `ConformanceTokenSet` + `resolvedProfileSha` |
| `devpilot://corpus/stats` | FT corpus 통계(gold 비율) |

> 실 구현 = STEP 3 (job·corpus·conformance 동기화). 계약 shape = `../../contract.ts`(@host-contract) 재사용.
