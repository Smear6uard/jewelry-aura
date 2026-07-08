import { describe, expect, it, vi } from 'vitest'
import {
  buildRobotsTxt,
  buildSitemapXml,
  generateSitemapXml,
  type SitemapRequest,
} from './sitemap'

function connection(
  nodes: Array<{ handle: string; updatedAt: string }>,
  hasNextPage: boolean,
  endCursor: string | null,
) {
  return { nodes, pageInfo: { hasNextPage, endCursor } }
}

describe('generateSitemapXml', () => {
  it('walks multi-page product and collection cursors completely', async () => {
    const productPage1 = Array.from({ length: 250 }, (_, i) => ({
      handle: `piece-${i}`,
      updatedAt: '2026-07-01T00:00:00Z',
    }))
    const productPage2 = [
      { handle: 'piece-250', updatedAt: '2026-07-02T00:00:00Z' },
    ]
    const collectionPage1 = Array.from({ length: 250 }, (_, i) => ({
      handle: `col-${i}`,
      updatedAt: '2026-06-01T00:00:00Z',
    }))
    const collectionPage2 = [
      { handle: 'col-250', updatedAt: '2026-06-02T00:00:00Z' },
    ]

    const request = vi.fn(async (operation: string, options?: { variables?: Record<string, unknown> }) => {
      const after = options?.variables?.after ?? null
      if (operation.includes('SitemapProducts')) {
        return {
          products:
            after === null
              ? connection(productPage1, true, 'p-cursor')
              : connection(productPage2, false, null),
        }
      }
      return {
        collections:
          after === null
            ? connection(collectionPage1, true, 'c-cursor')
            : connection(collectionPage2, false, null),
      }
    }) as unknown as SitemapRequest

    const xml = await generateSitemapXml(request)

    expect(xml).toContain('<loc>https://jewelry-aura.com/</loc>')
    expect(xml).toContain('<loc>https://jewelry-aura.com/shop</loc>')
    expect(xml).toContain('/products/piece-0</loc>')
    expect(xml).toContain('/products/piece-250</loc>')
    expect(xml).toContain('/collections/col-0</loc>')
    expect(xml).toContain('/collections/col-250</loc>')
    // 2 static + 251 collections + 251 products
    expect(xml.match(/<url>/g)).toHaveLength(504)
    // Cursor variables were threaded back on the second pages.
    const calls = (request as unknown as ReturnType<typeof vi.fn>).mock.calls
    const productCalls = calls.filter((call) =>
      String(call[0]).includes('SitemapProducts'),
    )
    const secondOptions = productCalls[1][1] as {
      variables: { after: string | null }
    }
    expect(secondOptions.variables.after).toBe('p-cursor')
  })

  it('emits ISO 8601 lastmod values', async () => {
    const request = vi.fn(async (operation: string) =>
      operation.includes('SitemapProducts')
        ? {
            products: connection(
              [{ handle: 'ring', updatedAt: '2026-07-03T12:30:00Z' }],
              false,
              null,
            ),
          }
        : { collections: connection([], false, null) },
    ) as unknown as SitemapRequest

    const xml = await generateSitemapXml(request)
    expect(xml).toContain('<lastmod>2026-07-03T12:30:00Z</lastmod>')
  })
})

describe('buildSitemapXml', () => {
  it('is well-formed with the urlset namespace and escapes XML', () => {
    const xml = buildSitemapXml([
      { path: '/products/a&b', lastmod: '2026-01-01T00:00:00Z' },
    ])
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    )
    expect(xml).toContain('a&amp;b')
    expect(xml.trim().endsWith('</urlset>')).toBe(true)
  })
})

describe('buildRobotsTxt', () => {
  it('contains the absolute Sitemap line and the /api/ disallow', () => {
    const robots = buildRobotsTxt()
    expect(robots).toContain('Sitemap: https://jewelry-aura.com/sitemap.xml')
    expect(robots).toContain('Disallow: /api/')
    expect(robots).toContain('Allow: /')
  })
})
