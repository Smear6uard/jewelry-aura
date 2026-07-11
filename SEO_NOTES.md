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

## Marketplace SEO hardening (2026-07-11)

Pushed the storefront past JAXXON/GLD on structured data (both ship thin homepage JSON-LD — `WebPage`-only and `BreadcrumbList`-only respectively):

- **Consolidated identity.** Replaced the separate `Organization` (root) + `JewelryStore` (homepage) nodes with one `@id`-anchored `JewelryStore` (`#organization`) emitted site-wide, plus a `WebSite` node (`#website`, publisher → `#organization`). Added `logo` as an `ImageObject`, `description`, `contactPoint`, `areaServed`, `paymentAccepted`, and site-wide opening hours. `Product.offers.seller` now references `#organization`. (Sitelinks `SearchAction` intentionally omitted — Google retired that rich result Nov 2024 and there's no `/search` endpoint.)
- **ItemList** on the homepage best sellers, `/shop`, and every collection page (numbered continuously across pagination) — product-carousel eligibility the competitors don't have.
- **Product offers** gained `priceValidUntil` (rolling ~1yr) and `seller`.
- **Titles/descriptions** rewritten keyword-first, brand-last ("Men's Gold Chains, Moissanite & Custom Jewelry | Jewelry Aura"); homepage now carries a single keyword-bearing H1 (sr-only, so the visible hero is unchanged).
- **Social/robots.** `pageMeta()` now emits Twitter cards on every route (previously homepage-only — PDP/collection links shared with no card), plus `og:locale`, `og:image:alt`, and the OG `product:` namespace (live price/availability) on PDPs. `robots` upgraded to `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` site-wide.
- **Manifest** gained `id`, `lang`, `categories`.

Deliberately NOT added — would be fabricated without real data (the owner just removed a fake "4.9★" stat, so no invented trust markup). Do these once the data exists:

- `aggregateRating`/`review` — needs a review app (Judge.me / Loox / Okendo) with reviews visibly rendered on the page first. Biggest CTR lever still open.
- `shippingDetails` + `hasMerchantReturnPolicy` on product offers, and any "free shipping / 30-day returns" copy — needs the real policy (or set once at the Google Merchant Center account level).
- Image sitemap entries (`image:image`) — needs the sitemap query to also fetch product images.

Manual owner steps:

- **Fix the $0-priced products in Shopify admin.** Merchant listings require price > 0; a $0 offer = disapproval, no Product rich result, no free Shopping listing. The PDP JSON-LD / OG price is live-bound, so it currently (correctly) reports `0.0` for those pieces.
- Create the 12 menu collections (`chains`, `pendants`, `earrings`, `rings`, `bracelets`, `moissanite`, and the `womens-*` set) in Shopify admin so the drawer links resolve instead of 404ing.
- Stand up a reviews app, surface reviews on PDPs, then wire `aggregateRating`/`review` into `productJsonLd`.
- Set up Google Merchant Center and connect the catalog (free product listings + Shopping surface read the same Product data).
- Production URL is `https://www.thejewelryaura.com` (apex 307s to www; DNS on Cloudflare, records DNS-only). `SITE_URL` in `src/lib/seo.ts` carries it — sitemap, robots, canonicals, and JSON-LD all derive from it.
- Claim and fully complete the Google Business Profile for Jewelry Aura at 4104 N Harlem Ave, Norridge, IL 60706.
- Add the final domain to Google Search Console and submit `/sitemap.xml`.
- Add the same website URL to Instagram and any other social profiles so `sameAs` signals match public profiles.
- After launch, test the deployed URL in Google Rich Results Test, PageSpeed Insights, and social card debuggers for X/Twitter, LinkedIn, and iMessage.
