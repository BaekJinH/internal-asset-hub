#!/usr/bin/env node
/**
 * dangerous-command-check.js — DevPilot 엔진 PreToolUse(Bash) 가드.
 * 차단 = exit 2 + stderr 사유(Claude Code에 피드백). 통과 = exit 0.
 * 프로젝트 특화 deny: (a) integrate-core-gui 외 브랜치 git op (b) 경로펜스 위반(src/ 수정) (c) 범용 파괴.
 * (ESM — server/package.json "type":"module". 실 백스톱은 permissions.deny; 이 가드는 defensive layer.)
 */
let raw = ''
process.stdin.on('data', (d) => (raw += d))
process.stdin.on('end', () => {
  let cmd = ''
  try {
    cmd = (JSON.parse(raw).tool_input || {}).command || ''
  } catch {
    process.exit(0) // 파싱 불가 → 통과(fail-open)
  }
  const deny = [
    [/rm\s+-rf\s+\/(?!\S)/, 'rm -rf / (루트 삭제)'],
    [/\bDROP\s+(?:TABLE|DATABASE)\b/i, 'DROP TABLE/DATABASE'],
    [/git\s+push\b[^\n]*--force(?!-with-lease)/, 'git push --force (강제 푸시)'],
    [/git\s+(?:checkout|switch)\s+(?:-b\s|main\b|master\b|structure\b|P\/L\b)/, 'integrate-core-gui 외 브랜치 전환/생성 (경로펜스)'],
    [/git\s+(?:reset|rebase|merge)\b[^\n]*\b(?:main|master)\b/, 'main/master 대상 reset/rebase/merge'],
    [/(?:>|>>)\s*["']?(?:\.\.\/|\/)*src\//, 'src/로 리다이렉트 (host frozen, 경로펜스)'],
    [/\b(?:rm|mv|cp|tee|sed\s+-i)\b[^\n]*\bsrc\//, 'src/ 파일 조작 (host frozen, 경로펜스)'],
    [/(?:>|>>|tee|cp)\s+[^\n]*\.env(?![.\w])/, '실 .env 작성 (.env.example만 허용)'],
  ]
  for (const [re, why] of deny) {
    if (re.test(cmd)) {
      process.stderr.write(
        `⛔ [devpilot-guard] 차단: ${why}\n   명령: ${cmd}\n   필요 시 수동 실행 + server/docs/failures/ 기록.\n`,
      )
      process.exit(2)
    }
  }
  process.exit(0)
})
