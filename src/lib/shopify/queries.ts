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
