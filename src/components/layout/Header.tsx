/**
 * components/layout/Header.tsx — persistent store chrome.
 *
 * Always solid, never transparent. A header that dissolves over a hero
 * photograph is a brand-site device; a store's header is furniture, and
 * furniture does not fade. It sticks to the top of the viewport on every
 * route so search, categories and the cart are one movement away from
 * anywhere on the site.
 *
 * Desktop: wordmark left, category nav centre, search / orders / cart
 * right. Chains, Pendants, Bracelets and Rings open a mega-menu panel.
 *
 * Phones: burger left, wordmark centre, cart right, plus a persistent
 * search field pinned under the bar — on a phone, search is the primary
 * way people navigate a catalog, and burying it behind an icon costs
 * more than the 44px it saves.
 *
 * Hover intent: the panel opens after a short delay and closes after a
 * longer one, so dragging the pointer across the nav row does not fire
 * four panels, and moving diagonally from a nav item down into the
 * panel does not close it mid-travel.
 */

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Menu, Search, ShoppingBag, User } from 'lucide-react'
import { NAV_LINKS } from '~/lib/catalog'
import { useCart } from '~/components/commerce/CartProvider'
import { MegaMenu } from '~/components/layout/MegaMenu'
import { MobileNav } from '~/components/layout/MobileNav'
import { SearchOverlay } from '~/components/layout/SearchOverlay'

const OPEN_DELAY_MS = 90
const CLOSE_DELAY_MS = 160

export function Header() {
  const [openHandle, setOpenHandle] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const searchTriggerRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<number | null>(null)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const scheduleOpen = (handle: string) => {
    clearTimer()
    timerRef.current = window.setTimeout(
      () => setOpenHandle(handle),
      OPEN_DELAY_MS,
    )
  }

  const scheduleClose = () => {
    clearTimer()
    timerRef.current = window.setTimeout(
      () => setOpenHandle(null),
      CLOSE_DELAY_MS,
    )
  }

  const closeNow = () => {
    clearTimer()
    setOpenHandle(null)
  }

  useEffect(() => clearTimer, [])

  // Escape closes the panel wherever focus happens to be.
  useEffect(() => {
    if (!openHandle) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeNow()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openHandle])

  const active = NAV_LINKS.find(
    (link) => link.category && link.category.handle === openHandle,
  )?.category

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-hairline bg-base">
        <div className="relative mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 md:h-16 md:px-8">
          {/* Burger — phones only; the desktop nav is the menu. */}
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="-ml-1.5 p-1.5 text-cream transition-colors duration-hover ease-apple hover:text-champagne md:hidden"
          >
            <Menu aria-hidden size={20} strokeWidth={1.4} />
          </button>

          <a
            href="/"
            // Centred between the burger and the cart on phones — the
            // standard mobile store header — and back on the left rail
            // from md up, where the nav owns the centre.
            className="absolute left-1/2 -translate-x-1/2 font-display text-[17px] leading-none tracking-tight text-cream md:static md:translate-x-0 md:text-[19px]"
          >
            Jewelry Aura
          </a>

          {/* Centre nav — the store's spine. */}
          <nav
            aria-label="Primary"
            className="mx-auto hidden items-center gap-6 md:flex lg:gap-7"
            onPointerLeave={scheduleClose}
          >
            {NAV_LINKS.map((link) => {
              const isOpen = link.category?.handle === openHandle
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onPointerEnter={() =>
                    link.category ? scheduleOpen(link.category.handle) : closeNow()
                  }
                  onFocus={() =>
                    link.category ? setOpenHandle(link.category.handle) : closeNow()
                  }
                  aria-expanded={link.category ? isOpen : undefined}
                  className={`relative py-5 text-[11px] label transition-colors duration-hover ease-apple lg:text-[12px] ${
                    link.accent
                      ? 'text-champagne hover:text-cream'
                      : 'text-cream-muted hover:text-cream'
                  }`}
                >
                  {link.label}
                  {/* Active-panel underline — the one place maroon
                      marks navigation state. */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-center bg-brand-hover transition-transform duration-hover ease-apple ${
                      isOpen ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 md:ml-0 md:gap-1">
            <button
              ref={searchTriggerRef}
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden p-2 text-cream transition-colors duration-hover ease-apple hover:text-champagne md:block"
            >
              <Search aria-hidden size={18} strokeWidth={1.4} />
            </button>

            <a
              href="/pages/orders"
              aria-label="Orders and account"
              className="hidden p-2 text-cream transition-colors duration-hover ease-apple hover:text-champagne md:block"
            >
              <User aria-hidden size={18} strokeWidth={1.4} />
            </a>

            <CartButton />
          </div>
        </div>

        {/* Phones: persistent search field under the bar. */}
        <form
          action="/search"
          method="get"
          className="flex items-center gap-2 border-t border-hairline px-4 py-2 md:hidden"
        >
          <Search
            aria-hidden
            size={15}
            strokeWidth={1.4}
            className="shrink-0 text-cream-subtle"
          />
          <input
            type="search"
            name="q"
            placeholder="Search chains, pendants, moissanite…"
            aria-label="Search products"
            autoComplete="off"
            className="w-full bg-transparent text-[13px] text-cream placeholder:text-cream-subtle focus:outline-none"
          />
        </form>

        <AnimatePresence>
          {active && (
            <MegaMenu
              key={active.handle}
              category={active}
              onPointerEnter={clearTimer}
              onPointerLeave={scheduleClose}
              onNavigate={closeNow}
            />
          )}
        </AnimatePresence>
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
      className="relative p-2 text-cream transition-colors duration-hover ease-apple hover:text-champagne"
    >
      <ShoppingBag aria-hidden size={18} strokeWidth={1.4} />
      {count === null && (
        <span
          aria-hidden
          className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-cream-subtle"
        />
      )}
      {count !== null && count > 0 && (
        <span
          aria-hidden
          className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium leading-none text-cream"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
