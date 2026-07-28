// GraphQL documents for the Storefront API. The `#graphql` tag lets
// `npm run codegen` (@shopify/api-codegen-preset) pick these up and validate
// them against the live 2026-07 Storefront schema (R5).

export const SHOP_NAME_QUERY = `#graphql
  query ShopName {
    shop {
      name
    }
  }
`

/**
 * Card-level product data shared by every listing surface (/shop,
 * collections, homepage best sellers). Image aliases feed the srcset the
 * adapter assembles; Shopify serves the transform from its CDN.
 */
/**
 * Card-level product data shared by every listing surface (/shop,
 * collections, homepage rails, search). Image aliases feed the srcset
 * the adapter assembles; Shopify serves the transform from its CDN.
 *
 * Three fields exist purely so the card component's built-in behaviour
 * is reachable rather than dead:
 *
 *   images(first: 2)     the second photograph the card crossfades to
 *                        on hover; absent on single-image products, and
 *                        the card falls back to a slow scale.
 *   variants(first: 2)   asked for two so one node means "one variant,
 *                        safe to Quick add with this id" and two means
 *                        "needs a size or length chosen first". Cheaper
 *                        and more exact than counting option values.
 *   compareAtPriceRange  drives the struck was-price and the Sale badge.
 *   reviews.rating /     the star row and review count on every tile.
 *   reviews.rating_count Namespace/key that Judge.me, Okendo, Loox,
 *                        Yotpo and Shopify Product Reviews all write.
 *                        Returns null when no review app is installed —
 *                        an undefined metafield is not an error — so the
 *                        card renders no stars until real data arrives.
 */
export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    handle
    title
    availableForSale
    featuredImage {
      altText
      width
      height
      w400: url(transform: { maxWidth: 400 })
      w600: url(transform: { maxWidth: 600 })
      w800: url(transform: { maxWidth: 800 })
      w1200: url(transform: { maxWidth: 1200 })
    }
    images(first: 2) {
      nodes {
        altText
        width
        height
        w400: url(transform: { maxWidth: 400 })
        w600: url(transform: { maxWidth: 600 })
        w800: url(transform: { maxWidth: 800 })
        w1200: url(transform: { maxWidth: 1200 })
      }
    }
    variants(first: 2) {
      nodes {
        id
        availableForSale
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    ratingMetafield: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCountMetafield: metafield(namespace: "reviews", key: "rating_count") {
      value
    }
  }
`

/**
 * The catalog listing query. `sortKey` defaults to BEST_SELLING so every
 * existing caller (the /shop grid, the best-sellers window) is
 * unchanged; the homepage's New arrivals rail passes CREATED_AT.
 *
 * The default lives in the GraphQL variable definition rather than in
 * each caller so there is exactly one place that decides what "no sort
 * specified" means.
 */
export const SHOP_PRODUCTS_QUERY = `#graphql
  query ShopProducts($first: Int!, $sortKey: ProductSortKeys = BEST_SELLING) {
    products(first: $first, sortKey: $sortKey) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`

/**
 * Sitemap enumeration: cursor loops over products and collections,
 * requesting only handle + updatedAt (250/page).
 */
export const SITEMAP_PRODUCTS_QUERY = `#graphql
  query SitemapProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        handle
        updatedAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export const SITEMAP_COLLECTIONS_QUERY = `#graphql
  query SitemapCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      nodes {
        handle
        updatedAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

/**
 * Lean per-variant fields for the bulk variant list: the 250-node list
 * exists only to compute sibling option availability, so it never needs
 * price/title — those ride on the resolved selected/fallback variant.
 */
export const VARIANT_AVAILABILITY_FRAGMENT = `#graphql
  fragment VariantAvailability on ProductVariant {
    id
    availableForSale
    selectedOptions {
      name
      value
    }
  }
`

export const VARIANT_FIELDS_FRAGMENT = `#graphql
  fragment VariantFields on ProductVariant {
    id
    title
    availableForSale
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    selectedOptions {
      name
      value
    }
  }
`

/**
 * PDP query. Variant selection resolves server-side: the URL's option
 * params go in as $selectedOptions; `selectedVariant` is the exact match
 * (null when the combination doesn't exist) and `fallbackVariant` is
 * Shopify's selected-or-first-available resolution — the adapter prefers
 * the exact match. Unknown option names are ignored, matching is
 * case-insensitive, so shared URLs are forgiving.
 */
export const PRODUCT_QUERY = `#graphql
  query ProductByHandle($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
    product(handle: $handle) {
      handle
      title
      description
      seo {
        title
        description
      }
      options(first: 5) {
        name
        optionValues {
          name
          swatch {
            color
          }
        }
      }
      images(first: 10) {
        nodes {
          altText
          width
          height
          thumb: url(transform: { maxWidth: 160, maxHeight: 160, crop: CENTER })
          w600: url(transform: { maxWidth: 600 })
          w900: url(transform: { maxWidth: 900 })
          w1200: url(transform: { maxWidth: 1200 })
          w1600: url(transform: { maxWidth: 1600 })
        }
      }
      variants(first: 250) {
        nodes {
          ...VariantAvailability
        }
      }
      selectedVariant: variantBySelectedOptions(
        selectedOptions: $selectedOptions
        caseInsensitiveMatch: true
        ignoreUnknownOptions: true
      ) {
        ...VariantFields
      }
      fallbackVariant: selectedOrFirstAvailableVariant(
        selectedOptions: $selectedOptions
        caseInsensitiveMatch: true
        ignoreUnknownOptions: true
      ) {
        ...VariantFields
      }
      ratingMetafield: metafield(namespace: "reviews", key: "rating") {
        value
      }
      ratingCountMetafield: metafield(namespace: "reviews", key: "rating_count") {
        value
      }
    }
  }
  ${VARIANT_FIELDS_FRAGMENT}
  ${VARIANT_AVAILABILITY_FRAGMENT}
`

/*
 * CATEGORY_TILE_IMAGES_QUERY used to live here: five aliased
 * `collection(handle:)` fields whose first in-stock product image
 * backed a homepage category tile. It was deleted when the tiles moved
 * onto the virtual-collection rules — with no collections in the store
 * every alias resolved to null and every tile was dropped, so the
 * homepage lost its category row to a query that could only work after
 * the admin work it was meant to survive. Tiles now come out of the
 * same catalog fetch the page already makes (see routes/index.tsx).
 */

/**
 * One collection with up to 250 products in a single fetch (KTD8):
 * boutique-scale catalogs slice server-side for ?page=N. Swap to cursor
 * pagination here if a collection ever outgrows 250.
 */
export const COLLECTION_QUERY = `#graphql
  query CollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      handle
      title
      description
      seo {
        title
        description
      }
      products(first: $first) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`
