# Jewelry Aura Storefront Runbook

Operational reference for the headless Shopify storefront. See
`docs/plans/2026-07-07-001-feat-shopify-headless-storefront-plan.md` for the
full design.

## Environment variables

| Variable | Where | Scope |
|---|---|---|
| `SHOPIFY_STORE_DOMAIN` | Vercel project env | All environments |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Vercel project env | **Production only** |
| `SHOPIFY_WEBHOOK_SECRET` | Vercel project env | **Production only** (set at U9) |

Local development uses `.env` (copy `.env.example`). The private token and
webhook secret are deliberately absent from Preview deployments — preview
builds have no commerce access by design.

## Secret rotation

### Rotate `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`

1. Shopify admin → Sales channels → Headless → the storefront → Manage API tokens.
2. Rotate/regenerate the **private** access token.
3. Update the value in Vercel (Production scope) and in your local `.env`.
4. Redeploy production (env changes require a new deployment).
5. Verify: load a PDP or `/shop` on production; product data renders.

### Rotate `SHOPIFY_WEBHOOK_SECRET`

1. Shopify admin → Settings → Apps and sales channels → Develop apps → the
   custom webhook app.
2. Regenerate the API secret key (or create a replacement custom app with the
   `read_products` scope).
3. Update the value in Vercel (Production scope).
4. Redeploy production.
5. Verify: edit a product in admin and confirm the webhook delivery succeeds
   (admin → webhook delivery metrics) and the PDP refreshes.

## Launch / store transfer

After the store transfers to the client, **and again after any domain change**:

1. Re-verify the custom app still exists and its API secret still matches
   `SHOPIFY_WEBHOOK_SECRET` (transfer can revoke custom apps).
2. Re-run the Admin GraphQL `webhookSubscriptionCreate` mutations for
   `PRODUCTS_UPDATE` and `PRODUCTS_DELETE` pointing at the final absolute URL
   `https://<final-domain>/api/webhooks/shopify` (`includeFields: id, handle,
   updated_at`).
3. Confirm the Headless channel tokens survived the transfer; rotate per the
   steps above if not.

## Annual maintenance

The Storefront API version is pinned (`SHOPIFY_API_VERSION` in
`src/lib/shopify/env.ts`, mirrored in `.graphqlrc.ts`). Shopify versions are
supported for 12 months — bump both pins and re-run `npm run codegen` at least
annually.

## Webhook subscription (one-time ops)

The webhook receiver at `/api/webhooks/shopify` (see
`src/routes/api/webhooks/shopify.ts` and `src/lib/shopify/webhook.ts`) only
works once Shopify is told to deliver product webhooks to it. This is a
one-time manual setup:

### 1. Create the custom app (source of the webhook secret)

1. Shopify admin → **Settings → Apps and sales channels → Develop apps** →
   **Create an app** (name it e.g. `storefront-webhooks`).
2. **Configure Admin API scopes** → enable `read_products` → Save.
3. **Install app**, then open **API credentials**:
   - Copy the **Admin API access token** (needed to run the mutations below).
   - Copy the **API secret key** — this is what Shopify signs webhook
     deliveries with.
4. Set the API secret key as `SHOPIFY_WEBHOOK_SECRET` in Vercel
   (**Production scope only**) and redeploy production. The receiver fails
   closed (401) while the secret is unset.

### 2. Create the two webhook subscriptions

Run the Admin GraphQL `webhookSubscriptionCreate` mutation **twice** — once
per topic (`PRODUCTS_UPDATE`, then `PRODUCTS_DELETE`) — against
`https://<store>.myshopify.com/admin/api/<api-version>/graphql.json` with the
custom app's Admin API access token in the `X-Shopify-Access-Token` header
(the admin GraphiQL app works too).

```graphql
mutation CreateWebhookSubscription(
  $topic: WebhookSubscriptionTopic!
  $webhookSubscription: WebhookSubscriptionInput!
) {
  webhookSubscriptionCreate(
    topic: $topic
    webhookSubscription: $webhookSubscription
  ) {
    webhookSubscription {
      id
      topic
      endpoint {
        ... on WebhookHttpEndpoint {
          callbackUrl
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

Variables — first run:

```json
{
  "topic": "PRODUCTS_UPDATE",
  "webhookSubscription": {
    "callbackUrl": "https://<production-domain>/api/webhooks/shopify",
    "format": "JSON",
    "includeFields": ["id", "handle", "updated_at"]
  }
}
```

Variables — second run: identical, but `"topic": "PRODUCTS_DELETE"`.

Both runs must return an empty `userErrors` array. Verify end-to-end by
editing a product in admin and confirming a successful delivery (admin
webhook delivery metrics) and a refreshed PDP within seconds.

### After store transfer / domain change

As already covered by the **Launch / store transfer** section: after the store
transfers to the client **and** after any domain change, re-verify the custom
app still exists and its API secret key still matches
`SHOPIFY_WEBHOOK_SECRET`, then re-run **both** subscription mutations above
against the final absolute URL (`https://<final-domain>/api/webhooks/shopify`)
— webhook subscriptions store an absolute callback URL and do not follow
domain changes.
