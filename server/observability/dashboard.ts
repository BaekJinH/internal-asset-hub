/**
 * OBSERVABILITY DASHBOARD ((OBS)② UI) — a self-contained HTML page the ENGINE serves on :8787.
 *
 * NOT part of the host SPA (src/ is frozen). No build step, no framework, no external deps — a single string of
 * HTML + inline CSS/JS the node:http transport serves at GET /dashboard. It renders three panels from the engine's
 * own observability endpoints: the pipeline structure (DAG), the §11 worker registry, and a run's StageEvent report.
 *
 * ★ UI-LAYER HONESTY (CTO): the engine layer closed false-observability via INTEGRATED_WORKERS (availability ≠
 *   integration). The UI MUST NOT re-introduce it: a worker whose code path is NOT wired is shown as
 *   "미통합 (deterministic fallback)" in BOTH the registry panel and the per-stage dropdown, and the run report
 *   shows the ACTUAL worker that ran (with the requested one when they differ) — never hiding that a selected-but-
 *   unintegrated worker degraded to the deterministic emitter. These honesty-critical bits are SERVER-RENDERED so
 *   they are testable (observability-ui.selfcheck), not buried in client JS.
 *
 * Live streaming (SSE) is (A)-paired (increment-③): deterministic stages are instant, so the report is fetched
 *   once on completion. The page notes this explicitly rather than faking a live feed (no false "live" cushion).
 */
import type { StageStructure, WorkerListing } from './worker-registry'

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const TIER_CLASS: Record<string, string> = { deterministic: 'det', cloud: 'cloud', local: 'local' }

/** Honest availability/integration badges for a worker (server-rendered → testable). */
export function workerBadgeHtml(w: WorkerListing): string {
  const integ = w.integrated
    ? '<span class="badge ok">integrated</span>'
    : '<span class="badge warn" title="코드 경로가 아직 wired되지 않음 — 선택해도 deterministic emitter가 실행됩니다">미통합 · deterministic fallback</span>'
  const avail = w.available ? '<span class="badge ok">available</span>' : '<span class="badge muted">env 미설정</span>'
  const run = w.runnable ? '<span class="badge ok">runnable</span>' : '<span class="badge muted">not runnable</span>'
  return `${integ} ${avail} ${run}`
}

/** Honest option label for a worker inside a per-stage dropdown. */
export function workerOptionLabel(w: WorkerListing): string {
  if (w.integrated && w.runnable) return `${w.modelId}`
  if (w.integrated) return `${w.modelId} (available 대기)`
  return `${w.modelId} — 미통합 (deterministic 실행)`
}

function tierBadge(tier: string): string {
  return `<span class="badge tier ${TIER_CLASS[tier] ?? ''}">${esc(tier)}</span>`
}

export interface DashboardData {
  structure: StageStructure[]
  workers: WorkerListing[]
  demoManifestId: string
}

/** Render the full dashboard HTML. structure/workers/dropdowns are SSR'd (honest + testable); the run report is
 *  fetched client-side after a POST /generate. */
export function renderDashboard(data: DashboardData): string {
  const { structure, workers, demoManifestId } = data
  const byId = new Map(workers.map((w) => [w.modelId, w]))

  const structureRows = structure
    .map(
      (s) => `<tr>
      <td class="mono muted">${s.order}</td>
      <td class="mono">${esc(s.stageId)}</td>
      <td>${tierBadge(s.tier)}</td>
      <td class="mono muted">${esc(s.kind)}</td>
      <td class="mono">${esc(s.default)}${byId.get(s.default)?.integrated === false ? ' <span class="badge warn" title="이 스테이지의 default 워커는 코드 경로가 wired되지 않음 — 실제로는 deterministic이 실행됩니다">미통합</span>' : ''}${s.availableModels.length > 1 ? ` <span class="muted">(+${s.availableModels.length - 1})</span>` : ''}</td>
      <td>${s.produces ? '<span class="badge ok">produces</span>' : '<span class="badge muted">observes</span>'}</td>
    </tr>`,
    )
    .join('\n')

  const workerRows = workers
    .map(
      (w) => `<tr>
      <td class="mono">${esc(w.modelId)}</td>
      <td>${tierBadge(w.tier)}</td>
      <td class="mono muted">${esc(w.provider)} · ${esc(w.role)}</td>
      <td>${workerBadgeHtml(w)}</td>
    </tr>`,
    )
    .join('\n')

  // per-stage worker dropdowns — only stages that offer a CHOICE (availableModels > 1); honest option labels.
  const controlRows = structure
    .filter((s) => s.availableModels.length > 1)
    .map((s) => {
      const opts = s.availableModels
        .map((m) => {
          const w = byId.get(m)
          const label = w ? workerOptionLabel(w) : m
          return `<option value="${esc(m)}"${m === s.default ? ' selected' : ''}>${esc(label)}</option>`
        })
        .join('')
      return `<tr>
      <td class="mono">${esc(s.stageId)}</td>
      <td><select data-stage="${esc(s.stageId)}">${opts}</select></td>
    </tr>`
    })
    .join('\n')

  const embedded = JSON.stringify({ demoManifestId }).replace(/</g, '\\u003c')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>DevPilot 관측·제어 (:8787)</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0f1115; color: #e6e6e6; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; line-height: 1.5; }
  .wrap { max-width: 78rem; margin-inline: auto; padding: 1.5rem; }
  h1 { font-size: 1.25rem; margin: 0 0 .25rem; }
  h2 { font-size: 1rem; margin: 1.5rem 0 .5rem; color: #b7c0cd; }
  .sub { color: #8b93a1; font-size: .85rem; margin: 0 0 1rem; }
  .panel { background: #171a21; border: 1px solid #262b36; border-radius: .6rem; padding: 1rem; margin-bottom: 1rem; }
  table { width: 100%; border-collapse: collapse; font-size: .82rem; }
  th, td { text-align: left; padding: .4rem .5rem; border-bottom: 1px solid #222732; vertical-align: top; }
  th { color: #8b93a1; font-weight: 600; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .muted { color: #7b8494; }
  .badge { display: inline-block; font-size: .7rem; padding: .1rem .4rem; border-radius: .3rem; border: 1px solid transparent; white-space: nowrap; }
  .badge.ok { background: #123524; color: #7ee2b8; border-color: #1e5b40; }
  .badge.warn { background: #3a2a12; color: #f0c07a; border-color: #6b4e1e; }
  .badge.muted { background: #20242d; color: #8b93a1; border-color: #2c3240; }
  .badge.tier.det { background: #16233a; color: #8ab4f0; border-color: #2a3f63; }
  .badge.tier.cloud { background: #2a1f3a; color: #c79af0; border-color: #4a3a6b; }
  .badge.tier.local { background: #123524; color: #7ee2b8; border-color: #1e5b40; }
  select, input, button { font: inherit; font-size: .82rem; background: #0f1115; color: #e6e6e6; border: 1px solid #2c3240; border-radius: .35rem; padding: .35rem .5rem; }
  button { background: #1e5b40; border-color: #2a7d59; color: #dcffec; cursor: pointer; }
  button:hover { background: #2a7d59; }
  .row { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; margin-top: .75rem; }
  .legend { font-size: .75rem; color: #8b93a1; margin-top: .5rem; }
  .warnbar { background: #3a2a12; color: #f0c07a; border: 1px solid #6b4e1e; border-radius: .4rem; padding: .5rem .75rem; font-size: .82rem; margin-bottom: .75rem; display: none; }
  .st-ok { color: #7ee2b8; } .st-failed { color: #f08a8a; } .st-skipped { color: #8b93a1; }
  .scroll { overflow-x: auto; }
  code { background: #20242d; padding: .05rem .3rem; border-radius: .25rem; }
</style>
</head>
<body>
<div class="wrap">
  <h1>DevPilot 관측·제어 <span class="muted mono">:8787</span></h1>
  <p class="sub">엔진이 자기 파이프라인을 서빙합니다 — 각 스테이지가 어떤 워커로 무엇을 생성하는지. (host <code>/devpilot</code>은 불변 · 이 대시보드는 엔진 URL)</p>

  <div class="panel">
    <h2>① 파이프라인 구조 <span class="muted">(13 stages)</span></h2>
    <div class="scroll"><table>
      <thead><tr><th>#</th><th>stage</th><th>tier</th><th>kind</th><th>default worker</th><th></th></tr></thead>
      <tbody>${structureRows}</tbody>
    </table></div>
  </div>

  <div class="panel">
    <h2>② 워커 레지스트리 <span class="muted">(§11 SoT · 5 workers)</span></h2>
    <div class="scroll"><table>
      <thead><tr><th>modelId</th><th>tier</th><th>provider · role</th><th>상태</th></tr></thead>
      <tbody>${workerRows}</tbody>
    </table></div>
    <p class="legend">★ <b>integrated</b> = 코드 경로가 wired되어 실제로 실행됨 · <b>available</b> = env 설정됨 · <b>runnable</b> = 둘 다. <b>미통합</b> 워커를 선택해도 실제로는 deterministic emitter가 바이트를 생성하며, 리포트는 <i>실제 실행된</i> 워커를 표시합니다(거짓 관측 방지).</p>
  </div>

  <div class="panel">
    <h2>③ 실행 · 제어 <span class="muted">(POST /generate + stageModelOverrides)</span></h2>
    <div class="scroll"><table>
      <thead><tr><th>stage</th><th>worker override</th></tr></thead>
      <tbody>${controlRows || '<tr><td colspan="2" class="muted">선택 가능한 스테이지 없음 (전부 단일 워커)</td></tr>'}</tbody>
    </table></div>
    <div class="row">
      <label class="mono muted">manifestId <input id="manifestId" value="${esc(demoManifestId)}" size="20" /></label>
      <button id="run">▶ 생성 실행</button>
      <span id="status" class="muted"></span>
    </div>
  </div>

  <div class="panel">
    <h2>④ 실행 리포트 <span class="muted">(StageEvent stream · GET /runs/:id/events)</span></h2>
    <div id="warnbar" class="warnbar"></div>
    <div class="scroll"><table>
      <thead><tr><th>#</th><th>stage</th><th>status</th><th>실행 워커</th><th>요약</th><th>artifacts</th></tr></thead>
      <tbody id="events"><tr><td colspan="6" class="muted">아직 실행 없음 — "생성 실행"을 누르세요.</td></tr></tbody>
    </table></div>
    <p class="legend">라이브 SSE 스트리밍은 (A) 짝(③ 증분)에서 활성화됩니다 — 결정적 스테이지는 즉시 완료되므로 지금은 완료 후 1회 리포트. (거짓 "live" 쿠션 안 만듦.)</p>
  </div>
</div>

<script>
  var DATA = ${embedded};
  function el(id){ return document.getElementById(id); }
  function td(html, cls){ return '<td'+(cls?' class="'+cls+'"':'')+'>'+html+'</td>'; }
  function escv(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  el('run').addEventListener('click', function(){
    var manifestId = el('manifestId').value.trim();
    var overrides = {};
    var sels = document.querySelectorAll('select[data-stage]');
    for (var i=0;i<sels.length;i++){ overrides[sels[i].getAttribute('data-stage')] = sels[i].value; }
    el('status').textContent = '실행 중…';
    el('warnbar').style.display = 'none';
    fetch('/generate', { method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ manifestId: manifestId, stageModelOverrides: overrides }) })
      .then(function(r){ return r.json().then(function(b){ return { status:r.status, body:b }; }); })
      .then(function(res){
        if (res.status !== 200){ el('status').textContent = '오류 '+res.status+': '+(res.body.error||JSON.stringify(res.body.issues||res.body)); return; }
        var jobId = res.body.jobId;
        el('status').textContent = 'run ' + jobId;
        return fetch('/runs/'+encodeURIComponent(jobId)+'/events').then(function(r){ return r.json(); }).then(function(b){ renderEvents(b.events||[]); });
      })
      .catch(function(e){ el('status').textContent = '실패: '+e; });
  });

  function renderEvents(events){
    var fellBack = [];
    var rows = events.map(function(e){
      var stCls = e.status==='ok'?'st-ok':(e.status==='failed'?'st-failed':'st-skipped');
      var ran = '<span class="mono">'+escv(e.model)+'</span>';
      if (e.requested && e.requested !== e.model){
        ran += ' <span class="badge warn" title="요청한 워커가 미통합이라 deterministic이 실행됨">요청: '+escv(e.requested)+'</span>';
        if (fellBack.indexOf(e.stageId) < 0) fellBack.push(e.stageId);
      }
      var arts = (e.artifacts||[]).map(function(a){ return '<code>'+escv(a)+'</code>'; }).join(' ') || '<span class="muted">—</span>';
      return '<tr>'+td('<span class="muted mono">'+e.seq+'</span>')+td('<span class="mono">'+escv(e.stageId)+(e.pageId?' <span class="muted">['+escv(e.pageId)+']</span>':'')+'</span>')
        +td('<span class="'+stCls+'">'+escv(e.status)+'</span>')+td(ran)+td('<span class="muted">'+escv(e.outputSummary)+'</span>')+td(arts)+'</tr>';
    }).join('');
    el('events').innerHTML = rows || '<tr><td colspan="6" class="muted">이벤트 없음</td></tr>';
    if (fellBack.length){
      var wb = el('warnbar');
      wb.textContent = '⚠ 요청한 워커가 미통합(코드 경로 없음)이라 deterministic emitter가 실행되었습니다: ' + fellBack.join(', ') + ' — 리포트의 "실행 워커"는 실제 생산자를 표시합니다.';
      wb.style.display = 'block';
    }
  }
</script>
</body>
</html>
`
}
