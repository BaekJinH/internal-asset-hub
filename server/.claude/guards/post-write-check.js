#!/usr/bin/env node
/**
 * post-write-check.js — DevPilot 엔진 PostToolUse(Write|Edit) 색-토큰 어드바이저리.
 * 역전 원칙 조기 경보: 생성/편집된 .html/.css/.js에 하드코딩 색이 있으면 stderr로 알린다.
 * 비차단(항상 exit 0) — :root 토큰 정의는 면제. 정식 판정은 server/conformance runGate.
 * (ESM — server/package.json "type":"module"; require 불가 → import.)
 */
import { existsSync, readFileSync } from 'node:fs'
let raw = ''
process.stdin.on('data', (d) => (raw += d))
process.stdin.on('end', () => {
  let fp = ''
  try {
    fp = (JSON.parse(raw).tool_input || {}).file_path || ''
  } catch {
    process.exit(0)
  }
  if (!/\.(html|css|js)$/i.test(fp) || !existsSync(fp)) process.exit(0)
  let text = ''
  try {
    text = readFileSync(fp, 'utf8')
  } catch {
    process.exit(0)
  }
  const scanned = text.replace(/:root\s*\{[^}]*\}/g, '') // 토큰 정의 소스 면제
  const hits = []
  if (/#[0-9a-fA-F]{3,8}\b/.test(scanned)) hits.push('raw hex')
  if (/\b(?:rgb|rgba|hsl|hsla)\(\s*[0-9.]/.test(scanned)) hits.push('raw color fn (rgb(<숫자>)')
  if (/\b(?:bg|text|border|ring)-(?:slate|gray|zinc|neutral|stone)-/.test(scanned)) hits.push('default-palette class')
  if (hits.length) {
    process.stderr.write(
      `⚠ [devpilot-conformance] ${fp}: 하드코딩 색 감지 → ${hits.join(', ')}. ` +
        `역전 원칙: rgb(var(--token)) 사용. conformance-validator가 최종 판정.\n`,
    )
  }
  process.exit(0) // 어드바이저리(비차단)
})
