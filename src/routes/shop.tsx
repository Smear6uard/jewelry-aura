/**
 * routes/shop.tsx — the all-products catalog page (plan U2).
 *
 * Fully SSR'd (buffered, KTD12): product data is fetched server-side via a
 * server function, rendered into the HTML, and cached at the CDN with SWR
 * headers + cache tags (KTD1/KTD2). The route never sets cookies (KTD3).
 */

import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Header } from '~/components/layout/Header'
import { CatalogFallback } from '~/components/shop/CatalogFallback'
import { ProductGrid } from '~/components/shop/ProductGrid'
import { ShopCta } from '~/components/shop/ShopCta'
import { mapProductCard, type ProductCardNode } from '~/lib/shopify/adapters'
import { SHOP_PRODUCTS_QUERY } from '~/lib/shopify/queries'
import {
  HERO_SOCIAL_IMAGE,
  HERO_SOCIAL_IMAGE_ALT,
  SITE_URL,
  itemListJsonLd,
  jsonLdScript,
  pageMeta,
} from '~/lib/seo'

const PAGE_TITLE =
  "Shop Men's Gold Chains, Moissanite & Pendants | Jewelry Aura"
const PAGE_DESCRIPTION =
  'Shop every piece from the Jewelry Aura workshop — custom gold chains, moissanite, pendants, rings & bracelets, hand-finished to order. Repairs welcome.'

interface ShopProductsData {
  products: {
    nodes: ProductCardNode[]
  }
}

const getShopProducts = createServerFn({ method: 'GET' }).handler(
  async () => {
    // Imported lazily so this server-only module never enters the client
    // graph through the route file.
    const { storefrontRequest } = await import('~/lib/shopify/client')
    const data = await storefrontRequest<ShopProductsData>(
      SHOP_PRODUCTS_QUERY,
      { variables: { first: 24 } },
    )
    return data.products.nodes.map(mapProductCard)
  },
)

export const Route = createFileRoute('/shop')({
  loader: () => getShopProducts(),
  // Client-side SWR for in-app navigation (KTD5); CDN handles shared cache.
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
    const products = loaderData ?? []
    return {
      meta: pageMeta({
        title: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        url: `${SITE_URL}/shop`,
        image: HERO_SOCIAL_IMAGE,
        imageAlt: HERO_SOCIAL_IMAGE_ALT,
      }),
      links: [
        { rel: 'canonical', href: `${SITE_URL}/shop` },
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
                ),
              ),
            },
          ]
        : [],
    }
  },
  component: ShopPage,
  errorComponent: () => (
    <CatalogFallback
      eyebrow="The cases are closed for a moment"
      headline="We couldn’t reach the collection. Give it a breath and try again."
      ctaLabel="Reload the shop"
    />
  ),
})

function ShopPage() {
  const products = Route.useLoaderData()

  return (
    <div className="grain-overlay">
      <Header solid />
      <main className="bg-forest text-cream">
        <section className="mx-auto max-w-[1440px] px-6 pb-24 pt-36 md:px-12 md:pb-40 md:pt-48">
          <header className="mb-16 md:mb-28">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-champagne">
              The collection
            </p>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 md:mt-8">
              <h1 className="max-w-3xl font-display text-5xl font-light leading-[0.95] tracking-tight text-cream md:text-7xl">
                Every piece leaves
                <span className="italic"> the bench</span> ready to be worn
                for decades.
              </h1>
              <p className="mb-1 shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-cream-muted">
                {products.length} {products.length === 1 ? 'piece' : 'pieces'}
              </p>
            </div>
          </header>

          <ProductGrid products={products} />
        </section>

        <ShopCta />
      </main>
    </div>
  )
}
