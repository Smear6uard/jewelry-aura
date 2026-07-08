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
