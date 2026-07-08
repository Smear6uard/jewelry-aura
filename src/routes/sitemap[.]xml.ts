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
        const xml = await generateSitemapXml(storefrontRequest)
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=0, s-maxage=3600',
            'Vercel-Cache-Tag': 'sitemap',
          },
        })
      },
    },
  },
})
