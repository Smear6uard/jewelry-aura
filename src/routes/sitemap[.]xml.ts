/**
 * routes/sitemap[.]xml.ts — dynamic XML sitemap (plan U8, KTD6).
 * Replaces the static public/sitemap.xml. Enumerates homepage, /shop,
 * all collections, and all products with lastmod from Shopify.
 */

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const [{ storefrontRequest }, { generateSitemapXml }] =
          await Promise.all([
            import('~/lib/shopify/client'),
            import('~/lib/shopify/sitemap'),
          ])
        try {
          const xml = await generateSitemapXml(storefrontRequest)
          return new Response(xml, {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              // SWR backstop like every catalog route: crawlers keep getting
              // the last good sitemap while a refresh happens in background.
              'Cache-Control':
                'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
              'Vercel-Cache-Tag': 'sitemap',
            },
          })
        } catch (error) {
          // Never cache a failure; tell crawlers to come back shortly.
          console.error(`[sitemap] generation failed: ${String(error)}`)
          return new Response(null, {
            status: 503,
            headers: {
              'Cache-Control': 'no-store',
              'Retry-After': '300',
            },
          })
        }
      },
    },
  },
})
