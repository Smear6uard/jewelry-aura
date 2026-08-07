/**
 * lib/shopify/product-slugs.ts — the public URL of a product, when it
 * disagrees with the handle Shopify still carries.
 *
 * THE PROBLEM THIS SOLVES
 * -----------------------
 * The 4mm Cuban Link Chain was listed as a 6mm and later retitled. The
 * title is now right and the handle is not, so every card on the site
 * links "4mm Cuban Link Chain" to /products/6mm-cuban-link-chain. A
 * shopper reads that as either a bait or a mistake, and both cost the
 * same sale. Search engines have been indexing the wrong width for the
 * same reason.
 *
 * A Storefront API client cannot rename a handle — that is an admin
 * field. So the storefront keeps its own public slug for the piece and
 * translates in both directions at the edges:
 *
 *   publicSlug()     Shopify handle → the URL this site publishes.
 *                    Every card, every sitemap entry, every canonical.
 *   shopifyHandle()  a URL back to the handle the API will answer to.
 *                    The product route's only job before it queries.
 *
 * Both are identity functions for every product that is not aliased,
 * which is all of them but one.
 *
 * THE REAL FIX IS IN THE ADMIN. Renaming the handle to
 * `4mm-cuban-link-chain` makes this table empty and this file deletable —
 * Shopify keeps a redirect from the old handle automatically. Until then
 * the old URL still resolves here too, so an existing link or an indexed
 * result does not 404; it just resolves to a page whose canonical points
 * at the new address.
 */

/**
 * Public slug → the handle Shopify answers to.
 *
 * Adding an entry should mean a listing whose handle is factually wrong,
 * not one whose handle is merely ugly. Every alias is a permanent second
 * URL for the same product and a permanent line of translation code.
 */
export const PRODUCT_SLUG_ALIASES: Readonly<Record<string, string>> = {
  // Titled "4mm Cuban Link Chain"; listed under the 6mm it used to be.
  '4mm-cuban-link-chain': '6mm-cuban-link-chain',
}

/** Shopify handle → public slug. Built once, at module load. */
const PUBLIC_BY_HANDLE: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(PRODUCT_SLUG_ALIASES).map(([slug, handle]) => [handle, slug]),
)

/**
 * The handle to query for a URL the router just matched.
 *
 * Unaliased slugs pass straight through, so an alias table with a typo in
 * it degrades to "that product 404s" rather than to a wrong product.
 */
export function shopifyHandle(slug: string): string {
  return PRODUCT_SLUG_ALIASES[slug] ?? slug
}

/** The URL this site publishes for a Shopify handle. */
export function publicSlug(handle: string): string {
  return PUBLIC_BY_HANDLE[handle] ?? handle
}

/**
 * The canonical public slug for whichever of the two URLs was requested.
 *
 * /products/6mm-cuban-link-chain and /products/4mm-cuban-link-chain both
 * serve the same piece; exactly one of them is the address in the
 * canonical tag and in the sitemap.
 */
export function canonicalSlug(slug: string): string {
  return publicSlug(shopifyHandle(slug))
}
