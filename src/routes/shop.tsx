/**
 * routes/shop.tsx — the all-products catalog (plan U2), now a full PLP.
 *
 * Fully SSR'd (buffered, KTD12): product data is fetched server-side,
 * filtered and paginated server-side, rendered into the HTML, and
 * cached at the CDN with SWR headers + cache tags (KTD1/KTD2). The
 * route never sets cookies (KTD3).
 *
 * Facets live in search params, so `/shop?price=under-250` is a real
 * URL a shopper can share and a crawler can index — which is also what
 * makes the homepage's Shop-by-price band work with no extra plumbing.
 */

import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { ListingLayout } from '~/components/commerce/ListingLayout'
import { ProductGrid } from '~/components/commerce/ProductGrid'
import { type ProductCardNode } from '~/lib/shopify/adapters'
import {
  facetsFromSearch,
  hasActiveFacets,
  listingHref,
  parseFacets,
  type Facets,
} from '~/lib/shopify/facets'
import { buildListing } from '~/lib/shopify/listing'
import { SHOP_PRODUCTS_QUERY } from '~/lib/shopify/queries'
import { BTN_PRIMARY } from '~/lib/ui'
import {
  HERO_SOCIAL_IMAGE,
  HERO_SOCIAL_IMAGE_ALT,
  SITE_URL,
  itemListJsonLd,
  jsonLdScript,
  pageMeta,
} from '~/lib/seo'

const PER_PAGE = 24
const BASE_PATH = '/shop'

const PAGE_TITLE =
  "Shop Men's Gold Chains, Moissanite & Pendants | Jewelry Aura"
const PAGE_DESCRIPTION =
  'Shop every piece from the Jewelry Aura workshop — custom gold chains, moissanite, pendants, rings & bracelets, hand-finished to order. Repairs welcome.'

interface ShopProductsData {
  products: { nodes: ProductCardNode[] }
}

const getShopProducts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ProductCardNode[]> => {
    // Imported lazily so this server-only module never enters the client
    // graph through the route file.
    const { storefrontRequest } = await import('~/lib/shopify/client')
    const data = await storefrontRequest<ShopProductsData>(
      SHOP_PRODUCTS_QUERY,
      { variables: { first: 250 } },
    )
    return data.products.nodes
  },
)

export const Route = createFileRoute('/shop')({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = Number(search.page)
    const page = Number.isInteger(raw) && raw >= 2 ? raw : undefined
    return { ...parseFacets(search), page }
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const nodes = await getShopProducts()
    const facets: Facets = facetsFromSearch(deps)
    return { ...buildListing(nodes, facets, deps.page ?? 1, PER_PAGE), facets }
  },
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  headers: () => ({
    // Collection-class policy (KTD2): short s-maxage, long SWR — listing
    // membership has no reliable webhook, the timer is the freshness bound.
    'Cache-Control':
      'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    'Vercel-Cache-Tag': 'products,collections',
  }),
  head: ({ loaderData }) => {
    const products = loaderData?.products ?? []
    const facets = loaderData?.facets ?? {}
    const filtered = hasActiveFacets(facets)
    const canonical = `${SITE_URL}${listingHref(
      BASE_PATH,
      facets,
      loaderData?.page ?? 1,
    )}`

    return {
      meta: [
        ...pageMeta({
          title: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          url: canonical,
          image: HERO_SOCIAL_IMAGE,
          imageAlt: HERO_SOCIAL_IMAGE_ALT,
        }),
        // Facet permutations are near-infinite and individually thin.
        // The unfiltered catalog is the page worth indexing; filtered
        // views stay followable so crawlers still reach the products.
        ...(filtered
          ? [{ name: 'robots', content: 'noindex, follow' }]
          : []),
      ],
      links: [
        { rel: 'canonical', href: canonical },
        { rel: 'preconnect', href: 'https://cdn.shopify.com' },
      ],
      // ItemList of the listed pieces — the storefront's catalog page is
      // eligible for a product carousel; competitors ship no such markup.
      scripts: products.length
        ? [
            {
              type: 'application/ld+json',
              children: jsonLdScript(
                itemListJsonLd(
                  products.map((product) => `/products/${product.handle}`),
                  ((loaderData?.page ?? 1) - 1) * PER_PAGE + 1,
                ),
              ),
            },
          ]
        : [],
    }
  },
  component: ShopPage,
  errorComponent: () => (
    <main className="mx-auto max-w-[1440px] px-4 py-20 md:px-8">
      <h1 className="display text-[28px] text-ink md:text-[38px]">
        The catalog didn’t load
      </h1>
      <p className="mt-3 max-w-[52ch] text-[15px] text-ink-muted">
        Give it a moment and try again — or call 630-965-6464 and we’ll tell you
        what’s in the case right now.
      </p>
      <a href="/shop" className={`${BTN_PRIMARY} mt-6`}>
        Reload the shop
      </a>
      <div className="mt-12">
        <ProductGrid products={[]} />
      </div>
    </main>
  ),
})

function ShopPage() {
  const data = Route.useLoaderData()

  const hrefForFacets = (patch: Partial<Facets>) =>
    listingHref(BASE_PATH, { ...data.facets, ...patch }, 1)
  const hrefForPage = (page: number) =>
    listingHref(BASE_PATH, data.facets, page)

  return (
    <ListingLayout
      title="Every piece"
      description="Chains, pendants, bracelets and rings from the bench — plus the stones and gold we keep in the case."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Shop', path: BASE_PATH },
      ]}
      products={data.products}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      facets={data.facets}
      counts={data.counts}
      // The catch-all catalog spans every category, so it offers the
      // cross-category facets (metal, price) and no style list — style
      // vocabulary is category-specific and "Cuban" would mean chains
      // and bracelets at once here.
      styles={[]}
      hrefForFacets={hrefForFacets}
      hrefForPage={hrefForPage}
      clearHref={BASE_PATH}
    />
  )
}
