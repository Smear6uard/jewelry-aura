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
 * collections, featured collections). Image aliases feed the srcset the
 * adapter assembles; Shopify serves the transform from its CDN.
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
  }
`

export const SHOP_PRODUCTS_QUERY = `#graphql
  query ShopProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
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
 * One collection with up to 250 products in a single fetch (KTD8):
 * boutique-scale catalogs slice server-side for ?page=N. Swap to cursor
 * pagination here if a collection ever outgrows 250.
 */
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
          ...VariantFields
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
    }
  }
  ${VARIANT_FIELDS_FRAGMENT}
`

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
