/**
 * routes/collections.$handle.tsx — collection PLP with facets and
 * crawlable numbered pagination (plan U3).
 *
 * One 250-product fetch, then filter → sort → slice, all server-side
 * (KTD8). Filtering before the slice is what makes `?style=cuban&page=2`
 * mean what it says. The handle is validated before it reaches the
 * query or the cache-tag header. Fully SSR'd and CDN-cached on the
 * collection policy (KTD2).
 *
 * When Shopify has no collection under the handle, the route falls back
 * to a virtual collection derived from product titles rather than
 * throwing a 404 — see lib/shopify/virtual-collections.ts. That is what
 * lets the menu ship its full taxonomy before the admin has the
 * collections to back it. A real collection always wins; the fallback
 * costs one extra query and only on the miss.
 */

import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { ListingLayout } from '~/components/commerce/ListingLayout'
import { findCategory, parentOfWomens } from '~/lib/catalog'
import {
  isValidHandle,
  type CollectionNode,
  type ProductCardNode,
} from '~/lib/shopify/adapters'
import {
  facetsFromSearch,
  hasActiveFacets,
  listingHref,
  parseFacets,
  type Facets,
} from '~/lib/shopify/facets'
import { buildListing } from '~/lib/shopify/listing'
import { COLLECTION_QUERY, SHOP_PRODUCTS_QUERY } from '~/lib/shopify/queries'
import { BTN_PRIMARY } from '~/lib/ui'
import {
  HERO_SOCIAL_IMAGE,
  SITE_URL,
  breadcrumbJsonLd,
  itemListJsonLd,
  jsonLdScript,
  pageMeta,
  type BreadcrumbItem,
} from '~/lib/seo'

const PER_PAGE = 24

interface CollectionData {
  collection: CollectionNode | null
}

interface ShopProductsData {
  products: { nodes: ProductCardNode[] }
}

interface CollectionShell {
  handle: string
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  nodes: ProductCardNode[]
  /** Set only on a virtual collection: where an empty case sends you. */
  emptyAction?: { href: string; label: string }
  emptyBody?: string
}

function collectionCrumbs(title: string, basePath: string): BreadcrumbItem[] {
  return [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: title, path: basePath },
  ]
}

const getCollection = createServerFn({ method: 'GET' })
  .inputValidator((input: { handle: string }) => {
    if (!input || typeof input.handle !== 'string' || !isValidHandle(input.handle)) {
      throw new Error('Invalid collection handle')
    }
    return { handle: input.handle }
  })
  .handler(async ({ data }): Promise<CollectionShell | null> => {
    const { storefrontRequest } = await import('~/lib/shopify/client')
    const result = await storefrontRequest<CollectionData>(COLLECTION_QUERY, {
      variables: { handle: data.handle, first: 250 },
    })
    const collection = result.collection
    if (collection) {
      return {
        handle: collection.handle,
        title: collection.title,
        description: collection.description,
        seoTitle: collection.seo?.title || collection.title,
        seoDescription: collection.seo?.description || collection.description,
        nodes: collection.products.nodes,
      }
    }

    // No collection under this handle. If the menu promises one, build it
    // from the catalog; if nothing links here, it stays a 404.
    const { findVirtualCollection, selectVirtual } = await import(
      '~/lib/shopify/virtual-collections'
    )
    const virtual = findVirtualCollection(data.handle)
    if (!virtual) return null

    const catalog = await storefrontRequest<ShopProductsData>(
      SHOP_PRODUCTS_QUERY,
      { variables: { first: 250 } },
    )
    return {
      handle: virtual.handle,
      title: virtual.title,
      description: virtual.description,
      seoTitle: virtual.title,
      seoDescription: virtual.description,
      nodes: selectVirtual(catalog.products.nodes, virtual),
      emptyAction: virtual.emptyAction,
      emptyBody: virtual.emptyBody,
    }
  })

export const Route = createFileRoute('/collections/$handle')({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = Number(search.page)
    const page = Number.isInteger(raw) && raw >= 2 ? raw : undefined
    return { ...parseFacets(search), page }
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    // 404 before any fetch or cache-tag for malformed handles.
    if (!isValidHandle(params.handle)) throw notFound()

    const collection = await getCollection({ data: { handle: params.handle } })
    if (!collection) throw notFound()

    const facets: Facets = facetsFromSearch(deps)
    const listing = buildListing(
      collection.nodes,
      facets,
      deps.page ?? 1,
      PER_PAGE,
    )

    // Beyond-range pages are 404s, but an empty result still renders its
    // (branded empty) page 1 with the filters intact.
    if ((deps.page ?? 1) > listing.totalPages && listing.total > 0) {
      throw notFound()
    }

    return {
      handle: collection.handle,
      title: collection.title,
      description: collection.description,
      seoTitle: collection.seoTitle,
      seoDescription: collection.seoDescription,
      emptyAction: collection.emptyAction,
      emptyBody: collection.emptyBody,
      facets,
      ...listing,
    }
  },
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  headers: ({ params }) => ({
    'Cache-Control':
      'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    'Vercel-Cache-Tag': isValidHandle(params.handle)
      ? `collection-${params.handle},collections`
      : 'collections',
  }),
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: 'Collection not found | Jewelry Aura' }] }
    }
    const basePath = `/collections/${params.handle}`
    const facets = loaderData.facets
    const filtered = hasActiveFacets(facets)
    const canonical = `${SITE_URL}${listingHref(basePath, facets, loaderData.page)}`
    const title = `${loaderData.seoTitle} | Jewelry Aura`
    const description =
      loaderData.seoDescription ||
      `Shop ${loaderData.title} at Jewelry Aura — hand-finished gold, moissanite, and custom pieces, made to order.`
    // Lead the share card with the first piece in the case; fall back to
    // the brand image on an empty collection.
    const shareImage = loaderData.products[0]?.image?.src ?? HERO_SOCIAL_IMAGE

    const links: Array<Record<string, string>> = [
      { rel: 'canonical', href: canonical },
      { rel: 'preconnect', href: 'https://cdn.shopify.com' },
    ]
    if (loaderData.page > 1) {
      links.push({
        rel: 'prev',
        href: `${SITE_URL}${listingHref(basePath, facets, loaderData.page - 1)}`,
      })
    }
    if (loaderData.page < loaderData.totalPages) {
      links.push({
        rel: 'next',
        href: `${SITE_URL}${listingHref(basePath, facets, loaderData.page + 1)}`,
      })
    }

    return {
      meta: [
        ...pageMeta({
          title,
          description,
          url: canonical,
          image: shareImage,
          imageAlt: loaderData.title,
        }),
        // Facet permutations are thin, near-duplicate pages. The
        // unfiltered collection is what deserves the index slot.
        ...(filtered ? [{ name: 'robots', content: 'noindex, follow' }] : []),
      ],
      links,
      scripts: [
        {
          type: 'application/ld+json',
          children: jsonLdScript(
            breadcrumbJsonLd(collectionCrumbs(loaderData.title, basePath)),
          ),
        },
        // ItemList of this page's products, numbered continuously across
        // the collection so page 2 begins where page 1 ended.
        ...(loaderData.products.length
          ? [
              {
                type: 'application/ld+json',
                children: jsonLdScript(
                  itemListJsonLd(
                    loaderData.products.map(
                      (product) => `/products/${product.handle}`,
                    ),
                    (loaderData.page - 1) * PER_PAGE + 1,
                  ),
                ),
              },
            ]
          : []),
      ],
    }
  },
  component: CollectionPage,
  notFoundComponent: () => (
    <CollectionFallback
      title="That collection isn’t in the shop"
      body="It may have been renamed or retired. The full catalog is one step away."
    />
  ),
  errorComponent: () => (
    <CollectionFallback
      title="We couldn’t open this collection"
      body="Give it a moment and try again, or call 630-965-6464 and we’ll tell you what’s in the case."
    />
  ),
})

function CollectionPage() {
  const data = Route.useLoaderData()
  const basePath = `/collections/${data.handle}`
  // A women's collection filters on its parent category's styles — the
  // pieces are the same vocabulary, cut smaller.
  const category = findCategory(data.handle) ?? parentOfWomens(data.handle)

  const hrefForFacets = (patch: Partial<Facets>) =>
    listingHref(basePath, { ...data.facets, ...patch }, 1)
  const hrefForPage = (page: number) =>
    listingHref(basePath, data.facets, page)

  return (
    <ListingLayout
      title={data.title}
      description={data.description}
      breadcrumbs={collectionCrumbs(data.title, basePath)}
      products={data.products}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      facets={data.facets}
      counts={data.counts}
      styles={category?.styles ?? []}
      activeCategory={data.handle}
      hrefForFacets={hrefForFacets}
      hrefForPage={hrefForPage}
      clearHref={basePath}
      emptyAction={data.emptyAction}
      emptyBody={data.emptyBody}
    />
  )
}

function CollectionFallback({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
      <h1 className="display text-[28px] text-ink md:text-[38px]">{title}</h1>
      <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-muted">
        {body}
      </p>
      <a href="/shop" className={`${BTN_PRIMARY} mt-6`}>
        Shop all pieces
      </a>
    </main>
  )
}
