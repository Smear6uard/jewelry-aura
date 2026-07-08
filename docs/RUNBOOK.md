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

0. Update `SITE_URL` in `src/lib/seo.ts` if the domain changed — sitemap,
   robots, canonicals, OG urls, and all JSON-LD derive from it (see
   `SEO_NOTES.md` for the full SEO surface).
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
works once Shopify is told to deliver product webhooks to it.

The webhook app is a **Dev Dashboard app** (org: Sameer Studios LLC), not a
legacy admin custom app — there is no pasteable `shpat_` Admin token.
Registration is **declarative**: the topics are declared in the app config
and Shopify auto-registers them on install/config release.

### 1. Signing secret

`SHOPIFY_WEBHOOK_SECRET` (Vercel, Production scope) must be the app's
**Client secret** (Dev Dashboard -> app -> credentials). Deliveries are
HMAC-signed with it; the receiver fails closed (401) on any mismatch.

### 2. Declare the subscriptions in the app config

Dev Dashboard -> the app -> configuration (or `shopify.app.toml`):

```toml
[webhooks]
api_version = "2026-07"

  [[webhooks.subscriptions]]
  topics = [ "products/update", "products/delete" ]
  uri = "https://www.thejewelryaura.com/api/webhooks/shopify"
  include_fields = [ "id", "handle", "updated_at" ]
```

Release the config version and ensure the app is installed on the store —
subscriptions activate per store on install/config update.

If Admin API calls are ever needed at runtime (they are not today), the app
supports the client-credentials grant (Client ID + secret -> token endpoint,
24h expiry) — do not hardcode tokens.

### 3. Verify end-to-end

Edit a product title in admin -> the delivery shows 200 in the app's webhook
metrics -> the live PDP/`/shop` reflect the change within seconds (cache tags
`product-{handle}`, `products`, `home` purged). Only after this passes may
the PDP `s-maxage` be raised toward 86400 (plan KTD2).

### After store transfer / domain change

As already covered by the **Launch / store transfer** section: after the store
transfers to the client **and** after any domain change, re-verify the custom
app still exists and its API secret key still matches
`SHOPIFY_WEBHOOK_SECRET`, then re-run **both** subscription mutations above
against the final absolute URL (`https://<final-domain>/api/webhooks/shopify`)
— webhook subscriptions store an absolute callback URL and do not follow
domain changes.
