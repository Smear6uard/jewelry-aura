/**
 * routes/collections.$handle.tsx — collection page with crawlable
 * numbered pagination (plan U3).
 *
 * One 250-product fetch, sliced server-side per ?page=N (KTD8). The
 * handle is validated before it reaches the query or the cache-tag
 * header. Fully SSR'd and CDN-cached on the collection policy (KTD2).
 */

import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Header } from '~/components/layout/Header'
import { Pagination } from '~/components/shop/Pagination'
import { ProductGrid } from '~/components/shop/ProductGrid'
import { ShopCta } from '~/components/shop/ShopCta'
import {
  isValidHandle,
  mapCollection,
  paginate,
  type CollectionNode,
} from '~/lib/shopify/adapters'
import { COLLECTION_QUERY } from '~/lib/shopify/queries'
import { SITE_URL, breadcrumbJsonLd } from '~/lib/seo'

const PER_PAGE = 24

interface CollectionData {
  collection: CollectionNode | null
}

const getCollection = createServerFn({ method: 'GET' })
  .inputValidator((input: { handle: string }) => {
    if (!input || typeof input.handle !== 'string' || !isValidHandle(input.handle)) {
      throw new Error('Invalid collection handle')
    }
    return input
  })
  .handler(async ({ data }) => {
    const { storefrontRequest } = await import('~/lib/shopify/client')
    const result = await storefrontRequest<CollectionData>(COLLECTION_QUERY, {
      variables: { handle: data.handle, first: 250 },
    })
    return result.collection ? mapCollection(result.collection) : null
  })

export const Route = createFileRoute('/collections/$handle')({
  validateSearch: (search: Record<string, unknown>): { page?: number } => {
    const raw = Number(search.page)
    // Anything non-numeric or < 2 normalizes to the clean URL state.
    if (!Number.isInteger(raw) || raw < 2) return {}
    return { page: raw }
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ params, deps }) => {
    // 404 before any fetch or cache-tag for malformed handles.
    if (!isValidHandle(params.handle)) throw notFound()

    const collection = await getCollection({ data: { handle: params.handle } })
    if (!collection) throw notFound()

    const pageData = paginate(collection.products, deps.page, PER_PAGE)
    // Beyond-range pages are 404s, but an empty collection still renders
    // its (branded empty) page 1.
    if (deps.page > pageData.totalPages) throw notFound()

    return {
      handle: collection.handle,
      title: collection.title,
      description: collection.description,
      seoTitle: collection.seoTitle,
      seoDescription: collection.seoDescription,
      products: pageData.items,
      page: pageData.page,
      totalPages: pageData.totalPages,
      total: pageData.total,
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
    const canonical =
      loaderData.page <= 1
        ? `${SITE_URL}${basePath}`
        : `${SITE_URL}${basePath}?page=${loaderData.page}`
    const title = `${loaderData.seoTitle} | Jewelry Aura`
    const description =
      loaderData.seoDescription ||
      `Shop the ${loaderData.title} collection from the Jewelry Aura workshop in Norridge, IL.`

    const links = [
      { rel: 'canonical', href: canonical },
      { rel: 'preconnect', href: 'https://cdn.shopify.com' },
    ]
    if (loaderData.page > 1) {
      links.push({
        rel: 'prev',
        href:
          loaderData.page === 2
            ? `${SITE_URL}${basePath}`
            : `${SITE_URL}${basePath}?page=${loaderData.page - 1}`,
      })
    }
    if (loaderData.page < loaderData.totalPages) {
      links.push({
        rel: 'next',
        href: `${SITE_URL}${basePath}?page=${loaderData.page + 1}`,
      })
    }

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonical },
        { property: 'og:site_name', content: 'Jewelry Aura' },
      ],
      links,
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: loaderData.title, path: basePath },
            ]),
          ),
        },
      ],
    }
  },
  component: CollectionPage,
  notFoundComponent: CollectionNotFound,
  errorComponent: CollectionError,
})

function CollectionPage() {
  const data = Route.useLoaderData()
  const basePath = `/collections/${data.handle}`

  return (
    <div className="grain-overlay">
      <Header solid />
      <main className="bg-forest text-cream">
        <section className="mx-auto max-w-[1440px] px-6 pb-24 pt-36 md:px-12 md:pb-40 md:pt-48">
          <header className="mb-16 md:mb-28">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-cream-muted">
                <li>
                  <a
                    href="/"
                    className="transition-colors duration-hover ease-apple hover:text-cream"
                  >
                    Home
                  </a>
                </li>
                <li aria-hidden className="text-champagne/60">
                  /
                </li>
                <li className="text-champagne">{data.title}</li>
              </ol>
            </nav>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 md:mt-8">
              <h1 className="max-w-3xl font-display text-5xl font-light leading-[0.95] tracking-tight text-cream md:text-7xl">
                {data.title}
              </h1>
              <p className="mb-1 shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-cream-muted">
                {data.total} {data.total === 1 ? 'piece' : 'pieces'}
                {data.totalPages > 1 &&
                  ` · page ${data.page} of ${data.totalPages}`}
              </p>
            </div>
            {data.description && (
              <p className="mt-8 max-w-xl font-sans text-[15px] font-light leading-relaxed text-cream-muted">
                {data.description}
              </p>
            )}
          </header>

          <ProductGrid products={data.products} />

          <Pagination
            basePath={basePath}
            page={data.page}
            totalPages={data.totalPages}
          />
        </section>

        <ShopCta />
      </main>
    </div>
  )
}

function CollectionNotFound() {
  return (
    <div className="grain-overlay">
      <Header solid />
      <main className="flex min-h-[100dvh] items-center bg-forest text-cream">
        <div className="mx-auto max-w-xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream-muted">
            Nothing in this case
          </p>
          <h1 className="mt-6 font-display text-3xl italic leading-snug text-cream md:text-4xl">
            That collection isn&rsquo;t in the shop. The full catalog is one
            step away.
          </h1>
          <a
            href="/shop"
            className="mt-10 inline-flex items-center rounded-full border border-champagne/60 px-6 py-3 font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-cream transition-colors duration-hover ease-apple hover:bg-champagne hover:text-forest active:scale-[0.98]"
            style={{ borderWidth: '0.5px' }}
          >
            Shop all pieces
          </a>
        </div>
      </main>
    </div>
  )
}

function CollectionError() {
  return (
    <div className="grain-overlay">
      <Header solid />
      <main className="flex min-h-[100dvh] items-center bg-forest text-cream">
        <div className="mx-auto max-w-xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream-muted">
            A momentary pause
          </p>
          <h1 className="mt-6 font-display text-3xl italic leading-snug text-cream md:text-4xl">
            We couldn&rsquo;t open this collection. Give it a breath and try
            again.
          </h1>
          <a
            href="/shop"
            className="mt-10 inline-flex items-center rounded-full border border-champagne/60 px-6 py-3 font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-cream transition-colors duration-hover ease-apple hover:bg-champagne hover:text-forest active:scale-[0.98]"
            style={{ borderWidth: '0.5px' }}
          >
            Shop all pieces
          </a>
        </div>
      </main>
    </div>
  )
}
