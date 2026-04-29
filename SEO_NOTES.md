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

Manual owner steps:

- Confirm the final production URL. The SEO constants and static files currently use `https://jewelry-aura.com`; update `src/lib/seo.ts`, `public/robots.txt`, and `public/sitemap.xml` if the live Vercel/custom domain differs.
- Claim and fully complete the Google Business Profile for Jewelry Aura at 4104 N Harlem Ave, Norridge, IL 60706.
- Add the final domain to Google Search Console and submit `/sitemap.xml`.
- Add the same website URL to Instagram and any other social profiles so `sameAs` signals match public profiles.
- After launch, test the deployed URL in Google Rich Results Test, PageSpeed Insights, and social card debuggers for X/Twitter, LinkedIn, and iMessage.
