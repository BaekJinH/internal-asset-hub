/**
 * SHIPPED CONTRACT re-export — the engine's single source of truth for the host↔engine boundary.
 *
 * impl-note #1: type-only import via the `@host-contract` path alias
 *   (tsconfig paths → ../src/entities/devpilot/model/devpilot-types). Types are erased at emit,
 *   so this creates ZERO runtime coupling and the host SPA is never imported into the engine bundle.
 *
 * SoT RULE: `src/entities/devpilot/model/devpilot-types.ts` is FROZEN. The engine conforms to these
 *   shapes; it never edits the host file and never forks a copy of the contract. Because the engine
 *   imports the shipped types in-place, contract drift is structurally impossible.
 *
 * D1 (SoT gate errata): `ConformanceTokenSet.denylist` is the shipped OBJECT
 *   `{ rawColorLiteral: boolean; defaultPalette: boolean }` (enable-flags). Any forbidden-pattern /
 *   forbidden-palette DATA the gate needs lives ENGINE-INTERNAL (server/conformance/*), NOT in the
 *   shared contract — keeps the host frozen and drift closed.
 */
export type {
  DesignReferenceMode,
  AnalyzeRequest,
  PageSpec,
  ComponentSpec,
  ConformanceTokenSet,
  BuildManifest,
  GeneratedFile,
  GateReport,
  FTRecord,
  PageArtifact,
  PageError,
  JobPhase,
  JobStatus,
} from '@host-contract'

// NOTE: `DevPilotTransport` (src/entities/devpilot/api/devpilot-transport.ts) is the HOST-SIDE seam.
// The engine implements the SERVER side of those four method signatures over HTTP — see server/transport.
