/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types.js';

export type ShopNameQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type ShopNameQuery = { shop: Pick<StorefrontTypes.Shop, 'name'> };

interface GeneratedQueryTypes {
  "#graphql\n  query ShopName {\n    shop {\n      name\n    }\n  }\n": {return: ShopNameQuery, variables: ShopNameQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
