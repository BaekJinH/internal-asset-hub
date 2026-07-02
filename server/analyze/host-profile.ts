/**
 * CONFORMANCE PROFILE resolver — the REVERSAL PRINCIPLE at the analyze boundary.
 *
 * `AnalyzeRequest.conformanceProfile` selects the `ConformanceTokenSet` that DOMINATES codegen. Tokens are
 * sourced HERE, NEVER from devpilot ThemeConfig — so generated output conforms, and raw-hex theme decisions
 * cannot leak into the IR.
 *
 * GENERALIZATION (workorder §4, (B) increment-①): the conformance SOURCE is a PUBLISHER REFERENCE PROJECT (an
 *   accumulating cushion corpus), not tinto-gui. tinto-gui is only the EMBED HOST — its tokens are the fallback
 *   'default' profile used when no reference project is supplied. `resolveConformanceProfile(profile, ref)`
 *   makes the reference's tokens law when a reference source is present (see reference-profile.ts); otherwise it
 *   returns the embed-host default below. Reference dominates the COLOR/TOKEN layer; structural governance
 *   (denylist enable-flags · namingRules · fsdLanding) stays host-canonical.
 *
 * `HOST_DEFAULT_CSS_VARS` mirror the real embed-host `src/app/styles/globals.css` :root channel tokens
 * (space-separated RGB, the `rgb(var(--token))` sources the emitter uses; e.g. --border: 203 213 225).
 */
import type { ConformanceTokenSet } from '../contract'
import { extractProfileFromCss, type ReferenceProfileSource } from './reference-profile'

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

/** The embed-host ('default') ConformanceTokenSet. This is the fallback when no reference project is supplied. */
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

/**
 * GENERALIZED resolver (workorder §4): if a reference-project source is supplied, its extracted tokens are LAW
 * (reference dominates the color layer over the embed-host governance base); otherwise return the 'default'
 * embed-host profile. Synchronous + pure — the reference `css` string is produced by the deferred loader.
 * Falls back to host when the reference declares no sanctioned channel tokens (extractProfileFromCss → null).
 */
export function resolveConformanceProfile(
  profile: string,
  reference?: ReferenceProfileSource,
): ConformanceTokenSet {
  const host = resolveHostProfile(profile)
  if (!reference) return host
  return extractProfileFromCss(reference, host) ?? host
}
