/**
 * ANALYZE IR — Phase-1 output contracts (zod), ported from devpilot-v2@d262aa3.
 *
 * PROVENANCE (copy-in, NOT git-fork — devpilot-v2 is a separate repo, never imported at runtime):
 *   DevelopmentPlan  ← src/validation/development-plan.schema.ts   (phase_1 requirements)
 *   ScreenBlueprint  ← src/validation/screen-blueprint.schema.ts   (phase_2 blueprint)
 *   ThemeConfig      ← src/validation/theme-config.schema.ts        (phase_3 theme)
 *
 * FAITHFUL SUBSET: only the fields the deterministic `manifest-mapper` consumes are declared here.
 *   The source schemas are `.strict()`; this subset is NON-strict (extra keys accepted + stripped) so real
 *   devpilot output validates. Remaining fields (meta.producer, quality_gate, features detail, typography/
 *   effects, tailwind_extend, image-analysis/phase_0) are elided until phase2/3 mapping needs them. This is
 *   the same faithful-adaptation boundary used for the n8n S19/S20 ports.
 *
 * REVERSAL NOTE: ThemeConfig.colors carries RAW HEX (`#RRGGBB`) — precisely the color literals the
 *   conformance gate REJECTS. The mapper MUST NOT source conformanceTokens from these; host profile
 *   dominates (see host-profile.ts). ThemeConfig is retained for tone/typography hints only.
 */
import { z } from 'zod'

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/)

// ── ScreenBlueprint layout_tree element — recursive ComponentNode ────────────
const baseComponentNode = z.object({
  component_id: z.string(),
  instance_id: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional(),
  style_overrides: z.record(z.string(), z.unknown()).optional(),
  layout_notes: z.string().optional(),
})
export type ComponentNode = z.infer<typeof baseComponentNode> & { children?: ComponentNode[] }
export const ComponentNodeSchema: z.ZodType<ComponentNode> = baseComponentNode.extend({
  children: z.lazy(() => ComponentNodeSchema.array().optional()),
})

// ── DevelopmentPlan (phase_1) — pages + overview + feature graph ─────────────
export const DevelopmentPlanSchema = z.object({
  meta: z.object({ request_id: z.string() }).optional(),
  project_overview: z.object({
    project_name: z.string(),
    domain: z.enum(['SHOWCASE', 'FUNCTIONAL', 'HYBRID']).optional(),
    business_type: z.string().optional(),
  }),
  pages: z
    .array(
      z.object({
        page_id: z.string().regex(/^page_[a-z0-9_]+$/),
        page_name: z.string(),
        domain: z.enum(['SHOWCASE', 'FUNCTIONAL']).optional(),
        priority: z.enum(['must', 'should', 'could', 'wont']).optional(),
        user_flow_order: z.number().int().min(1).optional(),
        description: z.string().optional(),
      }),
    )
    .min(1),
  features: z
    .array(
      z.object({
        feature_id: z.string().optional(),
        related_pages: z.array(z.string()).optional(),
      }),
    )
    .optional(),
})
export type DevelopmentPlan = z.infer<typeof DevelopmentPlanSchema>

// ── ScreenBlueprint (phase_2) — per-page layout_tree + reuse summary ─────────
export const ScreenBlueprintSchema = z.object({
  meta: z.object({ request_id: z.string() }).optional(),
  plan_request_id: z.string().optional(),
  pages: z
    .array(
      z.object({
        page_id: z.string().regex(/^page_[a-z0-9_]+$/),
        page_name: z.string(),
        page_meta: z
          .object({
            page_type: z.string().optional(),
            theme_palette: z.string().optional(),
            layout_mode: z.enum(['single_column', 'two_column', 'grid', 'dashboard']).optional(),
          })
          .optional(),
        layout_tree: z.array(ComponentNodeSchema).min(1),
        responsive_notes: z.string().optional(),
      }),
    )
    .min(1),
  component_usage_summary: z
    .object({
      total_components: z.number().int().optional(),
      unique_component_ids: z.array(z.string()).optional(),
    })
    .optional(),
})
export type ScreenBlueprint = z.infer<typeof ScreenBlueprintSchema>

// ── ThemeConfig (phase_3) — colors (HINT ONLY; host tokens dominate) ─────────
export const ThemeConfigSchema = z.object({
  meta: z.object({ request_id: z.string() }).optional(),
  overall_tone: z.string().optional(),
  colors: z.object({
    primary: hexColor,
    secondary: hexColor,
    accent: hexColor.optional(),
    background: hexColor,
    surface: hexColor,
    text_primary: hexColor,
    text_secondary: hexColor.optional(),
    border: hexColor.optional(),
  }),
})
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>
