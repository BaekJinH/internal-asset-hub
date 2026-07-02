import React from 'react'

export interface FeatureGridProps {
  heading: string
  items: string[]
}

export function FeatureGrid({ heading, items }: FeatureGridProps) {
  return (
    <section className="feature-grid md:grid-cols-3" aria-label="features">
      <h2>{heading}</h2>
      <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  )
}
