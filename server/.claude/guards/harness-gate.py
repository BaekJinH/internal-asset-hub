#!/usr/bin/env python3
"""
harness-gate.py — 자기강제 QUALITY-GATE (Claude Code Stop hook)

목적: Claude Code가 턴을 끝내려 할 때(Stop) audit를 돌려 bar 미만이면 '정지'를 막고
      갭 목록을 Claude에게 continuation instruction으로 주입한다.
      → "감사를 기억해서 돌리는 것"이 아니라 "통과 못 하면 못 끝낸다"로 전환.

배선 (.claude/settings.json) — ★command 는 반드시 $CLAUDE_PROJECT_DIR/ 형(상대경로 금지: cwd 의존):
  "hooks": { "Stop": [ { "hooks": [ { "type":"command",
    "command": "python \"$CLAUDE_PROJECT_DIR/.claude/guards/harness-gate.py\"", "timeout":120 } ] } ] }

계약(공식 문서 확인): 차단 = exit 0 + stdout JSON {"decision":"block","reason":...}.
무한루프 방지: stdin의 stop_hook_active 가 true면 즉시 통과(이미 한 번 막았음).
              외부 원인으로 만족 불가능한 게이트는 절대 무한 차단 금지(human escalation).

환경변수: HARNESS_PROJECT_ROOT(미설정 시 __file__ 기반 <root> 파생 — cwd 무관), HARNESS_BAR(기본 10.0).
"""
import json, os, re, subprocess, sys

def allow():        # 정지 허용
    sys.exit(0)

def block(reason):  # 정지 차단 + 지시 주입
    print(json.dumps({"decision": "block", "reason": reason}))
    sys.exit(0)

def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        data = {}

    # ── 무한루프 가드: 이미 이 게이트가 한 번 막아 재진입한 상태면 통과 ──
    if data.get("stop_hook_active"):
        sys.stderr.write("[harness-gate] 이번 턴에 이미 1회 강제했음 → 정지 허용. "
                         "여전히 미달이면 Remediation Protocol(Writer≠Reviewer) + 3-Strike로.\n")
        allow()

    here = os.path.dirname(os.path.abspath(__file__))
    audit = os.path.join(here, "audit-claude-folder.py")  # references/ 와 동일 배치 가정
    if not os.path.exists(audit):
        # 감사 도구 없음 → 게이트 무력(침묵 통과). 설치 위치 확인 필요.
        sys.stderr.write("[harness-gate] audit-claude-folder.py 미발견 → 게이트 비활성.\n")
        allow()

    # 루트 해석: env 우선, 없으면 __file__ 파생(here=<root>/.claude/guards → dirname²=<root>).
    # cwd/서브디렉터리 무관 — 상대 cwd 폴백(os.getcwd())이 만들던 silent no-op 결함(FIX-1) 제거.
    root = os.environ.get("HARNESS_PROJECT_ROOT") or os.path.dirname(os.path.dirname(here))
    claude = os.path.join(root, ".claude")
    if not os.path.isdir(claude):
        allow()  # 게이트할 하네스 없음
    bar = os.environ.get("HARNESS_BAR", "10.0")

    # 자식 audit 의 stdout 을 UTF-8 로 강제(cp949 콘솔에서 박스문자 크래시 방지) + UTF-8 로 디코드.
    child_env = {**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8"}
    res = subprocess.run(
        [sys.executable, audit, claude, "--project-root", root, "--bar", bar],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
        timeout=120, env=child_env,
    )
    if res.returncode == 0:
        allow()  # 통과

    out = res.stdout
    m = re.search(r"TOTAL\s+([\d.]+)/10", out)
    score = m.group(1) if m else "?"
    gaps = [ln.strip() for ln in out.splitlines() if "✗" in ln][:20]
    reason = (
        f"QUALITY-GATE 미통과: {score}/10 < bar {bar}. 끝내기 전에 아래 갭만 incremental 패치하고 재검증:\n"
        + "\n".join(gaps)
        + "\n\n규칙: 전체 재작성 금지. 명시된 갭만. 통과 항목 보존(회귀 금지). "
        "패치 후 audit 재실행해 10.0 확인."
    )
    block(reason)

if __name__ == "__main__":
    main()
