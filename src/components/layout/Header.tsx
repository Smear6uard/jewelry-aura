/**
 * components/layout/Header.tsx — persistent store chrome.
 *
 * Always solid, never transparent. A header that dissolves over a hero
 * photograph is a brand-site device; a store's header is furniture, and
 * furniture does not fade. It sticks to the top of the viewport on every
 * route so search, categories and the cart are one movement away from
 * anywhere on the site.
 *
 * Desktop: wordmark left, category nav centre, search / account / cart
 * right. Chains, Pendants, Bracelets and Rings open a mega-menu panel.
 *
 * Phones: burger left, wordmark centre, cart right, plus a persistent
 * search field pinned under the bar — on a phone, search is the primary
 * way people navigate a catalog, and burying it behind an icon costs
 * more than the 44px it saves.
 *
 * SSR completeness
 * ----------------
 * Every navigational link in this component is in the server-rendered
 * HTML, including all four mega-menu panels. The panels open on CSS
 * hover/focus-within rather than React state, so a crawler (and a
 * keyboard) sees the full taxonomy without executing a line of
 * JavaScript. The transition-delay on the panel is the hover intent that
 * a JS timer used to provide: dragging the pointer across the nav row no
 * longer fires four panels in sequence.
 *
 * The phone drawer is still a JS dialog — focus trapping and body scroll
 * lock have no CSS equivalent — so a <noscript> row of category links
 * sits under the bar for the no-JavaScript case. Without it a phone with
 * JS disabled has a burger that does nothing and no way into the
 * catalog.
 */

import { useEffect, useRef, useState } from 'react'
import { Menu, Search, ShoppingBag, User } from 'lucide-react'
import { NAV_LINKS } from '~/lib/catalog'
import { useCart } from '~/components/commerce/CartProvider'
import { MegaMenuPanel } from '~/components/layout/MegaMenu'
import { MobileNav } from '~/components/layout/MobileNav'
import { SearchOverlay } from '~/components/layout/SearchOverlay'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [lifted, setLifted] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const searchTriggerRef = useRef<HTMLButtonElement>(null)

  // The header earns a shadow only once the page has moved under it. At
  // rest it sits flush on the cream canvas with a hairline, which is
  // quieter and truer — nothing is floating yet.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-hairline bg-base transition-shadow duration-micro ease-apple motion-reduce:transition-none ${
          lifted ? 'shadow-sm' : ''
        }`}
      >
        {/* `relative` on phones so the wordmark can centre against this
            row; `static` from md up so the mega-menu panels resolve
            against the <header> and span the full viewport width. */}
        <div className="relative mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 md:static md:h-16 md:px-8">
          {/* Burger — phones only; the desktop nav is the menu. 44px. */}
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="-ml-2.5 flex h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:text-brand md:hidden"
          >
            <Menu aria-hidden size={21} strokeWidth={1.5} />
          </button>

          <a
            href="/"
            // Centred between the burger and the cart on phones — the
            // standard mobile store header — and back on the left rail
            // from md up, where the nav owns the centre.
            className="display absolute left-1/2 -translate-x-1/2 text-[18px] leading-none text-ink md:static md:translate-x-0 md:text-[20px]"
          >
            Jewelry Aura
          </a>

          {/* Centre nav — the store's spine. Each category item owns its
              own panel so hover state is local to the item. */}
          <nav
            aria-label="Primary"
            className="mx-auto hidden items-center md:flex"
          >
            <ul className="flex items-center">
              {NAV_LINKS.map((link) => (
                <li key={link.label} className="group/nav static">
                  <a
                    href={link.href}
                    className={`relative flex h-16 items-center px-3 text-[12px] label transition-colors duration-hover ease-apple lg:px-3.5 ${
                      link.accent
                        ? 'text-brand hover:text-brand-hover'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {link.label}
                    {/* The one place maroon marks navigation state. Draws
                        in from the left rather than out from the centre. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-2 bottom-0 h-[2px] origin-left scale-x-0 bg-brand transition-transform duration-hover ease-apple group-hover/nav:scale-x-100 group-focus-within/nav:scale-x-100 motion-reduce:transition-none"
                    />
                  </a>

                  {link.category && <MegaMenuPanel category={link.category} />}
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
              className="hidden h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:text-brand md:flex"
            >
              <Search aria-hidden size={19} strokeWidth={1.5} />
            </button>

            <a
              href="/pages/orders"
              aria-label="Account and orders"
              className="hidden h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:text-brand md:flex"
            >
              <User aria-hidden size={19} strokeWidth={1.5} />
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
          className="flex h-11 items-center gap-2 bg-sunken px-4 md:hidden"
        >
          <Search
            aria-hidden
            size={16}
            strokeWidth={1.5}
            className="shrink-0 text-ink-muted"
          />
          <label className="sr-only" htmlFor="header-search">
            Search products
          </label>
          <input
            id="header-search"
            type="search"
            name="q"
            placeholder="Search chains, pendants, moissanite…"
            autoComplete="off"
            className="w-full bg-transparent text-[16px] text-ink placeholder:text-ink-muted focus:outline-none"
          />
        </form>

        {/* No-JavaScript path into the catalog on a phone: the burger
            below opens a JS dialog, so without this there is none. */}
        <noscript>
          <ul className="flex flex-wrap gap-1.5 border-t border-hairline px-4 py-3 md:hidden">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="inline-flex bg-raised px-3 py-2 text-[12px] label text-ink shadow-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/shop"
                className="inline-flex bg-raised px-3 py-2 text-[12px] label text-ink shadow-sm"
              >
                Shop all
              </a>
            </li>
          </ul>
        </noscript>
      </header>

      <MobileNav
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
 * Cart trigger. The badge shows a small pulse until the post-paint
 * getCart resolves (never a false 0), a maroon count bubble when the
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
      className="relative -mr-2.5 flex h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:text-brand md:mr-0"
    >
      <ShoppingBag aria-hidden size={19} strokeWidth={1.5} />
      {count === null && (
        <span
          aria-hidden
          className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-ink-subtle"
        />
      )}
      {count !== null && count > 0 && (
        <span
          aria-hidden
          className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-cream"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
