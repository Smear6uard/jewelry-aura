import { describe, expect, it, vi } from 'vitest'
import {
  buildRobotsTxt,
  buildSitemapXml,
  generateSitemapXml,
  type SitemapRequest,
} from './sitemap'
import { PAGE_HANDLES } from '../pages-content'
import { virtualCollectionHandles } from './virtual-collections'

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

    expect(xml).toContain('<loc>https://www.thejewelryaura.com/</loc>')
    expect(xml).toContain('<loc>https://www.thejewelryaura.com/shop</loc>')
    expect(xml).toContain('/products/piece-0</loc>')
    expect(xml).toContain('/products/piece-250</loc>')
    expect(xml).toContain('/collections/col-0</loc>')
    expect(xml).toContain('/collections/col-250</loc>')
    // Static routes + 251 collections + 251 products + the menu handles
    // Shopify has no collection for (none of the fixture's `col-N`
    // handles collide with them, so all are listed). Both counts are
    // derived rather than hardcoded so adding a content page or a
    // category does not fail an assertion about cursor pagination.
    const STATIC_ROUTES = 2 + 1 + PAGE_HANDLES.length // home, /shop, /custom, /pages/*
    const MENU_ONLY = virtualCollectionHandles().length
    expect(xml.match(/<url>/g)).toHaveLength(
      STATIC_ROUTES + 251 + 251 + MENU_ONLY,
    )
    // Every menu handle is crawlable even with no Shopify collection.
    expect(xml).toContain('<loc>https://www.thejewelryaura.com/collections/earrings</loc>')
    expect(xml).toContain(
      '<loc>https://www.thejewelryaura.com/collections/womens-rings</loc>',
    )
    expect(xml).toContain('<loc>https://www.thejewelryaura.com/custom</loc>')
    expect(xml).toContain(
      `<loc>https://www.thejewelryaura.com/pages/${PAGE_HANDLES[0]}</loc>`,
    )
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
    expect(robots).toContain('Sitemap: https://www.thejewelryaura.com/sitemap.xml')
    expect(robots).toContain('Disallow: /api/')
    expect(robots).toContain('Allow: /')
  })
})
