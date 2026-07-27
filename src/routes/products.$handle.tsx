/**
 * routes/products.$handle.tsx — product detail page (plan U4).
 *
 * Variant selection lives in URL search params and resolves server-side
 * (shareable, SSR'd variant states). Product JSON-LD binds the
 * displayed variant's live price and availability (KTD10). PDP cache
 * policy is the conservative s-maxage=900 until the live purge check
 * passes (KTD2).
 *
 * No entry animation anywhere on this page. The PDP is the last screen
 * before a purchase decision; every frame spent revealing content is a
 * frame the shopper spends waiting to read a price.
 */

import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Accordion } from '~/components/commerce/Accordion'
import { AddToCart } from '~/components/commerce/AddToCart'
import { Breadcrumbs } from '~/components/commerce/Breadcrumbs'
import { ProductGallery } from '~/components/commerce/ProductGallery'
import { ProductRail } from '~/components/commerce/ProductRail'
import { VariantSelector } from '~/components/commerce/VariantSelector'
import { FREE_SHIPPING_THRESHOLD, STORE } from '~/lib/catalog'
import {
  isValidHandle,
  mapProductDetail,
  type ProductCardModel,
  type ProductDetailModel,
  type ProductDetailNode,
} from '~/lib/shopify/adapters'
import { PRODUCT_QUERY } from '~/lib/shopify/queries'
import {
  SITE_URL,
  breadcrumbJsonLd,
  jsonLdScript,
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

interface ProductPageData {
  product: ProductDetailModel
  /** Reuses the best-sellers query — no new Shopify surface. */
  related: ProductCardModel[]
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
  .handler(async ({ data }): Promise<ProductPageData | null> => {
    const [{ storefrontRequest }, { getBestSellersLogic }] = await Promise.all([
      import('~/lib/shopify/client'),
      import('~/lib/shopify/best-sellers'),
    ])

    const result = await storefrontRequest<ProductData>(PRODUCT_QUERY, {
      variables: { handle: data.handle, selectedOptions: data.selected },
    })
    if (!result.product) return null

    // A missing recommendation rail is a cosmetic loss; a 500 on a
    // product page is a lost sale. Never let it take the page down.
    const related = await getBestSellersLogic(storefrontRequest, 8).catch(
      () => [] as ProductCardModel[],
    )

    return {
      product: mapProductDetail(result.product),
      related: related.filter((card) => card.handle !== data.handle).slice(0, 4),
    }
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
    const data = await getProduct({
      data: { handle: params.handle, selected },
    })
    if (!data) throw notFound()
    return data
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
    const product = loaderData.product
    const path = `/products/${params.handle}`
    // Canonical is the clean product URL — variant params never fragment it.
    const canonical = `${SITE_URL}${path}`
    const title = `${product.seoTitle} | Jewelry Aura`
    const description =
      product.seoDescription ||
      `${product.title} — hand-finished to order at the Jewelry Aura workshop. Real gold and certified stones.`
    const firstImage = product.images[0]
    const offer = product.offer

    return {
      meta: [
        ...pageMeta({
          title,
          description,
          url: canonical,
          ogType: 'product',
          image: firstImage?.src,
          imageAlt: firstImage?.alt ?? product.title,
        }),
        // Open Graph product namespace — lets rich unfurls and Shopping
        // surfaces read the live price/availability off the share.
        ...(offer
          ? [
              { property: 'product:price:amount', content: offer.price },
              { property: 'product:price:currency', content: offer.currency },
              {
                property: 'product:availability',
                content: offer.available ? 'in stock' : 'out of stock',
              },
              { property: 'product:condition', content: 'new' },
              { property: 'product:brand', content: 'Jewelry Aura' },
            ]
          : []),
      ],
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
          children: jsonLdScript(
            productJsonLd({
              title: product.title,
              description,
              path,
              images: product.images.map((image) => image.src),
              offer: product.offer,
            }),
          ),
        },
        {
          type: 'application/ld+json',
          children: jsonLdScript(
            breadcrumbJsonLd(productCrumbs(product.title, path)),
          ),
        },
      ],
    }
  },
  component: ProductPage,
  notFoundComponent: () => (
    <ProductFallback
      title="That piece isn’t in the case"
      body="It may have found its owner. We can make the same thing — or something closer to what you had in mind."
    />
  ),
  errorComponent: () => (
    <ProductFallback
      title="We couldn’t open this piece"
      body="Give it a moment and try again, or call 630-965-6464 and we’ll pull it up on our side."
    />
  ),
})

function ProductPage() {
  const { product, related } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const onSelect = (search: Record<string, string>) => {
    navigate({ search, resetScroll: false })
  }

  const soldOut = !product.variant || !product.variant.availableForSale
  const onSale = Boolean(product.variant?.compareAtPrice)

  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 md:px-8 md:pb-24 md:pt-8">
      <Breadcrumbs
        items={productCrumbs(product.title, `/products/${product.handle}`)}
        className="mb-5"
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        <div className="md:col-span-5">
          <div className="md:sticky md:top-24">
            {/* The display serif appears on exactly three surfaces
                site-wide; this is one of them. */}
            <h1 className="font-display text-[26px] leading-tight tracking-tight text-cream md:text-[32px]">
              {product.title}
            </h1>

            {product.variant && (
              <p className="mt-3 flex items-baseline gap-3">
                <span className="text-[19px] text-cream">
                  {product.variant.price}
                </span>
                {product.variant.compareAtPrice && (
                  <s className="text-[14px] text-cream-subtle">
                    {product.variant.compareAtPrice}
                  </s>
                )}
                {onSale && (
                  <span className="bg-brand px-2 py-1 text-[10px] label-wide text-cream">
                    Sale
                  </span>
                )}
                {!product.variant.availableForSale && (
                  <span className="text-[11px] label text-cream-subtle">
                    Sold out
                  </span>
                )}
              </p>
            )}

            <p className="mt-2 text-[12px] text-cream-subtle">
              Free shipping over ${FREE_SHIPPING_THRESHOLD} · Lifetime warranty
            </p>

            {product.options.length > 0 && (
              <div className="mt-7">
                <VariantSelector
                  options={product.options}
                  onSelect={onSelect}
                />
              </div>
            )}

            <div className="mt-7">
              <AddToCart
                merchandiseId={product.variant?.id ?? null}
                soldOut={soldOut}
              />
            </div>

            <div className="mt-9">
              <Accordion items={accordionFor(product)} />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-8 md:mt-14">
          <ProductRail
            title="You may also like"
            products={related}
            link={{ href: '/shop', label: 'Shop all' }}
            limit={4}
          />
        </div>
      )}
    </main>
  )
}

/**
 * The four sections every PDP carries. Details is the product's own
 * description; the rest restate the policies the trust band and the
 * policy pages state, in the words a shopper wants them here — one
 * paragraph, not a page.
 */
function accordionFor(product: ProductDetailModel) {
  return [
    {
      title: 'Details',
      body: product.description
        ? [product.description]
        : [
            'Hand-finished in our workshop. Call us for exact weight, dimensions or stone specification on this piece — we have the bench notes.',
          ],
    },
    {
      title: 'Materials',
      body: [
        'Solid karat gold, stamped, never plated over base metal. Where a piece is gold-filled or plated it says so in the title and the description above.',
        'Stones are natural diamond or certified moissanite as specified. We can tell you exactly which, and why we chose it for this piece.',
      ],
    },
    {
      title: 'Shipping and returns',
      body: [
        `Free insured shipping on U.S. orders over $${FREE_SHIPPING_THRESHOLD}, signature required on delivery. In-stock pieces leave the bench within two business days.`,
        'Unworn stock pieces can be returned within 30 days. Custom work is made to an approved specification and is final sale.',
      ],
    },
    {
      title: 'Care',
      body: [
        'Warm water, mild soap, a soft brush. Take gold off before the gym, the pool and the shower — chlorine and impact do more damage than years of wear.',
        `Bring anything you bought here in for free cleaning, polishing and a prong check any time. No appointment: ${STORE.phone}.`,
      ],
    },
  ]
}

function ProductFallback({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
      <h1 className="font-display text-[28px] tracking-tight text-cream md:text-[38px]">
        {title}
      </h1>
      <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-cream-muted">
        {body}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/shop"
          className="inline-flex items-center bg-brand px-6 py-3 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover"
        >
          Shop all pieces
        </a>
        <a
          href="/custom"
          className="inline-flex items-center border border-hairline px-6 py-3 text-[11px] label text-cream-muted transition-colors duration-hover ease-apple hover:border-cream-subtle hover:text-cream"
        >
          Start a custom piece
        </a>
      </div>
    </main>
  )
}
