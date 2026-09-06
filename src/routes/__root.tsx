/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import '../app.css'
import { LenisProvider } from '~/lib/lenis'
import { CartProvider } from '~/components/commerce/CartProvider'
import { CartDrawer } from '~/components/commerce/CartDrawer'
import { AnnouncementBar } from '~/components/layout/AnnouncementBar'
import { Header } from '~/components/layout/Header'
import { Footer } from '~/components/layout/Footer'
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  jsonLdScript,
  jewelryStoreSchema,
  webSiteSchema,
} from '~/lib/seo'

// Fraunces carries the display serif (wordmark, section headers, PDP
// names); Manrope carries everything else. Playfair Display and
// JetBrains Mono were dropped with the storefront rebuild — the serif
// consolidated onto Fraunces and the mono micro-caps idiom was retired
// in favour of sans uppercase, so both were pure payload.
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Manrope:wght@400;500;600&display=swap'

// Runs before first paint: a visitor who dismissed the announcement bar
// earlier in the session never sees it render and then disappear, and
// the header never jumps 36px up the page. Paired with the CSS rule
// below and the button in components/layout/AnnouncementBar.
const PROMO_DISMISS_SCRIPT = `try{if(sessionStorage.getItem('ja-promo-dismissed')==='1')document.documentElement.classList.add('promo-dismissed')}catch(e){}`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: SITE_TITLE },
      { name: 'description', content: SITE_DESCRIPTION },
      // Matches --color-paper: the phone's browser chrome continues the
      // canvas instead of capping it with a near-black bar.
      { name: 'theme-color', content: '#F7F3EC' },
      {
        name: 'robots',
        content:
          'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: GOOGLE_FONTS_URL },
      // Canonical is set per-route (each page owns its URL); a root-level
      // canonical would duplicate on every catalog page.
      { rel: 'shortcut icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
    // One canonical business identity + the WebSite node on every route
    // (R18); pages add their own Product/BreadcrumbList/ItemList data on
    // top, all referencing #organization by @id.
    scripts: [
      { children: PROMO_DISMISS_SCRIPT },
      {
        type: 'application/ld+json',
        children: jsonLdScript(jewelryStoreSchema),
      },
      {
        type: 'application/ld+json',
        children: jsonLdScript(webSiteSchema),
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      {/* LenisProvider wraps the whole app so every section's
          scroll-bound animation reads from a single smoothed source.
          Routes are NOT allowed to spin up their own Lenis instance —
          two instances fight each other on the wheel events. */}
      {/* Synchronous features preserve first-frame reveals while omitting
          unused drag and layout animation code from the client bundle. */}
      <LazyMotion features={domAnimation} strict>
        <LenisProvider>
          {/* Cart state lives above every route: the header badge and the
              PDP add-to-cart both read it. Hydrates post-paint (KTD3). */}
          <CartProvider>
            {/* Store chrome is rendered once, here, so no route can ship
                without an announcement bar, a header or a footer. Routes
                own their <main> and nothing else. */}
            <AnnouncementBar />
            <Header />
            <Outlet />
            <Footer />
            <CartDrawer />
          </CartProvider>
        </LenisProvider>
      </LazyMotion>
    </RootDocument>
  )
}

/**
 * Framer Motion serialises its `hidden` variant into the SSR markup, so
 * every reveal ships as inline `opacity:0`. With JavaScript enabled that
 * is the first frame of an animation; with JavaScript disabled it is
 * permanently invisible content — the hero headline and both of its CTAs
 * among it.
 *
 * Every animated wrapper on the site carries `data-reveal`, and this
 * stylesheet — which only parses when scripting is off — puts them back.
 * The motion is the enhancement; the content is not.
 *
 * Every pin comes out with them — the hero's, and the two scenes below
 * it. Their tall stages and sticky frames are pure CSS and would still
 * work without JavaScript, but nothing would happen inside them: the
 * whole point of holding a frame still for a screen of scrolling is the
 * choreography that scroll drives, and the commission sequence would be
 * five photographs stacked on top of each other. The same collapse
 * `prefers-reduced-motion` performs (see app.css) applies here, for the
 * same reason — everything in normal flow, everything visible, no pin.
 */
const NO_JS_REVEAL_CSS =
  '[data-reveal],[data-reveal] *{opacity:1!important;transform:none!important;visibility:visible!important}' +
  '.hero-stage{height:auto!important}' +
  '.hero-pin{position:static!important;height:88svh!important}' +
  '.hero-dim,.hero-sweep,.hero-cue{display:none!important}' +
  '.hero-curtain{margin-top:0!important}' +
  '.scene-stage{height:auto!important}' +
  '.scene-pin{position:static!important;height:auto!important;overflow:visible!important}' +
  '.scene-beat{position:relative!important;inset:auto!important}' +
  '.commission-beat+.commission-beat{margin-top:4rem!important}' +
  '.commission-caption{opacity:1!important}' +
  '.exhibit-photo{position:relative!important;inset:auto!important;height:58svh!important}' +
  '.exhibit-content{position:relative!important;inset:auto!important;padding:2.25rem 1rem 3.5rem!important}' +
  '.exhibit-dim{display:none!important}' +
  '.exhibit-note{opacity:1!important;width:auto!important;padding-bottom:0!important}'

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style>{`.promo-dismissed [data-announcement]{display:none}`}</style>
        <noscript>
          <style>{NO_JS_REVEAL_CSS}</style>
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
