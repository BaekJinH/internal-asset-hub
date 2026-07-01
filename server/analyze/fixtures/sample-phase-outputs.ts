/**
 * Sample Phase-1 outputs (DevelopmentPlan + ScreenBlueprint + ThemeConfig) — stand-in for the deferred
 * cloud analyze, shaped like real devpilot-v2 phase output. Feeds the deterministic mapper in
 * analyze.selfcheck.ts. Mirrors the 3-page juiceful example so the produced BuildManifest lines up with the
 * proven static slice (emit→repair→gate→audit).
 *
 * ThemeConfig carries RAW HEX on purpose — the self-check proves these never reach conformanceTokens
 * (reversal principle: host profile dominates).
 */
import type { DevelopmentPlan, ScreenBlueprint, ThemeConfig } from '../ir'

export const samplePlan: DevelopmentPlan = {
  meta: { request_id: 'req_juiceful_001' },
  project_overview: {
    project_name: 'Juiceful',
    domain: 'HYBRID',
    business_type: 'B2C_SERVICE',
  },
  pages: [
    { page_id: 'page_home', page_name: '홈', domain: 'SHOWCASE', priority: 'must', user_flow_order: 1, description: '제철 착즙 주스 구독 랜딩 — 히어로·제품·후기' },
    { page_id: 'page_about', page_name: '소개', domain: 'SHOWCASE', priority: 'should', user_flow_order: 2, description: '브랜드 스토리와 팀 소개' },
    { page_id: 'page_contact', page_name: '문의', domain: 'FUNCTIONAL', priority: 'should', user_flow_order: 3, description: '문의 폼과 오시는 길' },
  ],
  features: [{ feature_id: 'feat_subscription', related_pages: ['page_home'] }],
}

const header = { component_id: 'site_header', props: { title: 'Juiceful' } }
const footer = { component_id: 'site_footer', props: {} }

export const sampleBlueprint: ScreenBlueprint = {
  meta: { request_id: 'req_juiceful_001' },
  plan_request_id: 'req_juiceful_001',
  pages: [
    {
      page_id: 'page_home',
      page_name: '홈',
      page_meta: { page_type: 'landing', layout_mode: 'single_column' },
      layout_tree: [
        header,
        { component_id: 'hero', props: { headline: '매일 아침 신선한 착즙' } },
        { component_id: 'product_intro', props: { count: 3 } },
        { component_id: 'testimonials', props: { featured: true } },
        footer,
      ],
    },
    {
      page_id: 'page_about',
      page_name: '소개',
      layout_tree: [header, { component_id: 'brand_story', props: {} }, { component_id: 'team', props: {} }, footer],
    },
    {
      page_id: 'page_contact',
      page_name: '문의',
      layout_tree: [header, { component_id: 'contact_form', props: { fields: 3 } }, { component_id: 'directions', props: {} }, footer],
    },
  ],
  component_usage_summary: {
    total_components: 11,
    unique_component_ids: ['site_header', 'site_footer', 'hero', 'product_intro', 'testimonials', 'brand_story', 'team', 'contact_form', 'directions'],
  },
}

export const sampleTheme: ThemeConfig = {
  meta: { request_id: 'req_juiceful_001' },
  overall_tone: 'fresh, clean, trustworthy',
  colors: {
    primary: '#4F46E5',
    secondary: '#F1F5F9',
    accent: '#EEF2FF',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text_primary: '#0F172A',
    border: '#CBD5E1',
  },
}
