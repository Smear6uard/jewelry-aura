/**
 * routes/products.$handle.tsx — product detail page (plan U4).
 *
 * Variant selection lives in URL search params and resolves server-side
 * (shareable, SSR'd variant states). Product JSON-LD binds the displayed
 * variant's live price/availability (KTD10). PDP cache policy is the
 * conservative s-maxage=900 until the live purge check passes (KTD2).
 */

import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Header } from '~/components/layout/Header'
import { AddToCartButton } from '~/components/shop/AddToCartButton'
import { Breadcrumbs } from '~/components/shop/Breadcrumbs'
import { CatalogFallback } from '~/components/shop/CatalogFallback'
import { Price } from '~/components/shop/Price'
import { ProductGallery } from '~/components/shop/ProductGallery'
import { ShopCta } from '~/components/shop/ShopCta'
import { VariantSelector } from '~/components/shop/VariantSelector'
import {
  isValidHandle,
  mapProductDetail,
  type ProductDetailNode,
} from '~/lib/shopify/adapters'
import { PRODUCT_QUERY } from '~/lib/shopify/queries'
import {
  SITE_URL,
  breadcrumbJsonLd,
  pageMeta,
  productJsonLd,
  type BreadcrumbItem,
} from '~/lib/seo'

function productCrumbs(title: string, path: string): BreadcrumbItem[] {
  return [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: title, path },
  ]
}

const MAX_OPTION_PARAMS = 5

type OptionSearch = Record<string, string>

interface ProductData {
  product: ProductDetailNode | null
}

const getProduct = createServerFn({ method: 'GET' })
  .inputValidator(
    (input: { handle: string; selected: Array<{ name: string; value: string }> }) => {
      if (!input || typeof input.handle !== 'string' || !isValidHandle(input.handle)) {
        throw new Error('Invalid product handle')
      }
      const selected = (Array.isArray(input.selected) ? input.selected : [])
        .filter(
          (o) =>
            o &&
            typeof o.name === 'string' &&
            typeof o.value === 'string' &&
            o.name.length > 0 &&
            o.name.length <= 40 &&
            o.value.length <= 60,
        )
        .slice(0, MAX_OPTION_PARAMS)
      return { handle: input.handle, selected }
    },
  )
  .handler(async ({ data }) => {
    const { storefrontRequest } = await import('~/lib/shopify/client')
    const result = await storefrontRequest<ProductData>(PRODUCT_QUERY, {
      variables: { handle: data.handle, selectedOptions: data.selected },
    })
    return result.product ? mapProductDetail(result.product) : null
  })

export const Route = createFileRoute('/products/$handle')({
  validateSearch: (search: Record<string, unknown>): OptionSearch => {
    const entries = Object.entries(search)
      .filter(
        ([key, value]) =>
          typeof value === 'string' &&
          key.length > 0 &&
          key.length <= 40 &&
          value.length <= 60,
      )
      .slice(0, MAX_OPTION_PARAMS)
    return Object.fromEntries(entries) as OptionSearch
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ params, deps }) => {
    if (!isValidHandle(params.handle)) throw notFound()

    const selected = Object.entries(deps.search).map(([name, value]) => ({
      name,
      value,
    }))
    const product = await getProduct({
      data: { handle: params.handle, selected },
    })
    if (!product) throw notFound()
    return product
  },
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  headers: ({ params }) => ({
    // KTD2: conservative PDP TTL until the live webhook purge is proven,
    // then this may rise toward 86400.
    'Cache-Control':
      'public, max-age=0, s-maxage=900, stale-while-revalidate=86400',
    'Vercel-Cache-Tag': isValidHandle(params.handle)
      ? `product-${params.handle},products`
      : 'products',
  }),
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: 'Piece not found | Jewelry Aura' }] }
    }
    const path = `/products/${params.handle}`
    // Canonical is the clean product URL — variant params never fragment it.
    const canonical = `${SITE_URL}${path}`
    const title = `${loaderData.seoTitle} | Jewelry Aura`
    const description =
      loaderData.seoDescription ||
      `${loaderData.title} — hand-finished at the Jewelry Aura workshop in Norridge, IL.`
    const firstImage = loaderData.images[0]

    return {
      meta: pageMeta({
        title,
        description,
        url: canonical,
        ogType: 'product',
        image: firstImage?.src,
      }),
      links: [
        { rel: 'canonical', href: canonical },
        { rel: 'preconnect', href: 'https://cdn.shopify.com' },
        // Preload the above-fold LCP gallery image (R21).
        ...(firstImage
          ? [
              {
                rel: 'preload',
                as: 'image',
                href: firstImage.src,
                imageSrcSet: firstImage.srcSet,
                imageSizes: '(min-width: 768px) 50vw, 100vw',
                fetchPriority: 'high',
              } as const,
            ]
          : []),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(
            productJsonLd({
              title: loaderData.title,
              description,
              path,
              images: loaderData.images.map((image) => image.src),
              offer: loaderData.offer,
            }),
          ),
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify(
            breadcrumbJsonLd(productCrumbs(loaderData.title, path)),
          ),
        },
      ],
    }
  },
  component: ProductPage,
  notFoundComponent: () => (
    <CatalogFallback
      eyebrow="Not in the case"
      headline="That piece isn’t in the shop — it may have found its owner."
    />
  ),
  errorComponent: () => (
    <CatalogFallback
      eyebrow="A momentary pause"
      headline="We couldn’t open this piece. Give it a breath and try again."
    />
  ),
})

function ProductPage() {
  const product = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const onSelect = (search: Record<string, string>) => {
    navigate({ search, resetScroll: false })
  }

  const soldOut = !product.variant || !product.variant.availableForSale

  return (
    <div className="grain-overlay">
      <Header solid />
      <main className="bg-forest text-cream">
        <section className="mx-auto max-w-[1440px] px-6 pb-24 pt-32 md:px-12 md:pb-32 md:pt-44">
          <Breadcrumbs
            items={productCrumbs(product.title, `/products/${product.handle}`)}
            className="mb-10"
          />

          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-7">
              <ProductGallery images={product.images} title={product.title} />
            </div>

            <div className="md:col-span-5 md:pl-8 lg:pl-16">
              <div className="md:sticky md:top-28">
                <h1 className="font-display text-4xl font-light leading-[1.02] tracking-tight text-cream md:text-5xl">
                  {product.title}
                </h1>

                <div className="mt-5">
                  {product.variant && (
                    <Price
                      price={product.variant.price}
                      compareAtPrice={product.variant.compareAtPrice}
                      availableForSale={product.variant.availableForSale}
                    />
                  )}
                </div>

                {product.description && (
                  <p className="mt-8 max-w-[52ch] font-sans text-[15px] font-light leading-relaxed text-cream-muted">
                    {product.description}
                  </p>
                )}

                <div className="mt-10">
                  <VariantSelector
                    options={product.options}
                    onSelect={onSelect}
                  />
                </div>

                <div className="mt-10">
                  <AddToCartButton
                    merchandiseId={product.variant?.id ?? null}
                    soldOut={soldOut}
                  />
                  <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-cream-muted/70">
                    Hand-finished in Norridge, IL
                  </p>
                </div>

                <div
                  className="mt-12 border-t border-champagne/15 pt-6"
                  style={{ borderTopWidth: '0.5px' }}
                >
                  <p className="font-sans text-[13px] font-light leading-relaxed text-cream-muted">
                    Want it resized, engraved, or reimagined?{' '}
                    <a
                      href="/#visit"
                      className="text-cream underline decoration-champagne/60 underline-offset-4 transition-colors duration-hover ease-apple hover:text-champagne"
                    >
                      Talk to the workshop
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ShopCta />
      </main>
    </div>
  )
}
