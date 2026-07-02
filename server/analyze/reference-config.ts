/**
 * REFERENCE CONFIG — the optional `reference.config.json` a publisher reference project may carry ((B)②).
 *
 * zod-validated so a MALFORMED reference FAILS CLOSED (loadReferenceProject throws) rather than silently
 * producing a half-built catalog/profile. `.strict()` rejects unknown keys — a typo'd field is an error, not
 * a silent no-op. When the file is absent the loader synthesizes a default config (profileId from the dir name).
 *
 * This config carries only NEUTRAL, non-aesthetic metadata (which files hold the tokens/components, the domain,
 * and injectable selection seeds). It never carries colors — tokens are extracted from CSS as sanctioned RGB
 * channel triples (reference-profile.ts), preserving the reversal principle.
 */
import { z } from 'zod'

export const ReferenceConfigSchema = z
  .object({
    /** stable profile id, e.g. 'ref:juice-landing' (mirrored into AnalyzeRequest.conformanceProfile). */
    profileId: z.string().min(1),
    /** path to the tokens CSS, relative to the project root (default 'globals.css'). */
    cssPath: z.string().min(1).optional(),
    /** directory holding component sources, relative to the project root (default 'components'). */
    componentsDir: z.string().min(1).optional(),
    /** domain for domain-aware component selection (component-selector). */
    domain: z.string().optional(),
    /** color-bearing class prefixes the reference uses (else inherit the host base). */
    colorBearingPrefixes: z.array(z.string()).optional(),
    /** semantic utility classes the reference defines (else inherit the host base). */
    utilityLayerClasses: z.array(z.string()).optional(),
    /** subType → candidate component ids (component-selector subType refinement). */
    subTypeCandidates: z.record(z.array(z.string())).optional(),
  })
  .strict()

export type ReferenceConfig = z.infer<typeof ReferenceConfigSchema>

/** Default config for a reference project that ships no reference.config.json. */
export function defaultReferenceConfig(profileId: string): ReferenceConfig {
  return { profileId }
}
