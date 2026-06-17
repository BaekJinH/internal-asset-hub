/**
 * Floating overlay surface classes.
 * Uses .surface-popover / .surface-dialog utilities (globals.css) for guaranteed opaque backgrounds.
 */
export const overlaySurfaces = {
  backdrop: 'fixed inset-0 z-50 bg-black/50',
  popover:
    'surface-popover z-[100] overflow-hidden rounded-md border border-border text-popover-foreground shadow-md',
  dialog:
    'surface-dialog z-[51] border border-border text-popover-foreground shadow-lg',
  dialogElevated:
    'surface-dialog z-[51] border border-border text-popover-foreground shadow-2xl',
  sheet: 'surface-sheet z-[51] flex flex-col border-border bg-background text-foreground shadow-xl',
  tooltip:
    'surface-tooltip z-[100] overflow-hidden rounded-md border border-border px-3 py-1.5 text-xs shadow-md',
} as const
