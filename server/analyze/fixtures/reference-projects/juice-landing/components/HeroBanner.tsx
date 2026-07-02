import React from 'react'

export interface HeroBannerProps {
  title: string
  subtitle?: string
  ctaLabel: string
}

export function HeroBanner({ title, subtitle, ctaLabel }: HeroBannerProps) {
  return (
    <section className="hero md:py-24" aria-label="hero">
      <h1 className="text-4xl md:text-6xl">{title}</h1>
      {subtitle && <p className="lg:text-lg">{subtitle}</p>}
      <a className="btn-primary" href="#cta">{ctaLabel}</a>
    </section>
  )
}
