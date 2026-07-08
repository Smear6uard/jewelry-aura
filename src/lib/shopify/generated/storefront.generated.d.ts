/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types.js';

export type ShopNameQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type ShopNameQuery = { shop: Pick<StorefrontTypes.Shop, 'name'> };

export type ProductCardFragment = (
  Pick<StorefrontTypes.Product, 'handle' | 'title' | 'availableForSale'>
  & { featuredImage?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Image, 'altText' | 'width' | 'height'>
    & { w400: StorefrontTypes.Image['url'], w600: StorefrontTypes.Image['url'], w800: StorefrontTypes.Image['url'], w1200: StorefrontTypes.Image['url'] }
  )>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
);

export type ShopProductsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
}>;


export type ShopProductsQuery = { products: { nodes: Array<(
      Pick<StorefrontTypes.Product, 'handle' | 'title' | 'availableForSale'>
      & { featuredImage?: StorefrontTypes.Maybe<(
        Pick<StorefrontTypes.Image, 'altText' | 'width' | 'height'>
        & { w400: StorefrontTypes.Image['url'], w600: StorefrontTypes.Image['url'], w800: StorefrontTypes.Image['url'], w1200: StorefrontTypes.Image['url'] }
      )>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
    )> } };

interface GeneratedQueryTypes {
  "#graphql\n  query ShopName {\n    shop {\n      name\n    }\n  }\n": {return: ShopNameQuery, variables: ShopNameQueryVariables},
  "#graphql\n  query ShopProducts($first: Int!) {\n    products(first: $first, sortKey: BEST_SELLING) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    handle\n    title\n    availableForSale\n    featuredImage {\n      altText\n      width\n      height\n      w400: url(transform: { maxWidth: 400 })\n      w600: url(transform: { maxWidth: 600 })\n      w800: url(transform: { maxWidth: 800 })\n      w1200: url(transform: { maxWidth: 1200 })\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n  }\n\n": {return: ShopProductsQuery, variables: ShopProductsQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
