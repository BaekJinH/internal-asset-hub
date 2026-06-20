/** Layout tokens — keep in sync with globals.css :root */
export const LAYOUT = {
  sidebarWidth: 'var(--sidebar-width)',
  sidebarWidthIcon: 'var(--sidebar-width-icon)',
  headerHeight: 'var(--header-height)',
  contentPadding: 'var(--content-padding)',
  radius: 'var(--radius)',
} as const

export const SPACING = {
  inline: 'var(--space-inline)',
  field: 'var(--space-field)',
  stackSm: 'var(--space-stack-sm)',
  stack: 'var(--space-stack)',
  section: 'var(--space-section)',
  page: 'var(--space-page)',
  widget: 'var(--space-widget)',
  cardX: 'var(--space-card-x)',
  cardY: 'var(--space-card-y)',
  cardContent: 'var(--space-card-content)',
  listRowY: 'var(--space-list-row-y)',
  headerGap: 'var(--space-header-gap)',
} as const
