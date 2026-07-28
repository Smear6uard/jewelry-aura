/**
 * routes/search.tsx — search results, rendered with the PLP shell.
 *
 * Matching runs server-side over the catalog the listing pages already
 * fetch, scoring each product's title against the query's words. It is
 * a small catalog; a title match is what a shopper means by search
 * here, and it costs one request that the CDN is already caching.
 *
 * Results are noindex: search pages are the classic source of thin,
 * infinite, near-duplicate URLs in an index. They stay `follow` so
 * crawlers still reach the products through them.
 */

import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { ListingLayout } from '~/components/commerce/ListingLayout'
import { type ProductCardNode } from '~/lib/shopify/adapters'
import {
  facetsFromSearch,
  listingHref,
  parseFacets,
  type Facets,
} from '~/lib/shopify/facets'
import { buildListing } from '~/lib/shopify/listing'
import { SHOP_PRODUCTS_QUERY } from '~/lib/shopify/queries'
import { SITE_URL, pageMeta } from '~/lib/seo'

const PER_PAGE = 24
const BASE_PATH = '/search'
const MAX_QUERY_LENGTH = 80

interface ShopProductsData {
  products: { nodes: ProductCardNode[] }
}

/**
 * Ranks a title against the query's words. Every word must appear
 * somewhere in the title (an AND match — "gold cuban" should not return
 * every gold piece), and a whole-word hit outranks a substring so
 * "rope" beats "europe" if a title ever contains both.
 */
function score(title: string, words: string[]): number {
  const text = title.toLowerCase()
  let total = 0
  for (const word of words) {
    const at = text.indexOf(word)
    if (at === -1) return 0
    const boundaryBefore = at === 0 || !/[a-z0-9]/.test(text[at - 1])
    total += boundaryBefore ? 2 : 1
    // An early match usually means the word is the head noun.
    if (at < 12) total += 1
  }
  return total
}

const searchProducts = createServerFn({ method: 'GET' })
  .inputValidator((input: { q: string }) => ({
    q: typeof input?.q === 'string' ? input.q.trim().slice(0, MAX_QUERY_LENGTH) : '',
  }))
  .handler(async ({ data }): Promise<ProductCardNode[]> => {
    if (data.q.length < 2) return []

    const { storefrontRequest } = await import('~/lib/shopify/client')
    const result = await storefrontRequest<ShopProductsData>(
      SHOP_PRODUCTS_QUERY,
      { variables: { first: 250 } },
    )

    const words = data.q.toLowerCase().split(/\s+/).filter(Boolean)
    return result.products.nodes
      .map((node) => ({ node, rank: score(node.title, words) }))
      .filter((entry) => entry.rank > 0)
      .sort((a, b) => b.rank - a.rank)
      .map((entry) => entry.node)
  })

export const Route = createFileRoute('/search')({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = Number(search.page)
    const page = Number.isInteger(raw) && raw >= 2 ? raw : undefined
    const q =
      typeof search.q === 'string' ? search.q.slice(0, MAX_QUERY_LENGTH) : ''
    return { ...parseFacets(search), page, q }
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const nodes = await searchProducts({ data: { q: deps.q } })
    const facets: Facets = facetsFromSearch(deps)
    return {
      q: deps.q,
      facets,
      ...buildListing(nodes, facets, deps.page ?? 1, PER_PAGE),
    }
  },
  staleTime: 30_000,
  headers: () => ({
    'Cache-Control':
      'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    'Vercel-Cache-Tag': 'products,search',
  }),
  head: ({ loaderData }) => {
    const q = loaderData?.q ?? ''
    const title = q ? `Search: ${q} | Jewelry Aura` : 'Search | Jewelry Aura'
    return {
      meta: [
        ...pageMeta({
          title,
          description:
            'Search chains, pendants, bracelets, rings and moissanite from the Jewelry Aura workshop.',
          url: `${SITE_URL}/search`,
        }),
        { name: 'robots', content: 'noindex, follow' },
      ],
      links: [{ rel: 'preconnect', href: 'https://cdn.shopify.com' }],
    }
  },
  component: SearchPage,
})

function SearchPage() {
  const data = Route.useLoaderData()

  const hrefForFacets = (patch: Partial<Facets>) =>
    listingHref(BASE_PATH, { ...data.facets, ...patch }, 1, { q: data.q })
  const hrefForPage = (page: number) =>
    listingHref(BASE_PATH, data.facets, page, { q: data.q })

  const title = data.q ? `Results for “${data.q}”` : 'Search'
  const description = data.q
    ? undefined
    : 'Type what you are after — a link style, a metal, a name. Everything in the case is searchable by title.'

  return (
    <ListingLayout
      title={title}
      description={description}
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Search', path: BASE_PATH },
      ]}
      products={data.products}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      facets={data.facets}
      counts={data.counts}
      styles={[]}
      hrefForFacets={hrefForFacets}
      hrefForPage={hrefForPage}
      clearHref={listingHref(BASE_PATH, {}, 1, { q: data.q })}
    />
  )
}
