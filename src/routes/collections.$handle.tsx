/**
 * routes/collections.$handle.tsx — collection page with crawlable
 * numbered pagination (plan U3).
 *
 * One 250-product fetch, sliced server-side per ?page=N (KTD8) — the
 * slice happens before card mapping, so unrendered products cost
 * nothing. The handle is validated before it reaches the query or the
 * cache-tag header. Fully SSR'd and CDN-cached on the collection policy
 * (KTD2).
 */

import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Header } from '~/components/layout/Header'
import { Breadcrumbs } from '~/components/shop/Breadcrumbs'
import { CatalogFallback } from '~/components/shop/CatalogFallback'
import { Pagination, pageHref } from '~/components/shop/Pagination'
import { ProductGrid } from '~/components/shop/ProductGrid'
import { ShopCta } from '~/components/shop/ShopCta'
import {
  isValidHandle,
  mapCollectionPage,
  type CollectionNode,
} from '~/lib/shopify/adapters'
import { COLLECTION_QUERY } from '~/lib/shopify/queries'
import {
  SITE_URL,
  breadcrumbJsonLd,
  jsonLdScript,
  pageMeta,
  type BreadcrumbItem,
} from '~/lib/seo'

const PER_PAGE = 24

interface CollectionData {
  collection: CollectionNode | null
}

function collectionCrumbs(title: string, basePath: string): BreadcrumbItem[] {
  return [
    { name: 'Home', path: '/' },
    { name: title, path: basePath },
  ]
}

const getCollectionPage = createServerFn({ method: 'GET' })
  .inputValidator((input: { handle: string; page: number }) => {
    if (!input || typeof input.handle !== 'string' || !isValidHandle(input.handle)) {
      throw new Error('Invalid collection handle')
    }
    const page =
      Number.isInteger(input.page) && input.page >= 1 ? input.page : 1
    return { handle: input.handle, page }
  })
  .handler(async ({ data }) => {
    const { storefrontRequest } = await import('~/lib/shopify/client')
    const result = await storefrontRequest<CollectionData>(COLLECTION_QUERY, {
      variables: { handle: data.handle, first: 250 },
    })
    return result.collection
      ? mapCollectionPage(result.collection, data.page, PER_PAGE)
      : null
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

    const collection = await getCollectionPage({
      data: { handle: params.handle, page: deps.page },
    })
    if (!collection) throw notFound()
    // Beyond-range pages are 404s, but an empty collection still renders
    // its (branded empty) page 1.
    if (deps.page > collection.totalPages) throw notFound()

    return collection
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
    const canonical = `${SITE_URL}${pageHref(basePath, loaderData.page)}`
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
        href: `${SITE_URL}${pageHref(basePath, loaderData.page - 1)}`,
      })
    }
    if (loaderData.page < loaderData.totalPages) {
      links.push({
        rel: 'next',
        href: `${SITE_URL}${pageHref(basePath, loaderData.page + 1)}`,
      })
    }

    return {
      meta: pageMeta({ title, description, url: canonical }),
      links,
      scripts: [
        {
          type: 'application/ld+json',
          children: jsonLdScript(
            breadcrumbJsonLd(collectionCrumbs(loaderData.title, basePath)),
          ),
        },
      ],
    }
  },
  component: CollectionPage,
  notFoundComponent: () => (
    <CatalogFallback
      eyebrow="Nothing in this case"
      headline="That collection isn’t in the shop. The full catalog is one step away."
    />
  ),
  errorComponent: () => (
    <CatalogFallback
      eyebrow="A momentary pause"
      headline="We couldn’t open this collection. Give it a breath and try again."
    />
  ),
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
            <Breadcrumbs items={collectionCrumbs(data.title, basePath)} />
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
