/**
 * ASSEMBLER — reference catalog + requirements → a single-page BuildManifest (the (B) increment-③ "조립").
 *
 * This closes the DETERMINISTIC chain the workorder targets: reference project → cushion catalog → SELECT →
 *   ASSEMBLE → (emit → gate). It is a SECOND deterministic entry into the IR, parallel to manifest-mapper.ts:
 *   that one maps LLM plan+blueprint → BuildManifest; THIS one composes a page straight from a reference
 *   catalog with no LLM, proving (B)'s core (reference-based page assembly) end-to-end and verifiable now.
 *
 * Chrome (the navigation header/footer the selector resolves) → BuildManifest.sharedComponents; the selected
 *   body components → the page's ordered sections. Follows manifest-mapper's convention (chrome ≠ sections).
 *
 * REVERSAL PRINCIPLE: conformanceTokens come from resolveConformanceProfile (reference tokens dominate when a
 *   reference profile is supplied, else the embed-host default) — never from any color the catalog carries.
 *
 * NOTE (honest limitation): the increment-① regex extractor captures prop NAMES only (not types), so a
 *   ComponentSpec's prop types are 'unknown' here — richer prop-shape extraction is a later increment.
 */
import type { AnalyzeRequest, BuildManifest, ComponentSpec, PageSpec } from '../contract'
import type { ReferenceCatalog } from './reference-catalog'
import { selectComponents, type SelectOptions, type SelectionResult } from './component-selector'
import { resolveConformanceProfile } from './host-profile'
import type { ReferenceProfileSource } from './reference-profile'

export interface AssembleInput {
  manifestId: string
  /** page title (rendered in <title> / header). */
  title: string
  /** natural-language requirements to select against. */
  requirements: string
  catalog: ReferenceCatalog
  req: AnalyzeRequest
  /** optional reference profile source — when present its tokens dominate conformance. */
  reference?: ReferenceProfileSource
  selectOptions?: SelectOptions
}

/** id (e.g. 'HeroBanner') → human section title ('Hero Banner'). */
function humanize(id: string): string {
  const spaced = id
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase()) || id
}

/** catalog prop names (string[]) → ComponentSpec.props (name → type); regex extraction yields no types → 'unknown'. */
function propShape(props: string[] | undefined): Record<string, string> {
  const shape: Record<string, string> = {}
  for (const name of props ?? []) shape[name] = 'unknown'
  return shape
}

export interface AssembleResult {
  manifest: BuildManifest
  selection: SelectionResult
}

/** Compose a single-page BuildManifest from a reference catalog + requirements. */
export function assembleManifest(input: AssembleInput): AssembleResult {
  const { manifestId, title, requirements, catalog, req, reference, selectOptions } = input
  const selection = selectComponents(requirements, catalog, selectOptions)

  const chrome = new Set([selection.header, selection.footer].filter((x): x is string => x !== null))

  const page: PageSpec = {
    pageId: 'page_home',
    route: '/',
    title,
    sections: selection.body.map(humanize),
    dependsOn: [],
  }

  const sharedComponents: ComponentSpec[] = [...chrome].map((id) => ({
    name: humanize(id),
    props: propShape(catalog.components[id]?.props),
    reusedBy: [page.pageId],
  }))

  return {
    manifest: {
      manifestId,
      sitemap: [page],
      sharedComponents,
      conformanceTokens: resolveConformanceProfile(req.conformanceProfile, reference),
    },
    selection,
  }
}
