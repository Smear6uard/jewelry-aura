import { createFileRoute } from '@tanstack/react-router'
import { invalidateByTag } from '@vercel/functions'
import { handleShopifyWebhook } from '~/lib/shopify/webhook'

// Shopify webhook receiver (plan U9): verifies the delivery HMAC against the
// RAW body and purges the affected product's CDN cache tags within seconds.
// All decisions live in ~/lib/shopify/webhook.ts — this is a thin wrapper.
export const Route = createFileRoute('/api/webhooks/shopify')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // RAW body FIRST — HMAC verification must see the exact bytes Shopify
        // sent, never a re-serialized parse.
        const rawBody = await request.text()

        const { status } = await handleShopifyWebhook(
          {
            rawBody,
            hmacHeader: request.headers.get('X-Shopify-Hmac-Sha256'),
            topic: request.headers.get('X-Shopify-Topic'),
            webhookId: request.headers.get('X-Shopify-Webhook-Id'),
          },
          {
            secret: process.env.SHOPIFY_WEBHOOK_SECRET,
            invalidate: (tags) => invalidateByTag(tags),
          },
        )

        return new Response(null, { status })
      },
      // Webhooks are POST-only; anything else is a method error.
      GET: async () =>
        new Response(null, { status: 405, headers: { Allow: 'POST' } }),
    },
  },
})
