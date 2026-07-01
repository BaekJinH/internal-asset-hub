/**
 * 3-page fixture BuildManifest — the vertical-slice input (STEP 3 first proof).
 *
 * Conforms to the shipped `BuildManifest` / `ConformanceTokenSet` shapes (SoT). cssVars mirror the host
 * `src/app/styles/globals.css` :root tokens so emitted output is host-DS-conformant. This stands in for
 * Phase-1 analyze output until the devpilot-v2 phase_0-3 port lands.
 */
import type { BuildManifest } from '../contract'

export const threePageManifest: BuildManifest = {
  manifestId: 'juiceful-mvp',
  sitemap: [
    { pageId: 'home', route: '/', title: '홈', sections: ['히어로', '제품 소개', '고객 후기'], dependsOn: [] },
    { pageId: 'about', route: '/about', title: '소개', sections: ['브랜드 스토리', '팀'], dependsOn: ['home'] },
    { pageId: 'contact', route: '/contact', title: '문의', sections: ['문의 폼', '오시는 길'], dependsOn: ['home'] },
  ],
  sharedComponents: [
    { name: 'SiteHeader', props: { title: 'string' }, reusedBy: ['home', 'about', 'contact'] },
    { name: 'SiteFooter', props: {}, reusedBy: ['home', 'about', 'contact'] },
  ],
  conformanceTokens: {
    cssVars: {
      '--background': '248 250 252',
      '--foreground': '15 23 42',
      '--primary': '79 70 229',
      '--border': '226 232 240',
      '--card': '255 255 255',
    },
    colorTokens: ['background', 'foreground', 'primary', 'border', 'card'],
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
  },
}
