/**
 * HOST CONFORMANCE PROFILE resolver — the REVERSAL PRINCIPLE at the analyze boundary.
 *
 * `AnalyzeRequest.conformanceProfile` selects the host `ConformanceTokenSet` that DOMINATES codegen.
 * conformanceTokens are sourced HERE (from the host design system), NEVER from devpilot ThemeConfig —
 * so generated output conforms to the host, and devpilot's raw-hex theme decisions cannot leak into the IR.
 *
 * cssVars mirror the real host `src/app/styles/globals.css` :root channel tokens (space-separated RGB, the
 * `rgb(var(--token))` sources the emitter uses). Verified against globals.css (e.g. --border: 203 213 225 —
 * NOT the fixture's older 226 232 240 approximation; this resolver is the corrected source of truth).
 *
 * MVP = single 'default' host profile. Additional named profiles are an ADDITIVE extension (host stays frozen).
 */
import type { ConformanceTokenSet } from '../contract'

/** Real host globals.css :root channel tokens (rgb(var(--token)) sources). */
const HOST_DEFAULT_CSS_VARS: Record<string, string> = {
  '--background': '248 250 252',
  '--foreground': '15 23 42',
  '--card': '255 255 255',
  '--card-foreground': '15 23 42',
  '--primary': '79 70 229',
  '--primary-foreground': '255 255 255',
  '--secondary': '241 245 249',
  '--secondary-foreground': '30 41 59',
  '--muted': '241 245 249',
  '--muted-foreground': '100 116 139',
  '--accent': '238 242 255',
  '--accent-foreground': '67 56 202',
  '--border': '203 213 225',
  '--ring': '99 102 241',
}

/** profile name → host ConformanceTokenSet. Unknown profiles fall back to 'default' (host-frozen). */
export function resolveHostProfile(_profile: string): ConformanceTokenSet {
  return {
    cssVars: { ...HOST_DEFAULT_CSS_VARS },
    colorTokens: ['background', 'foreground', 'card', 'primary', 'secondary', 'muted', 'accent', 'border', 'ring'],
    colorBearingPrefixes: ['bg-', 'text-', 'border-', 'ring-'],
    utilityLayerClasses: ['container', 'section', 'card', 'flex', 'grid'],
    denylist: { rawColorLiteral: true, defaultPalette: true },
    namingRules: { file: 'kebab-case', component: 'PascalCase', export: 'named', cssClass: 'utility-first' },
    fsdLanding: {
      page: 'src/pages',
      feature: 'src/features',
      widget: 'src/widgets',
      shared: 'src/shared',
      entity: 'src/entities',
    },
  }
}
