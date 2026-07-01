#!/usr/bin/env python3
"""
audit-claude-folder.py — QUALITY-GATE 구조 감사 (harness-engineering v2.2)

기본 바 10.0 (만점). 단 '티어에 맞는 완전함'이 만점이다 — T-mechanical 에이전트에
T-critical용 중기법을 강제하지 않는다(과설계 방지). 티어는 model: 값으로 추론.

사용:
    python audit-claude-folder.py <project>/.claude --project-root <project> [--bar 10.0] [--frontier-strict]

검사(구조 presence). *의미* 품질(예시 실전성 등)은 Tier-B Architect 리뷰가 최종.
종료 코드: 점수 >= bar → 0, 아니면 1.
2026-06-05 ②: flat skill(skills/*.md) 감사 + Stop 게이트 SCORED 승격(harness total 6.0).
v2.1 → v2.2 (2026-06-10, Fable 5 승계): tier_of() fable/mythos → T-frontier (이전: 미등록 → T-standard
  오분류·과소감사 + REQ 맵 KeyError 리스크). T-frontier 요구 = T-critical 동일(7기법 + SelfVerification 3단).
  --frontier-strict: STRETCH(Adversarial·Consensus)를 T-critical/T-frontier *요구*로 승격 (Master Prompt §12).
  기본 모드는 v2.1과 점수 동일 — 무회귀.
"""
from __future__ import annotations
import argparse, os, re, sys, glob

# Windows cp949 콘솔/파이프에서 박스문자(═·✗) 출력 시 UnicodeEncodeError 방지 — UTF-8 강제.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

DEFAULT_BAR = 10.0

# 모델 → 티어 맵 (model-tiering.md §2 와 동기화. 신모델 시 여기 갱신)
def tier_of(model: str) -> str:
    m = (model or "").lower()
    if "haiku" in m:  return "T-mechanical"
    if "sonnet" in m: return "T-standard"
    if "fable" in m or "mythos" in m: return "T-frontier"   # v2.2: frontier 라인 인지 (2026-06-10)
    if "opus" in m:   return "T-critical"
    return "T-standard"  # 미상 → 표준

def has(text: str, *needles: str) -> bool:
    low = text.lower()
    return any(n.lower() in low for n in needles)

AGENT_ELEMENTS = {
    "Identity":       ("identity",),
    "ContextBinding": ("context binding", "context_binding"),
    "MUST/MUSTNOT":   ("must not", "must_not", "must "),
    "OutputSchema":   ("output schema", "output_schema"),
    "Few-shot":       ("few-shot", "few shot", "good", "bad"),
    "EdgeCases":      ("edge case", "edge_case"),
    "Guardrails":     ("guardrail",),
}
TECH = {
    "NegativeFewShot":      ("bad:", "bad (", "bad —", "안티패턴", "하지 말"),
    "InlineExamples":       ("good:", "```", "예)"),
    "ConfidenceCalibration":("[unverified]", "확신", "85%"),
    "SelfVerification":     ("drift",),
    "ErrorTaxonomy":        ("category", "errortaxonomy", "contract_violation", "severity"),
    "HandoffProtocol":      ("```json", "verdict", "handoff"),
    "Metacognitive":        ("metacognitive", "무엇이 나를", "무엇이 이", "가정"),
}
# 티어별 *요구* 기법 (나머지는 stretch — 없어도 감점 안 함)
REQ_BY_TIER = {
    "T-mechanical": {"NegativeFewShot", "InlineExamples", "ConfidenceCalibration", "SelfVerification"},
    "T-standard":   {"NegativeFewShot", "InlineExamples", "ConfidenceCalibration", "SelfVerification",
                     "ErrorTaxonomy", "HandoffProtocol"},
    "T-critical":   set(TECH.keys()),  # 7기법 전부
    "T-frontier":   set(TECH.keys()),  # v2.2: critical과 동일 + 3단 검증. strict 모드에서 STRETCH 추가 요구.
}
# Perfection Track (frontier 스트레치) — 기본: 보너스 보고용. --frontier-strict: critical/frontier 요구로 승격.
STRETCH = {
    "Adversarial":  ("adversarial", "공격자", "최악의 입력"),
    "Consensus":    ("critic-pro", "critic-con", "합의", "consensus", "judge"),
}

def audit_agent(path: str, strict: bool = False):
    t = open(path, encoding="utf-8").read()
    fm = re.search(r"^model:\s*(.+)$", t, re.M)
    tier = tier_of(fm.group(1) if fm else "")
    gaps, bonus, score, total = [], [], 0.0, 0.0
    # frontmatter (2)
    total += 2
    if fm: score += 1
    else: gaps.append("frontmatter: model 누락")
    if re.search(r"^allowed-tools:", t, re.M): score += 1
    else: gaps.append("frontmatter: allowed-tools 누락")
    # 7요소 (7, 전 티어 공통)
    total += 7
    for name, n in AGENT_ELEMENTS.items():
        if has(t, *n): score += 1
        else: gaps.append(f"요소 누락: {name}")
    # 기법 (티어 요구분만 점수화)
    req = REQ_BY_TIER[tier]
    total += len(req)
    for name in req:
        if has(t, *TECH[name]): score += 1
        else: gaps.append(f"기법 누락[{tier} 요구]: {name}")
    # T-critical / T-frontier 는 SelfVerification 3단(Drift+Cost+Meta) 가산 검증
    if tier in ("T-critical", "T-frontier"):
        total += 1
        if has(t, "drift") and has(t, "cost") and has(t, "meta"): score += 1
        else: gaps.append("SelfVerification 3단(Drift→Cost→Meta) 불완전")
    # stretch: 기본=보너스(점수 미반영) / strict + critical·frontier = 요구(점수화)
    if strict and tier in ("T-critical", "T-frontier"):
        total += len(STRETCH)
        for name, n in STRETCH.items():
            if has(t, *n): score += 1
            else: gaps.append(f"기법 누락[frontier-strict 요구]: {name}")
    else:
        for name, n in STRETCH.items():
            if has(t, *n): bonus.append(name)
    return score / total * 10, tier, gaps, bonus

SKILL_ELEMENTS = {
    "Trigger":      ("trigger", "트리거", "## 1."),
    "Procedure":    ("procedure", "if ", "else"),
    "Example":      ("example", "```"),
    "AntiPatterns": ("antipattern", "anti-pattern", "must not"),
    "NonOverlap":   ("nonoverlap", "non-overlap", "담당", "경계"),
}
def audit_skill(path: str):
    t = open(path, encoding="utf-8").read()
    gaps, score, total = [], 0.0, 6.0
    if re.search(r"^description:", t, re.M): score += 1
    else: gaps.append("frontmatter: description 누락")
    for name, n in SKILL_ELEMENTS.items():
        if has(t, *n): score += 1
        else: gaps.append(f"요소 누락: {name}")
    return score / total * 10, gaps

def audit_harness(claude: str, root: str):
    # 2026-06-05 ②: Stop 게이트 SCORED 승격. total 5.0→6.0 (게이트 +1). main() 호환부 호환 위해 3-tuple 유지(warns=[]).
    gaps, score, total = [], 0.0, 6.0
    s = os.path.join(claude, "settings.json")
    gate_ok = False
    if os.path.exists(s):
        txt = open(s, encoding="utf-8").read()
        if "PostToolUse" in txt: score += 1
        else: gaps.append("settings.json: PostToolUse 누락")
        if "PreToolUse" in txt: score += 1
        else: gaps.append("settings.json: PreToolUse 누락")
        # Stop 게이트 (SCORED): harness-gate.py 가 $CLAUDE_PROJECT_DIR/절대경로로 배선 +
        # guards/harness-gate.py 실존. 상대경로(cwd 의존 silent no-op)·미배선·스크립트 부재는 ✗.
        # JSON 파싱으로 harness-gate command 만 정확히 검사(다른 훅 오판 방지).
        import json as _json
        _gate_cmds = []
        def _walk(o):
            if isinstance(o, dict):
                for k, v in o.items():
                    if k == "command" and isinstance(v, str) and "harness-gate.py" in v:
                        _gate_cmds.append(v)
                    else:
                        _walk(v)
            elif isinstance(o, list):
                for x in o: _walk(x)
        try: _walk(_json.loads(txt))
        except Exception: _gate_cmds = []
        gate_file = os.path.exists(os.path.join(claude, "guards", "harness-gate.py"))
        if not _gate_cmds:
            gaps.append("Stop 게이트(harness-gate.py) 미배선")
        elif any(("$CLAUDE_PROJECT_DIR" not in c and not re.search(r'[A-Za-z]:[\\/]', c)) for c in _gate_cmds):
            gaps.append("Stop 게이트 상대경로(cwd 의존 silent no-op) — $CLAUDE_PROJECT_DIR 필요")
        elif not gate_file:
            gaps.append("Stop 게이트 배선됐으나 guards/harness-gate.py 부재")
        else:
            gate_ok = True
    else: gaps.append("settings.json 누락")
    if gate_ok: score += 1
    if glob.glob(os.path.join(claude, "guards", "*.js")): score += 1
    else: gaps.append("guards/*.js 누락")
    if os.path.exists(os.path.join(root, "docs", "failures", "TEMPLATE.md")): score += 1
    else: gaps.append("docs/failures/TEMPLATE.md 누락")
    cmd = os.path.join(root, "CLAUDE.md")
    if os.path.exists(cmd):
        n = sum(1 for _ in open(cmd, encoding="utf-8"))
        if n <= 60: score += 1
        else: gaps.append(f"CLAUDE.md {n}줄 (60줄 초과)")
    else: gaps.append("CLAUDE.md 누락")
    return score / total * 10, gaps, []

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("claude_dir")
    ap.add_argument("--project-root", default=None)
    ap.add_argument("--bar", type=float, default=DEFAULT_BAR)
    ap.add_argument("--frontier-strict", action="store_true",
                    help="Frontier Perfection Track: STRETCH(Adversarial·Consensus)를 T-critical/T-frontier 요구로 승격 (Master Prompt §12)")
    a = ap.parse_args()
    claude = a.claude_dir.rstrip("/")
    root = a.project_root or os.path.dirname(claude)
    sections = []
    mode = " · frontier-strict" if a.frontier_strict else ""
    print(f"\n══ QUALITY-GATE AUDIT (bar {a.bar}{mode}) : {claude} ══")

    agents = sorted(glob.glob(os.path.join(claude, "agents", "*.md")))
    if agents:
        scs = []
        for p in agents:
            sc, tier, gaps, bonus = audit_agent(p, strict=a.frontier_strict)
            scs.append(sc)
            b = f"  [+Perfection: {', '.join(bonus)}]" if bonus else ""
            print(f"\n[agent] {os.path.basename(p)} ({tier}) : {sc:.1f}/10{b}")
            for g in gaps: print(f"    ✗ {g}")
        sections.append(("Agents", sum(scs)/len(scs), 0.40))
        if len(agents) < 3: print(f"  ⚠ 에이전트 {len(agents)}종 (최소 3 미달)")
    else:
        sections.append(("Agents", 0.0, 0.40)); print("\n[agents] 없음")

    # 2026-06-05 ②: flat skill(skills/*.md)도 감사 — dir형(skills/*/SKILL.md)만 보던 사각 제거(devpilot 14개).
    skills = sorted(glob.glob(os.path.join(claude, "skills", "*", "SKILL.md"))
                    + glob.glob(os.path.join(claude, "skills", "*.md")))
    if skills:
        scs = []
        for p in skills:
            sc, gaps = audit_skill(p)
            scs.append(sc)
            name = os.path.basename(os.path.dirname(p)) if p.endswith("SKILL.md") else os.path.splitext(os.path.basename(p))[0]
            print(f"\n[skill] {name} : {sc:.1f}/10")
            for g in gaps: print(f"    ✗ {g}")
        sections.append(("Skills", sum(scs)/len(scs), 0.30))
        if len(skills) < 2: print(f"  ⚠ 스킬 {len(skills)}종 (최소 2 미달)")
    else:
        sections.append(("Skills", 0.0, 0.30)); print("\n[skills] 없음")

    hsc, hgaps, hwarns = audit_harness(claude, root)
    print(f"\n[harness] {hsc:.1f}/10")
    for g in hgaps: print(f"    ✗ {g}")
    for w in hwarns: print(f"    ⚠ {w}")  # NON-SCORED: ✗ 아님 → audit-all 갭 미집계, 점수 무관
    sections.append(("Harness", hsc, 0.30))

    total = sum(sc * w for _, sc, w in sections)
    print("\n── 요약 ──")
    for n, sc, w in sections: print(f"  {n:8s} {sc:5.1f}/10  (가중 {w:.0%})")
    print(f"  ────────────────")
    print(f"  TOTAL    {total:5.2f}/10   (Tier-A PASS {a.bar})")
    print("  ✅ Tier-A PASS → Tier-B 의미 리뷰로" if total >= a.bar else "  ❌ Tier-A FAIL — 갭 패치 후 재감사")
    return 0 if total >= a.bar else 1

if __name__ == "__main__":
    sys.exit(main())
