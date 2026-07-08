# SEO Notes

Implemented:

- Added TanStack Start head metadata for title, description, canonical, robots, theme color, Open Graph, and Twitter card tags.
- Added `JewelryStore` and `Organization` JSON-LD with the provided address, phone, hours, Instagram profile, and looked-up coordinates for 4104 N Harlem Ave.
- Generated brand icons from a cream-on-forest Jewelry Aura wordmark: favicon 16/32, Apple touch icon 180, and a 512 maskable manifest icon.
- Added `robots.txt` and `sitemap.xml` for the single-page site.
- Converted hero and custom-piece images to AVIF/WebP with JPEG fallbacks, added `<picture>` sources, lazy loading for below-fold gallery images, and intrinsic dimensions.
- Kept semantic landmarks in place with `<main>`, `<nav>`, section landmarks, and a real `<footer>`. The hero has one accessible `<h1>`.
- Verified fonts use `font-display=swap` through the Google Fonts request and preloaded the hero display face.
- Verified Lenis is importing the package's core entry only. The installed `lenis` package exposes `Lenis` as its default export and marks `sideEffects: false`; no React, Vue, Nuxt, or snap entrypoints are imported.
- Framer Motion was left on the existing motion primitives because this task explicitly prohibited edits to `lib/motion.ts` or motion primitives. A LazyMotion migration should be a separate motion-system task.

## Storefront SEO surface (headless Shopify build)

- Every catalog route (`/shop`, `/collections/{handle}`, `/products/{handle}`) is fully server-rendered (buffered SSR) with route-level `head`: title, description, robots, Open Graph, and exactly one canonical per URL (variant params and `?page=N` never fragment canonicals; page 1 canonicalizes to the clean URL, deeper pages self-canonicalize with `rel=prev/next` hints).
- JSON-LD: `Organization` site-wide from the root route; `JewelryStore` (LocalBusiness) on the homepage; `Product` with a live-price/availability offer on PDPs; `BreadcrumbList` on collection and product pages. All emitted via route `head.scripts`, bound to loader data.
- `sitemap.xml` and `robots.txt` are now dynamic server routes — the static `public/` copies are gone. The sitemap cursor-walks all Shopify products and collections (250/page) with `lastmod`; robots disallows `/api/` and points at the absolute sitemap URL.
- Collection pagination is crawlable numbered links (no infinite scroll). Unknown/malformed handles and beyond-range pages return real 404s.
- Images: Shopify CDN with `srcset` + `sizes` + intrinsic dimensions; first cards/gallery image load eager with `fetchpriority=high` and a route-level LCP preload (`imagesrcset`); everything below the fold lazy-loads. `preconnect` to `cdn.shopify.com` on commerce routes.
- Cache posture: HTML cached at the CDN with `s-maxage` + `stale-while-revalidate` and purged by tag via the Shopify webhook (`products/update`, `products/delete`); catalog HTML never sets cookies. Cart runs through uncached server functions (`private, no-store`).

Manual owner steps:

- Production URL is `https://www.thejewelryaura.com` (apex 307s to www; DNS on Cloudflare, records DNS-only). `SITE_URL` in `src/lib/seo.ts` carries it — sitemap, robots, canonicals, and JSON-LD all derive from it.
- Claim and fully complete the Google Business Profile for Jewelry Aura at 4104 N Harlem Ave, Norridge, IL 60706.
- Add the final domain to Google Search Console and submit `/sitemap.xml`.
- Add the same website URL to Instagram and any other social profiles so `sameAs` signals match public profiles.
- After launch, test the deployed URL in Google Rich Results Test, PageSpeed Insights, and social card debuggers for X/Twitter, LinkedIn, and iMessage.
