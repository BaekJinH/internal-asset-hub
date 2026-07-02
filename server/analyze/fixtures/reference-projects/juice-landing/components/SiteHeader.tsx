import React from 'react'

export interface SiteHeaderProps {
  brand: string
  links: string[]
}

export function SiteHeader({ brand, links }: SiteHeaderProps) {
  return (
    <header className="site-header md:flex" aria-label="site header">
      <strong>{brand}</strong>
      <nav aria-label="primary">{links.map((l) => <a key={l} href={l}>{l}</a>)}</nav>
    </header>
  )
}
