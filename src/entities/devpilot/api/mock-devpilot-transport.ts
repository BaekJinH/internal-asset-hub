import type { DevPilotTransport } from '@/entities/devpilot/api/devpilot-transport'
import type {
  AnalyzeRequest,
  BuildManifest,
  ConformanceTokenSet,
  JobStatus,
  PageArtifact,
} from '@/entities/devpilot/model/devpilot-types'

const MOCK_CONFORMANCE_TOKENS: ConformanceTokenSet = {
  cssVars: { '--background': '248 250 252', '--primary': '79 70 229' },
  colorTokens: ['background', 'foreground', 'primary', 'border', 'sidebar'],
  colorBearingPrefixes: ['bg-', 'text-', 'border-', 'ring-'],
  utilityLayerClasses: ['surface-popover', 'surface-dialog'],
  denylist: { rawColorLiteral: true, defaultPalette: true },
  namingRules: {
    file: 'kebab-case',
    component: 'PascalCase',
    export: 'named',
    cssClass: 'utility-first',
  },
  fsdLanding: {
    page: 'src/pages/<feature>/ui/<feature>-page.tsx',
    feature: 'src/features/<feature>/ui',
    widget: 'src/widgets/<widget>/ui',
    shared: 'src/shared',
    entity: 'src/entities/<entity>',
  },
}

function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/**
 * Pass 1 default 주입. 엔진 없이 `/devpilot`이 E2E로 렌더·컴파일되게 하는 더미 transport.
 * 응답은 Rev 1.1 `INTERFACE CONTRACT` 스키마 형태의 더미 — 실제 codegen 없음.
 */
export class MockDevPilotTransport implements DevPilotTransport {
  async analyze(req: AnalyzeRequest): Promise<BuildManifest> {
    await delay(300)
    const pageCount = req.manyPages ? 3 : 1
    return {
      manifestId: `mock-manifest-${pageCount}`,
      sitemap: Array.from({ length: pageCount }, (_, index) => ({
        pageId: `page-${index + 1}`,
        route: `/generated/page-${index + 1}`,
        title: `생성 페이지 ${index + 1}`,
        sections: ['header', 'content'],
        dependsOn: [],
      })),
      sharedComponents: req.manyPages
        ? [{ name: 'SharedHeader', props: { title: 'string' }, reusedBy: ['page-1', 'page-2'] }]
        : [],
      conformanceTokens: MOCK_CONFORMANCE_TOKENS,
    }
  }

  async generate(manifestId: string): Promise<{ jobId: string }> {
    await delay(200)
    return { jobId: `mock-job-${manifestId}` }
  }

  async getJob(jobId: string): Promise<JobStatus> {
    await delay(200)
    return {
      jobId,
      phase: 'done',
      total: 1,
      completed: 1,
      failed: [],
      checkpointId: `${jobId}-checkpoint-1`,
    }
  }

  async getPage(jobId: string, pageId: string): Promise<PageArtifact> {
    await delay(150)
    const path = `src/pages/${pageId}/ui/${pageId}-page.tsx`
    return {
      pageId,
      files: [
        {
          path,
          content: `export function GeneratedPage() {\n  return <div className="space-y-6">mock: ${pageId}</div>\n}\n`,
        },
      ],
      gates: {
        l1_esbuild: true,
        l2_forbiddenImports: true,
        l3_propShape: true,
        l4_render: true,
        dsConformance: {
          tokenViolations: [],
          colorLiteralViolations: [],
          namingViolations: [],
          pass: true,
        },
      },
      ftRecord: {
        input: { spec: '(mock)', designRefMode: 'none', conformanceProfile: 'internal-asset-hub@46c5fff' },
        output: { files: [{ path, content: '// mock' }] },
        quality: { gateScore: 1, gold: true },
        meta: { model: 'mock', timestamp: '1970-01-01T00:00:00.000Z', jobId },
      },
    }
  }
}
