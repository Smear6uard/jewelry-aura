/**
 * routes/robots[.]txt.ts — robots policy (plan U8, KTD6).
 * Replaces the static public/robots.txt: allows crawling, keeps crawlers
 * out of /api/, and points at the absolute sitemap URL.
 */

import { createFileRoute } from '@tanstack/react-router'
import { buildRobotsTxt } from '~/lib/shopify/sitemap'

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildRobotsTxt(), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=0, s-maxage=86400',
          },
        }),
    },
  },
})
