/**
 * MANIFEST MAPPER — deterministic DevelopmentPlan + ScreenBlueprint → shipped BuildManifest (the IR).
 *
 * This is the Phase-1→Phase-2 handoff, and it runs with NO LLM (verifiable now). The cloud model produces
 * the plan/blueprint (deferred, behind the model-client seam); THIS maps them to the framework-neutral IR.
 *
 * REVERSAL PRINCIPLE: conformanceTokens come from the HOST profile (resolveHostProfile), never from the
 *   devpilot ThemeConfig. ThemeConfig's raw-hex colors are intentionally NOT consumed here — that keeps
 *   host tokens dominant and prevents color literals from entering the IR.
 *
 * SYNTHESIS (fields with no devpilot source, per PORT-MANIFEST gap analysis):
 *   route      — no route/url in any schema → slug(page_id), home (min user_flow_order) → '/'.
 *   dependsOn  — no page→page edge → non-home pages depend on the home pageId (flow-order heuristic).
 *   sections   — from layout_tree top-level nodes (chrome: header/footer/nav excluded, they become shared).
 *   sharedComponents.reusedBy — no reverse index → computed by traversing every page's layout_tree.
 */
import type { AnalyzeRequest, BuildManifest, ComponentSpec, PageSpec } from '../contract'
import type { ComponentNode, DevelopmentPlan, ScreenBlueprint } from './ir'
import { resolveConformanceProfile } from './host-profile'
import type { ReferenceProfileSource } from './reference-profile'

const CHROME_RE = /(^|_)(header|footer|nav|navbar|navigation)(_|$)/i

function slug(id: string): string {
  return id.replace(/^page_/, '').replace(/_+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'page'
}

function humanize(id: string): string {
  const base = id.replace(/^(page_|comp_|cmp_)/, '').replace(/[_-]+/g, ' ').trim()
  return base.replace(/\b\w/g, (c) => c.toUpperCase()) || id
}

/** depth-first walk of a layout_tree, yielding every ComponentNode. */
function walk(nodes: ComponentNode[] | undefined, visit: (n: ComponentNode) => void): void {
  for (const n of nodes ?? []) {
    visit(n)
    walk(n.children, visit)
  }
}

/** ComponentNode.props (Record<string,unknown>) → ComponentSpec.props (name → JS type string). */
function propShape(props: Record<string, unknown> | undefined): Record<string, string> {
  const shape: Record<string, string> = {}
  for (const [k, v] of Object.entries(props ?? {})) shape[k] = Array.isArray(v) ? 'array' : typeof v
  return shape
}

export function mapToBuildManifest(
  plan: DevelopmentPlan,
  blueprint: ScreenBlueprint,
  req: AnalyzeRequest,
  reference?: ReferenceProfileSource,
): BuildManifest {
  // flow-order + title lookup by page_id (join plan ↔ blueprint on the stable page_id key)
  const planByPage = new Map(plan.pages.map((p) => [p.page_id, p]))

  // home = the blueprint page whose plan flow-order is smallest (fallback: first blueprint page)
  const orderOf = (pageId: string): number => planByPage.get(pageId)?.user_flow_order ?? Number.MAX_SAFE_INTEGER
  const homePageId =
    [...blueprint.pages].sort((a, b) => orderOf(a.page_id) - orderOf(b.page_id))[0]?.page_id ??
    blueprint.pages[0].page_id

  const sitemap: PageSpec[] = blueprint.pages.map((page) => {
    const isHome = page.page_id === homePageId
    const sections = page.layout_tree
      .filter((n) => !CHROME_RE.test(n.component_id))
      .map((n) => humanize(n.component_id))
    return {
      pageId: page.page_id,
      route: isHome ? '/' : '/' + slug(page.page_id),
      title: page.page_name,
      sections,
      dependsOn: isHome ? [] : [homePageId],
    }
  })

  // sharedComponents = component_ids appearing on >= 2 pages (traverse all layout_trees for the reverse index)
  const usage = new Map<string, { pages: Set<string>; props: Record<string, string> }>()
  for (const page of blueprint.pages)
    walk(page.layout_tree, (n) => {
      const entry = usage.get(n.component_id) ?? { pages: new Set<string>(), props: {} }
      entry.pages.add(page.page_id)
      Object.assign(entry.props, propShape(n.props))
      usage.set(n.component_id, entry)
    })

  const sharedComponents: ComponentSpec[] = [...usage.entries()]
    .filter(([, u]) => u.pages.size >= 2)
    // codepoint sort (NOT localeCompare): the BuildManifest IR must be byte-reproducible across host locales/
    // ICU builds — mixed-case component_ids like 'HeroBanner' vs 'header' reorder under a locale collator.
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([name, u]) => ({ name, props: u.props, reusedBy: [...u.pages].sort() }))

  const manifestId =
    (plan.project_overview.project_name && slug(plan.project_overview.project_name)) ||
    plan.meta?.request_id ||
    blueprint.plan_request_id ||
    'manifest'

  return {
    manifestId,
    sitemap,
    sharedComponents,
    // REVERSAL: the reference project's tokens dominate when supplied (else the embed-host default); never ThemeConfig.
    conformanceTokens: resolveConformanceProfile(req.conformanceProfile, reference),
  }
}
