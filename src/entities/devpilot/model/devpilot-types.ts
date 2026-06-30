// DevPilot 호스트측 계약 타입 — 정본: company-devpilot Design Packet Rev 1.1 `INTERFACE CONTRACT`.
// Pass 1은 호스트 통합 표면만 materialize. codegen/엔진 로직은 별도(데스크탑 fork).

export type DesignReferenceMode = 'replicate' | 'reference' | 'none'

export interface AnalyzeRequest {
  spec: string
  designRef?: { kind: 'image' | 'figma'; data: string }
  designRefMode: DesignReferenceMode
  manyPages: boolean
  conformanceProfile: string
}

export interface PageSpec {
  pageId: string
  route: string
  title: string
  sections: string[]
  dependsOn: string[]
}

export interface ComponentSpec {
  name: string
  props: Record<string, string>
  reusedBy: string[]
}

// 역전 게이트의 강제 단위(문법 인지 color-token 게이트). 검증/강제는 엔진측, 호스트는 타입만 보유.
export interface ConformanceTokenSet {
  cssVars: Record<string, string>
  colorTokens: string[]
  colorBearingPrefixes: string[]
  utilityLayerClasses: string[]
  denylist: { rawColorLiteral: boolean; defaultPalette: boolean }
  namingRules: {
    file: 'kebab-case'
    component: 'PascalCase'
    export: 'named'
    cssClass: 'utility-first'
  }
  fsdLanding: Record<'page' | 'feature' | 'widget' | 'shared' | 'entity', string>
}

export interface BuildManifest {
  manifestId: string
  sitemap: PageSpec[]
  sharedComponents: ComponentSpec[]
  conformanceTokens: ConformanceTokenSet
}

export interface GeneratedFile {
  path: string
  content: string
}

export interface GateReport {
  l1_esbuild: boolean
  l2_forbiddenImports: boolean
  l3_propShape: boolean
  l4_render: boolean
  dsConformance: {
    tokenViolations: string[]
    colorLiteralViolations: string[]
    namingViolations: string[]
    pass: boolean
  }
}

export interface FTRecord {
  input: { spec: string; designRefMode: DesignReferenceMode; conformanceProfile: string }
  output: { files: GeneratedFile[] }
  quality: { gateScore: number; gold: boolean }
  meta: { model: string; timestamp: string; jobId: string }
}

export interface PageArtifact {
  pageId: string
  files: GeneratedFile[]
  gates: GateReport
  ftRecord: FTRecord
}

export interface PageError {
  pageId: string
  gate: string
  reason: string
}

export type JobPhase = 'analyzing' | 'generating' | 'done' | 'failed'

export interface JobStatus {
  jobId: string
  phase: JobPhase
  total: number
  completed: number
  failed: PageError[]
  checkpointId: string
}
