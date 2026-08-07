/**
 * components/layout/Header.tsx — persistent store chrome.
 *
 * Always solid, never transparent. A header that dissolves over a hero
 * photograph is a brand-site device; a store's header is furniture, and
 * furniture does not fade. It sticks to the top of the viewport on every
 * route so search, categories and the cart are one movement away from
 * anywhere on the site.
 *
 * THE BURGER IS THE MENU — AT EVERY BREAKPOINT.
 *
 * Three lines in the left corner, on a phone and on a desktop alike,
 * opening the full taxonomy (see MenuDrawer). Categories used to live
 * only in a desktop nav row that phones never saw and that could not
 * hold six doors plus a women's floor without wrapping. Now there is one
 * canonical menu, and the nav row is a shortcut layered on top of it:
 * Chains, Pendants, Bracelets, Women's, Custom and Services, shown from
 * lg up. Six items, not eight — Earrings, Rings, Moissanite and Sale are
 * one tap away in the burger, which carries the whole taxonomy at every
 * breakpoint. Custom is set in the display serif because it is the one
 * item in the row that is not a shelf.
 *
 * Phones also keep a persistent search field pinned under the bar — on a
 * phone, search is the primary way people navigate a catalog, and
 * burying it behind an icon costs more than the 44px it saves.
 *
 * SSR completeness
 * ----------------
 * Every mega-menu panel is in the server-rendered HTML. The panels open
 * on CSS hover/focus-within rather than React state, so a crawler (and a
 * keyboard) sees the full taxonomy without executing a line of
 * JavaScript. The transition-delay on the panel is the hover intent that
 * a JS timer used to provide.
 *
 * The drawer is a JS dialog — focus trapping and body scroll lock have
 * no CSS equivalent — so a <noscript> row of category links sits under
 * the bar for the no-JavaScript case. Without it, a visitor with JS off
 * has a burger that does nothing and, below lg, no way into the catalog.
 */

import { useEffect, useRef, useState } from 'react'
import { Search, ShoppingBag, User } from 'lucide-react'
import { CATEGORIES, NAV_LINKS, WOMENS } from '~/lib/catalog'
import { useCart } from '~/components/commerce/CartProvider'
import {
  MegaMenuPanel,
  ServicesMenuPanel,
  WomensMenuPanel,
} from '~/components/layout/MegaMenu'
import { MenuDrawer } from '~/components/layout/MenuDrawer'
import { SearchOverlay } from '~/components/layout/SearchOverlay'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [lifted, setLifted] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const searchTriggerRef = useRef<HTMLButtonElement>(null)

  // The header earns its rule only once the page has moved under it. At
  // rest it sits flush on the paper canvas with no edge at all, which is
  // truer than a permanent hairline — there is nothing to separate from
  // yet, and the palette has no shadow to fall back on.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b bg-paper transition-colors duration-micro ease-apple motion-reduce:transition-none ${
          lifted ? 'border-hairline-light' : 'border-transparent'
        }`}
      >
        {/* `relative` on phones so the wordmark can centre against this
            row; `static` from md up so the mega-menu panels resolve
            against the <header> and span the full viewport width. */}
        <div className="relative mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 md:static md:h-16 md:gap-4 md:px-8">
          <BurgerButton
            ref={burgerRef}
            open={menuOpen}
            onClick={() => setMenuOpen(true)}
          />

          <a
            href="/"
            // Centred between the burger and the cart on phones — the
            // standard mobile store header — and back on the left rail
            // from md up, where the nav owns the centre.
            className="display absolute left-1/2 -translate-x-1/2 text-[18px] leading-none text-ink md:static md:translate-x-0 md:text-[20px]"
          >
            Jewelry Aura
          </a>

          {/* Centre nav — a shortcut over the burger's taxonomy, not a
              second one. Each item owns its panel so hover state is
              local to the item. */}
          <nav
            aria-label="Primary"
            className="mx-auto hidden items-center lg:flex"
          >
            <ul className="flex items-center">
              {NAV_LINKS.map((link) => (
                <li key={link.label} className="group/nav static">
                  <a
                    href={link.href}
                    className={`relative flex h-16 items-center px-2.5 text-ink xl:px-3.5 ${
                      // Custom is the one item in this row that is not a
                      // shelf, and the change of voice says so before the
                      // label does: Fraunces, sentence case, among five
                      // uppercase sans labels. No second colour is spent
                      // on it — the palette has none to spare, and a
                      // typeface is the quieter distinction anyway.
                      link.signature
                        ? 'display text-[16px] leading-none'
                        : 'text-[12px] label'
                    }`}
                  >
                    {link.label}
                    {/* Nav state is a gold hairline that draws in from the
                        left. It used to be a 2px maroon bar; maroon is a
                        stamp now, and six nav items cannot each be one.
                        Gold at 1px is the same signal at the weight the
                        palette actually allows on paper. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-2 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-hover ease-apple group-hover/nav:scale-x-100 group-focus-within/nav:scale-x-100 motion-reduce:transition-none"
                    />
                  </a>

                  {link.category && <MegaMenuPanel category={link.category} />}
                  {link.womens && <WomensMenuPanel />}
                  {link.services && <ServicesMenuPanel />}
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center md:ml-0">
            <button
              ref={searchTriggerRef}
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:bg-bone md:flex"
            >
              <Search aria-hidden size={19} strokeWidth={1.5} />
            </button>

            {/* Labelled, not just aria-labelled. An unlabelled person
                glyph in a store header is read as "sign in" about as
                often as it is read as "orders", and this store has no
                accounts to sign into — the page behind it is order
                lookup and receipts. The word does that work; the icon
                just makes it findable at a glance. */}
            <a
              href="/pages/orders"
              className="hidden h-11 items-center gap-1.5 px-2.5 text-[12px] label text-ink transition-colors duration-hover ease-apple hover:bg-bone md:flex"
            >
              <User aria-hidden size={17} strokeWidth={1.5} />
              Orders
            </a>

            <CartButton />
          </div>
        </div>

        {/* Phones: persistent search field under the bar, on the sunken
            surface so it reads as an input without a heavy border. The
            row is 44px so --header-h stays predictable. */}
        <form
          action="/search"
          method="get"
          className="flex h-11 items-center gap-2 bg-bone px-4 md:hidden"
        >
          <Search
            aria-hidden
            size={16}
            strokeWidth={1.5}
            className="shrink-0 text-ink"
          />
          <label className="sr-only" htmlFor="header-search">
            Search products
          </label>
          <input
            id="header-search"
            type="search"
            name="q"
            placeholder="Search chains, earrings, moissanite…"
            autoComplete="off"
            className="w-full bg-transparent text-[16px] text-ink placeholder:text-ink focus:outline-none"
          />
        </form>

        {/* No-JavaScript path into the catalog: the burger opens a JS
            dialog, so without this there is none below lg. */}
        <noscript>
          <ul className="flex flex-wrap gap-1.5 border-t border-hairline-light px-4 py-3 lg:hidden">
            {CATEGORIES.map((category) => (
              <li key={category.handle}>
                <a
                  href={`/collections/${category.handle}`}
                  className="inline-flex bg-bone px-3 py-2 text-[12px] label text-ink border border-hairline-light"
                >
                  {category.label}
                </a>
              </li>
            ))}
            {[
              { label: WOMENS.label, href: WOMENS.href },
              { label: 'Shop all', href: '/shop' },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex bg-bone px-3 py-2 text-[12px] label text-ink border border-hairline-light"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </noscript>
      </header>

      <MenuDrawer
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false)
          burgerRef.current?.focus()
        }}
      />
      <SearchOverlay
        open={searchOpen}
        onClose={() => {
          setSearchOpen(false)
          searchTriggerRef.current?.focus()
        }}
      />
    </>
  )
}

/**
 * Three lines, drawn rather than iconised.
 *
 * A 24px lucide glyph next to a Fraunces wordmark reads as an app
 * chrome affordance borrowed from somewhere else. Three 18px hairlines
 * in ink read as a mark set in the same ink as the type beside them.
 * The one flourish: on hover the middle line pulls in from the right
 * and the set goes gold — the same gold the nav underline uses, so
 * the header has one hover language rather than two.
 */
function BurgerButton({
  ref,
  open,
  onClick,
}: {
  ref: React.Ref<HTMLButtonElement>
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="Open category menu"
      aria-haspopup="dialog"
      aria-expanded={open}
      className="group/burger -ml-2.5 flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px]"
    >
      {[0, 1, 2].map((line) => (
        <span
          key={line}
          aria-hidden
          className={`block h-[1.5px] w-[18px] origin-left bg-ink transition-[background-color,transform] duration-hover ease-apple group-hover/burger:bg-gold motion-reduce:transition-none ${
            line === 1 ? 'group-hover/burger:scale-x-[0.62]' : ''
          }`}
        />
      ))}
    </button>
  )
}

/**
 * Cart trigger. The badge shows a small pulse until the post-paint
 * getCart resolves (never a false 0), an ink count bubble when the
 * cart has items, and nothing when it is empty.
 */
function CartButton() {
  const { count, openCart } = useCart()
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => openCart(ref.current)}
      aria-label={
        count === null
          ? 'Open cart'
          : `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`
      }
      className="relative -mr-2.5 flex h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:bg-bone md:mr-0"
    >
      <ShoppingBag aria-hidden size={19} strokeWidth={1.5} />
      {count === null && (
        <span
          aria-hidden
          className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-hairline-light"
        />
      )}
      {count !== null && count > 0 && (
        <span
          aria-hidden
          className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold leading-none text-bone"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
