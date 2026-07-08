import { createFileRoute } from '@tanstack/react-router'
import { invalidateByTag } from '@vercel/functions'

// TEMPORARY route — KTD1 spike (plan U1). Proves that Vercel-Cache-Tag +
// invalidateByTag actually cache and purge on this project before the
// webhook design depends on it. Remove once the spike passes.
export const Route = createFileRoute('/api/cache-spike')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)

        if (url.searchParams.has('purge')) {
          await invalidateByTag('spike')
          return Response.json(
            { purged: true, at: new Date().toISOString() },
            { headers: { 'Cache-Control': 'no-store' } },
          )
        }

        return Response.json(
          { generatedAt: new Date().toISOString() },
          {
            headers: {
              'Cache-Control': 'public, max-age=0, s-maxage=3600',
              'Vercel-Cache-Tag': 'spike',
            },
          },
        )
      },
    },
  },
})
