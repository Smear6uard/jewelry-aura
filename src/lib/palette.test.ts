/**
 * Guards for the eight-token palette.
 *
 * Two jobs. The first half reads the tokens out of src/app.css and checks
 * that every pairing the design actually uses still clears WCAG AA — so a
 * retune of a hex fails here rather than shipping. The second half scans
 * the source tree for the things CLAUDE.md forbids: off-palette colour,
 * shadows used as structure, and opacity used to invent a ninth shade.
 *
 * The rules these enforce are stated in CLAUDE.md; the reasoning behind
 * the deviations is in docs/PALETTE-NOTES.md.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const CSS = readFileSync(new URL('../app.css', import.meta.url), 'utf8')
const SRC = new URL('..', import.meta.url).pathname

/** The palette, exactly as specified. Nothing else may be defined. */
const PALETTE = {
  paper: '#f7f3ec',
  ink: '#191410',
  velvet: '#171209',
  bone: '#efe9de',
  maroon: '#5a1b22',
  gold: '#c2a15e',
  'hairline-dark': '#352b1f',
  'hairline-light': '#ddd5c7',
} as const

function token(name: string): string {
  const match = CSS.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!match) throw new Error(`--color-${name} is not defined in app.css`)
  return match[1].toLowerCase()
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

/** Every .ts/.tsx under src/ that ships, as [relative path, source]. */
function sourceFiles(): Array<[string, string]> {
  const out: Array<[string, string]> = []
  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        if (entry.name !== 'generated') walk(`${dir}/${entry.name}`, rel)
        continue
      }
      if (!/\.tsx?$/.test(entry.name)) continue
      if (/\.(test|gen)\.tsx?$/.test(entry.name)) continue
      if (entry.name === 'routeTree.gen.ts') continue
      out.push([rel, readFileSync(`${dir}/${entry.name}`, 'utf8')])
    }
  }
  walk(SRC, '')
  return out
}

/** Every string literal in a source file — where classNames live. */
function stringLiterals(source: string): string[] {
  return source.match(/(['"`])(?:\\.|(?!\1)[\s\S])*?\1/g) ?? []
}

describe('the eight tokens', () => {
  it('defines each one at exactly the specified hex', () => {
    for (const [name, hex] of Object.entries(PALETTE)) {
      expect(token(name), `--color-${name}`).toBe(hex)
    }
  })

  it('defines no ninth colour', () => {
    const defined = [...CSS.matchAll(/--color-([a-z-]+):/g)].map((m) => m[1])
    expect(defined.sort()).toEqual(Object.keys(PALETTE).sort())
  })

  it('uses no pure black and no pure white', () => {
    expect(CSS.toLowerCase()).not.toMatch(/#(000000|fff(fff)?|000)\b/)
  })

  it('ships no shadow scale — hairlines do the structural work', () => {
    expect(CSS).not.toMatch(/--shadow-/)
  })
})

describe('type on paper', () => {
  it('clears AAA for ink, the only text colour on this ground', () => {
    expect(contrast(token('ink'), token('paper'))).toBeGreaterThanOrEqual(7)
  })

  it('clears AA for maroon — links, stamps, selected states, errors', () => {
    expect(contrast(token('maroon'), token('paper'))).toBeGreaterThanOrEqual(AA_BODY)
  })

  /**
   * The rule "gold on paper: hairlines only, never text" is not a matter
   * of taste — gold cannot carry type on this ground at any size. This
   * test records that, so nobody "fixes" a faint gold caption by leaving
   * it gold.
   */
  it('records that gold cannot be type on paper', () => {
    expect(contrast(token('gold'), token('paper'))).toBeLessThan(3)
  })

  it('keeps a bone panel subtle enough to need its hairline', () => {
    // If bone ever separated from paper on its own, components would stop
    // drawing the rule and the structure would quietly go with it.
    expect(contrast(token('bone'), token('paper'))).toBeLessThan(1.2)
    expect(contrast(token('hairline-light'), token('paper'))).toBeGreaterThan(1.2)
  })
})

describe('type on velvet', () => {
  it('clears AAA for bone, the only body colour on this ground', () => {
    expect(contrast(token('bone'), token('velvet'))).toBeGreaterThanOrEqual(7)
  })

  it('clears AA for gold spec type and prices', () => {
    expect(contrast(token('gold'), token('velvet'))).toBeGreaterThanOrEqual(AA_BODY)
  })

  it('gives velvet a visible hairline', () => {
    expect(contrast(token('hairline-dark'), token('velvet'))).toBeGreaterThan(1.2)
  })

  /**
   * Maroon is banned on velvet by rule. It is also unreadable there,
   * which is the reason behind the rule.
   */
  it('records that maroon is illegible on velvet', () => {
    expect(contrast(token('maroon'), token('velvet'))).toBeLessThan(3)
  })
})

describe('the filled surfaces', () => {
  it('clears AA for bone on a maroon button', () => {
    expect(contrast(token('bone'), token('maroon'))).toBeGreaterThanOrEqual(AA_BODY)
  })

  it('clears AA for bone on an ink button', () => {
    expect(contrast(token('bone'), token('ink'))).toBeGreaterThanOrEqual(AA_BODY)
  })

  it('clears AA for velvet type on a bone button', () => {
    expect(contrast(token('velvet'), token('bone'))).toBeGreaterThanOrEqual(AA_BODY)
  })

  it('clears AA for velvet type on the gold hover state', () => {
    expect(contrast(token('velvet'), token('gold'))).toBeGreaterThanOrEqual(AA_BODY)
  })
})

describe('the source tree obeys the colour rules', () => {
  const files = sourceFiles()

  it('finds files to check', () => {
    expect(files.length).toBeGreaterThan(40)
  })

  it('writes no colour outside the palette', () => {
    // theme-color is a <meta> value; a meta tag cannot read a custom
    // property, so the paper hex is spelled out there and nowhere else.
    const ALLOWED = new Set(['src/routes/__root.tsx'])
    const offenders = files
      .filter(([path]) => !ALLOWED.has(`src/${path}`))
      .flatMap(([path, source]) =>
        [...source.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(
          (m) => `${path}: ${m[0]}`,
        ),
      )
    expect(offenders).toEqual([])
  })

  it('uses no Tailwind default colour', () => {
    const DEFAULTS =
      'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black'
    const pattern = new RegExp(
      `\\b(?:text|bg|border|from|to|via|ring|outline|fill|stroke|decoration|placeholder|divide|accent|caret)-(?:${DEFAULTS})(?:-\\d{2,3})?\\b`,
      'g',
    )
    const offenders = files.flatMap(([path, source]) =>
      [...source.matchAll(pattern)].map((m) => `${path}: ${m[0]}`),
    )
    expect(offenders).toEqual([])
  })

  it('uses no shadow for structure', () => {
    const offenders = files.flatMap(([path, source]) =>
      [...source.matchAll(/\bshadow-(?:sm|md|lg|xl|2xl)\b/g)].map(
        (m) => `${path}: ${m[0]}`,
      ),
    )
    expect(offenders).toEqual([])
  })

  /**
   * Opacity on a colour invents a shade the palette does not contain.
   * The one sanctioned exception is a velvet scrim over photography or
   * over the page behind a drawer, so `bg-velvet/NN` is allowed and
   * nothing else is.
   */
  it('invents no shade through a colour opacity modifier', () => {
    const names = Object.keys(PALETTE).join('|')
    const pattern = new RegExp(
      `\\b(?:text|bg|border|from|to|via|ring|divide|decoration|placeholder|outline|fill)-(?:${names})/\\d+`,
      'g',
    )
    const offenders = files.flatMap(([path, source]) =>
      [...source.matchAll(pattern)]
        .map((m) => m[0])
        .filter((cls) => !/^bg-velvet\/\d+$/.test(cls))
        .map((cls) => `${path}: ${cls}`),
    )
    expect(offenders).toEqual([])
  })

  it('never puts maroon and gold in the same class string', () => {
    const offenders = files.flatMap(([path, source]) =>
      stringLiterals(source)
        .filter((s) => /-maroon\b/.test(s) && /-gold\b/.test(s))
        .map((s) => `${path}: ${s.slice(0, 80)}`),
    )
    expect(offenders).toEqual([])
  })

  it('never puts maroon on a velvet ground', () => {
    const offenders = files.flatMap(([path, source]) =>
      stringLiterals(source)
        .filter((s) => /\bbg-velvet\b/.test(s) && /-maroon\b/.test(s))
        .map((s) => `${path}: ${s.slice(0, 80)}`),
    )
    expect(offenders).toEqual([])
  })

  it('never sets body type in gold or maroon on paper', () => {
    // text-gold is legal only inside a velvet scene. Every current use is
    // in a component that also declares data-ground="velvet".
    const goldType = files.filter(
      ([, source]) =>
        /\btext-gold\b/.test(source) &&
        !(/data-ground=/.test(source) && /velvet/.test(source)),
    )
    expect(goldType.map(([path]) => path)).toEqual([])
  })
})
