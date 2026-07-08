/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types.js';

export type CartFieldsFragment = (
  Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>
  & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { nodes: Array<(
      Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
      & { merchandise: (
        Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
        & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
      ) }
    ) | (
      Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
      & { merchandise: (
        Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
        & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
      ) }
    )> } }
);

export type GetCartQueryVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetCartQuery = { cart?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>
    & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { nodes: Array<(
        Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
        & { merchandise: (
          Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
          & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
        ) }
      ) | (
        Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
        & { merchandise: (
          Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
          & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
        ) }
      )> } }
  )> };

export type CartCreateMutationVariables = StorefrontTypes.Exact<{
  lines: Array<StorefrontTypes.CartLineInput> | StorefrontTypes.CartLineInput;
}>;


export type CartCreateMutation = { cartCreate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>
      & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { nodes: Array<(
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
            & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
          ) }
        ) | (
          Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
            & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
          ) }
        )> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type CartLinesAddMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineInput> | StorefrontTypes.CartLineInput;
}>;


export type CartLinesAddMutation = { cartLinesAdd?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>
      & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { nodes: Array<(
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
            & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
          ) }
        ) | (
          Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
            & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
          ) }
        )> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type CartLinesUpdateMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineUpdateInput> | StorefrontTypes.CartLineUpdateInput;
}>;


export type CartLinesUpdateMutation = { cartLinesUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>
      & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { nodes: Array<(
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
            & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
          ) }
        ) | (
          Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
            & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
          ) }
        )> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type CartLinesRemoveMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lineIds: Array<StorefrontTypes.Scalars['ID']['input']> | StorefrontTypes.Scalars['ID']['input'];
}>;


export type CartLinesRemoveMutation = { cartLinesRemove?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity'>
      & { cost: { subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { nodes: Array<(
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
            & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
          ) }
        ) | (
          Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
            & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: Pick<StorefrontTypes.Product, 'title' | 'handle'> }
          ) }
        )> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

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

export type SitemapProductsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type SitemapProductsQuery = { products: { nodes: Array<Pick<StorefrontTypes.Product, 'handle' | 'updatedAt'>>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type SitemapCollectionsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type SitemapCollectionsQuery = { collections: { nodes: Array<Pick<StorefrontTypes.Collection, 'handle' | 'updatedAt'>>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type VariantFieldsFragment = (
  Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
  & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
);

export type ProductByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  selectedOptions: Array<StorefrontTypes.SelectedOptionInput> | StorefrontTypes.SelectedOptionInput;
}>;


export type ProductByHandleQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'handle' | 'title' | 'description'>
    & { seo: Pick<StorefrontTypes.Seo, 'title' | 'description'>, options: Array<(
      Pick<StorefrontTypes.ProductOption, 'name'>
      & { optionValues: Array<(
        Pick<StorefrontTypes.ProductOptionValue, 'name'>
        & { swatch?: StorefrontTypes.Maybe<Pick<StorefrontTypes.ProductOptionValueSwatch, 'color'>> }
      )> }
    )>, images: { nodes: Array<(
        Pick<StorefrontTypes.Image, 'altText' | 'width' | 'height'>
        & { thumb: StorefrontTypes.Image['url'], w600: StorefrontTypes.Image['url'], w900: StorefrontTypes.Image['url'], w1200: StorefrontTypes.Image['url'], w1600: StorefrontTypes.Image['url'] }
      )> }, variants: { nodes: Array<(
        Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
        & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
      )> }, selectedVariant?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
      & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
    )>, fallbackVariant?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
      & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
    )> }
  )> };

export type CollectionByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  first: StorefrontTypes.Scalars['Int']['input'];
}>;


export type CollectionByHandleQuery = { collection?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Collection, 'handle' | 'title' | 'description'>
    & { seo: Pick<StorefrontTypes.Seo, 'title' | 'description'>, products: { nodes: Array<(
        Pick<StorefrontTypes.Product, 'handle' | 'title' | 'availableForSale'>
        & { featuredImage?: StorefrontTypes.Maybe<(
          Pick<StorefrontTypes.Image, 'altText' | 'width' | 'height'>
          & { w400: StorefrontTypes.Image['url'], w600: StorefrontTypes.Image['url'], w800: StorefrontTypes.Image['url'], w1200: StorefrontTypes.Image['url'] }
        )>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
      )> } }
  )> };

interface GeneratedQueryTypes {
  "#graphql\n  query GetCart($cartId: ID!) {\n    cart(id: $cartId) {\n      ...CartFields\n    }\n  }\n  #graphql\n  fragment CartFields on Cart {\n    id\n    checkoutUrl\n    totalQuantity\n    cost {\n      subtotalAmount {\n        amount\n        currencyCode\n      }\n      totalAmount {\n        amount\n        currencyCode\n      }\n    }\n    lines(first: 100) {\n      nodes {\n        id\n        quantity\n        merchandise {\n          ... on ProductVariant {\n            id\n            title\n            availableForSale\n            price {\n              amount\n              currencyCode\n            }\n            image {\n              url\n              altText\n              width\n              height\n            }\n            product {\n              title\n              handle\n            }\n          }\n        }\n      }\n    }\n  }\n\n": {return: GetCartQuery, variables: GetCartQueryVariables},
  "#graphql\n  query ShopName {\n    shop {\n      name\n    }\n  }\n": {return: ShopNameQuery, variables: ShopNameQueryVariables},
  "#graphql\n  query ShopProducts($first: Int!) {\n    products(first: $first, sortKey: BEST_SELLING) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    handle\n    title\n    availableForSale\n    featuredImage {\n      altText\n      width\n      height\n      w400: url(transform: { maxWidth: 400 })\n      w600: url(transform: { maxWidth: 600 })\n      w800: url(transform: { maxWidth: 800 })\n      w1200: url(transform: { maxWidth: 1200 })\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n  }\n\n": {return: ShopProductsQuery, variables: ShopProductsQueryVariables},
  "#graphql\n  query SitemapProducts($first: Int!, $after: String) {\n    products(first: $first, after: $after) {\n      nodes {\n        handle\n        updatedAt\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: SitemapProductsQuery, variables: SitemapProductsQueryVariables},
  "#graphql\n  query SitemapCollections($first: Int!, $after: String) {\n    collections(first: $first, after: $after) {\n      nodes {\n        handle\n        updatedAt\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: SitemapCollectionsQuery, variables: SitemapCollectionsQueryVariables},
  "#graphql\n  query ProductByHandle($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {\n    product(handle: $handle) {\n      handle\n      title\n      description\n      seo {\n        title\n        description\n      }\n      options(first: 5) {\n        name\n        optionValues {\n          name\n          swatch {\n            color\n          }\n        }\n      }\n      images(first: 10) {\n        nodes {\n          altText\n          width\n          height\n          thumb: url(transform: { maxWidth: 160, maxHeight: 160, crop: CENTER })\n          w600: url(transform: { maxWidth: 600 })\n          w900: url(transform: { maxWidth: 900 })\n          w1200: url(transform: { maxWidth: 1200 })\n          w1600: url(transform: { maxWidth: 1600 })\n        }\n      }\n      variants(first: 250) {\n        nodes {\n          ...VariantFields\n        }\n      }\n      selectedVariant: variantBySelectedOptions(\n        selectedOptions: $selectedOptions\n        caseInsensitiveMatch: true\n        ignoreUnknownOptions: true\n      ) {\n        ...VariantFields\n      }\n      fallbackVariant: selectedOrFirstAvailableVariant(\n        selectedOptions: $selectedOptions\n        caseInsensitiveMatch: true\n        ignoreUnknownOptions: true\n      ) {\n        ...VariantFields\n      }\n    }\n  }\n  #graphql\n  fragment VariantFields on ProductVariant {\n    id\n    title\n    availableForSale\n    price {\n      amount\n      currencyCode\n    }\n    compareAtPrice {\n      amount\n      currencyCode\n    }\n    selectedOptions {\n      name\n      value\n    }\n  }\n\n": {return: ProductByHandleQuery, variables: ProductByHandleQueryVariables},
  "#graphql\n  query CollectionByHandle($handle: String!, $first: Int!) {\n    collection(handle: $handle) {\n      handle\n      title\n      description\n      seo {\n        title\n        description\n      }\n      products(first: $first) {\n        nodes {\n          ...ProductCard\n        }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    handle\n    title\n    availableForSale\n    featuredImage {\n      altText\n      width\n      height\n      w400: url(transform: { maxWidth: 400 })\n      w600: url(transform: { maxWidth: 600 })\n      w800: url(transform: { maxWidth: 800 })\n      w1200: url(transform: { maxWidth: 1200 })\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n  }\n\n": {return: CollectionByHandleQuery, variables: CollectionByHandleQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n  mutation CartCreate($lines: [CartLineInput!]!) {\n    cartCreate(input: { lines: $lines }) {\n      cart {\n        ...CartFields\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n  #graphql\n  fragment CartFields on Cart {\n    id\n    checkoutUrl\n    totalQuantity\n    cost {\n      subtotalAmount {\n        amount\n        currencyCode\n      }\n      totalAmount {\n        amount\n        currencyCode\n      }\n    }\n    lines(first: 100) {\n      nodes {\n        id\n        quantity\n        merchandise {\n          ... on ProductVariant {\n            id\n            title\n            availableForSale\n            price {\n              amount\n              currencyCode\n            }\n            image {\n              url\n              altText\n              width\n              height\n            }\n            product {\n              title\n              handle\n            }\n          }\n        }\n      }\n    }\n  }\n\n": {return: CartCreateMutation, variables: CartCreateMutationVariables},
  "#graphql\n  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {\n    cartLinesAdd(cartId: $cartId, lines: $lines) {\n      cart {\n        ...CartFields\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n  #graphql\n  fragment CartFields on Cart {\n    id\n    checkoutUrl\n    totalQuantity\n    cost {\n      subtotalAmount {\n        amount\n        currencyCode\n      }\n      totalAmount {\n        amount\n        currencyCode\n      }\n    }\n    lines(first: 100) {\n      nodes {\n        id\n        quantity\n        merchandise {\n          ... on ProductVariant {\n            id\n            title\n            availableForSale\n            price {\n              amount\n              currencyCode\n            }\n            image {\n              url\n              altText\n              width\n              height\n            }\n            product {\n              title\n              handle\n            }\n          }\n        }\n      }\n    }\n  }\n\n": {return: CartLinesAddMutation, variables: CartLinesAddMutationVariables},
  "#graphql\n  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {\n    cartLinesUpdate(cartId: $cartId, lines: $lines) {\n      cart {\n        ...CartFields\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n  #graphql\n  fragment CartFields on Cart {\n    id\n    checkoutUrl\n    totalQuantity\n    cost {\n      subtotalAmount {\n        amount\n        currencyCode\n      }\n      totalAmount {\n        amount\n        currencyCode\n      }\n    }\n    lines(first: 100) {\n      nodes {\n        id\n        quantity\n        merchandise {\n          ... on ProductVariant {\n            id\n            title\n            availableForSale\n            price {\n              amount\n              currencyCode\n            }\n            image {\n              url\n              altText\n              width\n              height\n            }\n            product {\n              title\n              handle\n            }\n          }\n        }\n      }\n    }\n  }\n\n": {return: CartLinesUpdateMutation, variables: CartLinesUpdateMutationVariables},
  "#graphql\n  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {\n    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {\n      cart {\n        ...CartFields\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n  #graphql\n  fragment CartFields on Cart {\n    id\n    checkoutUrl\n    totalQuantity\n    cost {\n      subtotalAmount {\n        amount\n        currencyCode\n      }\n      totalAmount {\n        amount\n        currencyCode\n      }\n    }\n    lines(first: 100) {\n      nodes {\n        id\n        quantity\n        merchandise {\n          ... on ProductVariant {\n            id\n            title\n            availableForSale\n            price {\n              amount\n              currencyCode\n            }\n            image {\n              url\n              altText\n              width\n              height\n            }\n            product {\n              title\n              handle\n            }\n          }\n        }\n      }\n    }\n  }\n\n": {return: CartLinesRemoveMutation, variables: CartLinesRemoveMutationVariables},
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
