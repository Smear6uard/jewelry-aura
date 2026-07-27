// Sitemap generation (plan U8). Pure logic with an injected request
// function so the cursor loops and XML shape are unit-testable.

import {
  SITEMAP_COLLECTIONS_QUERY,
  SITEMAP_PRODUCTS_QUERY,
} from './queries'
import { SITE_URL } from '../seo'
import { PAGE_HANDLES } from '../pages-content'

const PAGE_SIZE = 250

export interface SitemapHandleNode {
  handle: string
  updatedAt: string
}

interface HandleConnection {
  nodes: SitemapHandleNode[]
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
}

export type SitemapRequest = <TData>(
  operation: string,
  options?: { variables?: Record<string, unknown> },
) => Promise<TData>

async function collectAll(
  request: SitemapRequest,
  operation: string,
  key: 'products' | 'collections',
): Promise<SitemapHandleNode[]> {
  const all: SitemapHandleNode[] = []
  let after: string | null = null
  do {
    const data: Record<string, HandleConnection> = await request(operation, {
      variables: { first: PAGE_SIZE, after },
    })
    const connection: HandleConnection = data[key]
    all.push(...connection.nodes)
    after = connection.pageInfo.hasNextPage
      ? connection.pageInfo.endCursor
      : null
  } while (after)
  return all
}

export interface SitemapEntry {
  path: string
  lastmod?: string
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll("'", '&apos;')
    .replaceAll('"', '&quot;')
}

export function buildSitemapXml(entries: ReadonlyArray<SitemapEntry>): string {
  const urls = entries
    .map((entry) => {
      const loc = `<loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>`
      const lastmod = entry.lastmod
        ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>`
        : ''
      return `  <url>${loc}${lastmod}</url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

/**
 * Enumerates homepage, /shop, every collection, and every product —
 * products and collections walked with cursor pagination (250/page).
 */
export async function generateSitemapXml(
  request: SitemapRequest,
): Promise<string> {
  const [products, collections] = await Promise.all([
    collectAll(request, SITEMAP_PRODUCTS_QUERY, 'products'),
    collectAll(request, SITEMAP_COLLECTIONS_QUERY, 'collections'),
  ])

  const entries: SitemapEntry[] = [
    { path: '/' },
    { path: '/shop' },
    { path: '/custom' },
    // Static content pages. /search and /cart are deliberately absent —
    // both are noindex, and listing them would ask crawlers to spend
    // budget on pages we have told them not to keep.
    ...PAGE_HANDLES.map((handle) => ({ path: `/pages/${handle}` })),
    ...collections.map((c) => ({
      path: `/collections/${c.handle}`,
      lastmod: c.updatedAt,
    })),
    ...products.map((p) => ({
      path: `/products/${p.handle}`,
      lastmod: p.updatedAt,
    })),
  ]

  return buildSitemapXml(entries)
}

export function buildRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
}
