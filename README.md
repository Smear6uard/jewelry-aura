# Jewelry Aura

Editorial site + headless Shopify storefront for Jewelry Aura (Norridge, IL).
TanStack Start (React 19, Vite, Nitro) deployed on Vercel; commerce via the
Shopify Storefront API (server-side only) with Shopify-hosted checkout.

## Quick start

```bash
npm install
cp .env.example .env   # fill in Shopify credentials — or use the mock line below
npm run dev            # http://localhost:3002
```

No Shopify credentials yet? Point the storefront at Shopify's public mock API
(local dev only — never set on Vercel):

```bash
echo 'SHOPIFY_API_ENDPOINT=https://mock.shop/api' > .env
npm run dev
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 3002 |
| `npm run build` | Production build (Nitro output in `.output/`) |
| `npm run start` | Boot the production build (`node .output/server/index.mjs`) |
| `npm test` | Vitest suite (commerce data layer, cart, webhook, sitemap) |
| `npm run codegen` | Validate all GraphQL documents against the live Storefront schema + generate types |

## Where things live

- `src/lib/shopify/` — Storefront client, queries, adapters, cart, webhook, sitemap (unit-tested)
- `src/components/shop/` — storefront UI (cards, grid, gallery, cart drawer)
- `src/routes/` — file routes: `/shop`, `/collections/$handle`, `/products/$handle`, `sitemap.xml`, `robots.txt`, `/api/webhooks/shopify`
- `docs/RUNBOOK.md` — env vars, secret rotation, webhook subscription, launch checklist
- `docs/plans/` — the implementation plan this build follows
- `SEO_NOTES.md` — the site's SEO surface and manual owner steps
