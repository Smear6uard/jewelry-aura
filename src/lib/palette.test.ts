/**
 * Contrast guards for the cream-canvas palette.
 *
 * The tokens are read out of src/app.css rather than duplicated here, so
 * these tests fail if a hex is retuned without re-checking legibility —
 * which is exactly the moment a light canvas quietly loses AA.
 *
 * See docs/PALETTE-NOTES.md for the measured table and for the one
 * documented deviation from the rebuild brief (--text-subtle).
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const CSS = readFileSync(new URL('../app.css', import.meta.url), 'utf8')

function token(name: string): string {
  const match = CSS.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!match) throw new Error(`--color-${name} is not defined in app.css`)
  return match[1]
}

/** Relative luminance per WCAG 2.1. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}

const AA_BODY = 4.5

describe('palette tokens', () => {
  it('keeps the canvas cream, not white and not dark', () => {
    // A pure-white canvas is the failure mode this rebuild exists to
    // avoid; a dark one is the failure mode it replaced.
    expect(token('base')).toBe('#f2ede4')
    expect(token('raised')).toBe('#ffffff')
    expect(luminance(token('base'))).toBeLessThan(luminance(token('raised')))
    expect(luminance(token('base'))).toBeGreaterThan(0.6)
  })

  it('defines no champagne token', () => {
    expect(CSS.toLowerCase()).not.toContain('champagne')
    expect(CSS.toLowerCase()).not.toContain('#c4a875')
  })

  it('gives white tiles a visible step above the canvas', () => {
    const step = luminance(token('raised')) - luminance(token('base'))
    expect(step).toBeGreaterThan(0.05)
  })
})

describe('type on the cream canvas', () => {
  const base = () => token('base')

  it('clears AA for primary text', () => {
    expect(contrast(token('ink'), base())).toBeGreaterThanOrEqual(7)
  })

  it('clears AA for muted body copy — the floor for anything readable', () => {
    expect(contrast(token('ink-muted'), base())).toBeGreaterThanOrEqual(AA_BODY)
  })

  it('clears AA for maroon used as a text colour (links, stars, eyebrows)', () => {
    expect(contrast(token('brand'), base())).toBeGreaterThanOrEqual(AA_BODY)
    expect(contrast(token('brand-hover'), base())).toBeGreaterThanOrEqual(AA_BODY)
  })

  /**
   * --text-subtle is deliberately below AA and is therefore restricted to
   * non-text decoration. This test documents that fact so nobody "fixes"
   * the token by starting to set copy in it. If it ever needs to carry
   * text, darken it to at least #726A61 (4.56:1) first and delete this.
   */
  it('records that ink-subtle is not a text colour', () => {
    expect(contrast(token('ink-subtle'), base())).toBeLessThan(AA_BODY)
  })
})

describe('type on the maroon bands', () => {
  it('clears AA for cream on every maroon surface', () => {
    for (const band of ['brand', 'brand-hover', 'brand-deep']) {
      expect(
        contrast(token('cream'), token(band)),
        `cream on ${band}`,
      ).toBeGreaterThanOrEqual(AA_BODY)
    }
  })

  it('keeps the footer dimmed cream readable', () => {
    // cream at 75% over brand-deep, composited.
    const cream = token('cream')
    const deep = token('brand-deep')
    const mix = (i: number) => {
      const c = Number.parseInt(cream.slice(i, i + 2), 16)
      const d = Number.parseInt(deep.slice(i, i + 2), 16)
      return Math.round(0.75 * c + 0.25 * d)
        .toString(16)
        .padStart(2, '0')
    }
    const composited = `#${mix(1)}${mix(3)}${mix(5)}`
    expect(contrast(composited, deep)).toBeGreaterThanOrEqual(AA_BODY)
  })
})
