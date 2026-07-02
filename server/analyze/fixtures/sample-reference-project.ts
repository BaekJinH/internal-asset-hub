/**
 * FIXTURE — a publisher REFERENCE PROJECT for the (B) increment-① self-check (deterministic, no fs).
 *
 * Stands in for what the deferred loader will produce from a real reference project on disk:
 *   - `sampleReferenceCss`: a globals.css whose :root channel tokens DIFFER from the embed-host defaults
 *     (reversal proof — the reference must dominate), plus deliberate raw-literal TRAPS that must NOT be
 *     captured as tokens (`--trap-hex`, `--trap-fn`).
 *   - `sampleReferenceComponents`: clean components that should be cataloged + one broken component that
 *     must be REJECTED by reference conformance.
 */
import type { ReferenceProfileSource } from '../reference-profile'
import type { ReferenceComponentSource } from '../reference-catalog'

/**
 * Reference brand tokens (warm/amber juice brand) — every value differs from HOST_DEFAULT_CSS_VARS so the
 * self-check can prove the reference dominates. Covers exactly the token NAMES the static emitter emits
 * (--background/--foreground/--card/--border/--primary) so the gate still passes with reference values.
 * The two `--trap-*` lines are raw literals: the channel-only parser must silently exclude them.
 */
export const sampleReferenceCss = `:root {
  --background: 255 251 235;
  --foreground: 41 37 36;
  --card: 254 252 232;
  --card-foreground: 41 37 36;
  --primary: 217 119 6;
  --primary-foreground: 255 255 255;
  --secondary: 254 243 199;
  --secondary-foreground: 120 53 15;
  --muted: 245 245 244;
  --muted-foreground: 120 113 108;
  --accent: 234 88 12;
  --accent-foreground: 255 255 255;
  --border: 231 229 228;
  --ring: 217 119 6;
  --trap-hex: #ff0000;
  --trap-fn: rgb(1, 2, 3);
}
`

export const sampleReferenceProfile: ReferenceProfileSource = {
  profileId: 'ref:juice-landing',
  css: sampleReferenceCss,
}

/**
 * Clean hero — passes conformance; category 'hero'; responsive + aria present.
 * NOTE: interface members are ONE PER LINE — the ported prop-extraction regex is line-anchored (this mirrors
 * how real .tsx is written); a single-line interface body would only yield its first member.
 */
const heroBanner = `import React from 'react'

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
`

/** Clean form — passes conformance; category 'form'; responsive + aria present. */
const contactForm = `import React from 'react'

export interface ContactFormProps {
  onSubmit: (value: string) => void
  placeholder: string
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, placeholder }) => (
  <form className="sm:grid gap-4" aria-label="contact form">
    <input className="input" placeholder={placeholder} aria-required="true" />
    <button type="submit">Send</button>
  </form>
)
`

/**
 * Clean pricing — passes conformance but has NO responsive classes → advisory warning (still valid).
 * The prop is `perks` (not `features`): the faithful first-match categorizer would otherwise hit the
 * 'feature' keyword on the substring 'features' before reaching 'pricing'.
 */
const pricingCard = `import React from 'react'

export interface PricingCardProps {
  plan: string
  price: number
  perks: string[]
}

export function PricingCard({ plan, price, perks }: PricingCardProps) {
  return (
    <div className="card" aria-label="pricing">
      <h3>{plan}</h3>
      <span>{price}</span>
      <ul>{perks.map((p) => <li key={p}>{p}</li>)}</ul>
    </div>
  )
}
`

/** Clean feature — category 'feature' (matched by '서비스/기능/특징' requirements keywords). */
const featureGrid = `import React from 'react'

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
`

/** Clean chrome — category 'navigation' (the selector prepends this as the page header). */
const siteHeader = `import React from 'react'

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
`

/** Clean chrome — category 'navigation' (the selector appends this as the page footer). */
const siteFooter = `import React from 'react'

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
`

/** Broken — no export, no React import, no *Props interface → 3 blocking errors → REJECTED. */
const brokenWidget = `const BrokenWidget = () => <div style={{ color: 'red' }}>oops</div>
`

export const sampleReferenceComponents: ReferenceComponentSource[] = [
  { filename: 'SiteHeader.tsx', content: siteHeader },
  { filename: 'HeroBanner.tsx', content: heroBanner },
  { filename: 'FeatureGrid.tsx', content: featureGrid },
  { filename: 'PricingCard.tsx', content: pricingCard },
  { filename: 'ContactForm.tsx', content: contactForm },
  { filename: 'SiteFooter.tsx', content: siteFooter },
  { filename: 'BrokenWidget.tsx', content: brokenWidget },
]
