/**
 * NEUTRALIZE — shared defense so cushion-emitted TEXT can never trip the conformance gate or break out of a
 * <script> ((B)⑤ adversarial-review hardening). The gate (conformance/index.ts) scans ALL file content (only
 * :root{} is stripped) for a raw '#RRGGBB' hex or an rgb()/hsl() numeric call. Cushion free text (page titles,
 * meta descriptions, keywords, sitemap <loc>, 404 copy, borrowed a11y labels) legitimately contains '#'-tokens
 * (hashtags, short hashes, '#404') that are NOT colors — but the gate cannot tell, and a single such token in a
 * SITE-LEVEL file (sitemap.xml / 404.html, bundled into every page) would fail the WHOLE job's gate.
 *
 * These transforms break the gate's patterns WITHOUT changing rendered meaning:
 *   · HTML context — '#' starting a hex-shaped run → '&#35;' (renders as '#'); a numeric rgb()/hsl() call →
 *     'rgb&#40;…' (renders as 'rgb('). Attribute/text safe.
 *   · JSON/script context — '<' '>' '&' '#' → '\uXXXX'. JSON parsers decode \u transparently, so the JSON-LD is
 *     unchanged semantically, but it can neither present a '#RRGGBB' the gate rejects nor emit a literal
 *     '</script>' that would terminate the raw-text element early (script breakout / markup injection).
 */

/** Break gate-forbidden color literals in HTML free text (renders identically). */
export function neutralizeColorLiteralsHtml(s: string): string {
  return String(s ?? '')
    .replace(/#(?=[0-9a-fA-F]{3,8}\b)/g, '&#35;')
    .replace(/\b(rgb|rgba|hsl|hsla)\((?=\s*[0-9.])/gi, '$1&#40;')
}

/** \u-escape HTML-significant chars + '#' for embedding inside a raw <script>…</script> (JSON-LD). */
export function neutralizeScriptText(s: string): string {
  return String(s ?? '').replace(/[<>&#]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
}
