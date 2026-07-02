import React from 'react'

export interface SiteFooterProps {
  copyright: string
  columns: string[]
}

export function SiteFooter({ copyright, columns }: SiteFooterProps) {
  return (
    <footer className="site-footer sm:grid" aria-label="site footer">
      <small>{copyright}</small>
      <ul>{columns.map((c) => <li key={c}>{c}</li>)}</ul>
    </footer>
  )
}
