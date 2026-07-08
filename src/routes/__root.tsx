/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import '../app.css'
import { LenisProvider } from '~/lib/lenis'
import { CartProvider } from '~/components/shop/CartProvider'
import { CartDrawer } from '~/components/shop/CartDrawer'
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  jsonLdScript,
  organizationSchema,
} from '~/lib/seo'

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Manrope:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap'

const FRAUNCES_NORMAL_400_FONT =
  'https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIctxujDg.ttf'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: SITE_TITLE,
      },
      {
        name: 'description',
        content: SITE_DESCRIPTION,
      },
      {
        name: 'theme-color',
        content: '#14261F',
      },
      {
        name: 'robots',
        content: 'index, follow',
      },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'preload',
        href: FRAUNCES_NORMAL_400_FONT,
        as: 'font',
        type: 'font/ttf',
        crossOrigin: 'anonymous',
      },
      // Hero image preloads live on the homepage route — catalog pages
      // preload their own LCP image (Shopify CDN) instead.
      {
        rel: 'stylesheet',
        href: GOOGLE_FONTS_URL,
      },
      // Canonical is set per-route (each page owns its URL); a root-level
      // canonical would duplicate on every catalog page.
      { rel: 'shortcut icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
    // Organization identity on every route (R18); pages add their own
    // Product/BreadcrumbList/LocalBusiness data on top.
    scripts: [
      {
        type: 'application/ld+json',
        children: jsonLdScript(organizationSchema),
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
      <LenisProvider>
        {/* Cart state lives above every route: the header badge and the
            PDP add-to-cart both read it. Hydrates post-paint (KTD3). */}
        <CartProvider>
          <Outlet />
          <CartDrawer />
        </CartProvider>
      </LenisProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
