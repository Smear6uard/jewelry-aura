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
