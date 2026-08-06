/**
 * routes/cart.tsx — the full cart page.
 *
 * The drawer covers the add-to-cart moment; this page covers the review
 * moment — a wider layout, a summary column that stays put while the
 * lines scroll, and room for the shipping and returns terms next to the
 * checkout button rather than a link away from it.
 *
 * Cart state is client-only (CartProvider hydrates post-paint, KTD3),
 * so this route has no loader and is never cached with contents in it.
 */

import { createFileRoute } from '@tanstack/react-router'

import { CartLineItem } from '~/components/commerce/CartLineItem'
import { FreeShippingMeter } from '~/components/commerce/FreeShippingMeter'
import { useCart } from '~/components/commerce/CartProvider'
import { FREE_SHIPPING_THRESHOLD } from '~/lib/catalog'
import { parseFormattedMoney } from '~/lib/shopify/adapters'
import { SITE_URL, pageMeta } from '~/lib/seo'
import { BTN_PRIMARY, BTN_PRIMARY_BLOCK, BTN_SECONDARY } from '~/lib/ui'

export const Route = createFileRoute('/cart')({
  component: CartPage,
  headers: () => ({
    // Never share a cart page between visitors.
    'Cache-Control': 'private, no-store',
  }),
  head: () => ({
    meta: [
      ...pageMeta({
        title: 'Your cart | Jewelry Aura',
        description: 'Review your cart and check out securely.',
        url: `${SITE_URL}/cart`,
      }),
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
})

function CartPage() {
  const { cart, status } = useCart()
  const lines = cart?.lines ?? []

  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-8 md:px-8 md:pb-24 md:pt-10">
      <h1 className="display text-[30px] leading-none text-ink md:text-[40px]">
        Your cart
        {cart && cart.totalQuantity > 0 && (
          <span className="ml-3 text-[18px] text-ink">
            {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'}
          </span>
        )}
      </h1>

      {status === 'loading' && <CartSkeleton />}

      {status === 'ready' && lines.length === 0 && <EmptyCart />}

      {lines.length > 0 && cart && (
        <div className="mt-8 grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7 lg:col-span-8">
            <ul className="divide-y divide-hairline-light bg-bone px-4 border border-hairline-light">
              {lines.map((line) => (
                <CartLineItem key={line.id} line={line} size="page" />
              ))}
            </ul>
            <a
              href="/shop"
              className="mt-4 inline-flex min-h-11 items-center text-[12px] label text-ink underline decoration-hairline-light underline-offset-4 transition-colors duration-hover ease-apple hover:decoration-gold motion-reduce:transition-none"
            >
              Continue shopping
            </a>
          </div>

          <aside className="md:col-span-5 lg:col-span-4">
            <div
              className="bg-bone p-5 border border-hairline-light md:sticky"
              style={{ top: 'calc(var(--header-h) + 1.5rem)' }}
            >
              <h2 className="text-[12px] label text-ink">Summary</h2>

              <div className="mt-4">
                <FreeShippingMeter
                  subtotal={parseFormattedMoney(cart.subtotal)}
                />
              </div>

              <div className="mt-5 flex items-baseline justify-between border-t border-hairline-light pt-4">
                <span className="text-[14px] text-ink">Subtotal</span>
                <span className="text-[20px] font-medium text-ink">
                  {cart.subtotal}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] text-ink">
                Shipping and tax calculated at checkout.
              </p>

              <a
                href={cart.checkoutUrl}
                className={`${BTN_PRIMARY_BLOCK} mt-5 min-h-[52px]`}
              >
                Check out
              </a>

              <ul className="mt-5 flex flex-col gap-2 border-t border-hairline-light pt-4 text-[13px] text-ink">
                <li>Free insured shipping over ${FREE_SHIPPING_THRESHOLD}</li>
                <li>30-day returns on unworn stock pieces</li>
                <li>Lifetime warranty on everything we make</li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}

function CartSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-6" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="flex animate-pulse gap-4">
          <div className="h-28 w-24 bg-bone" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-3 w-1/2 bg-bone" />
            <div className="h-3 w-1/4 bg-bone" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="mt-8 bg-bone px-6 py-20 text-center border border-hairline-light">
      <p className="text-[11px] label-wide text-ink">
        Your cart is empty
      </p>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-ink">
        Chains, pendants and one-of-one commissions are all a tap away.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <a href="/shop" className={BTN_PRIMARY}>
          Start shopping
        </a>
        <a href="/custom" className={BTN_SECONDARY}>
          Start a custom piece
        </a>
      </div>
    </div>
  )
}
