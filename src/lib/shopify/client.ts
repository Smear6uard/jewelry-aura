// Server-only module: holds the private Storefront token. Import from
// createServerFn handlers / server route handlers only — never from
// client-side component code.

import {
  createStorefrontApiClient,
  type StorefrontApiClient,
} from '@shopify/storefront-api-client'
import { SHOPIFY_API_VERSION, getShopifyEnv } from './env'

let client: StorefrontApiClient | undefined

function getClient(): StorefrontApiClient {
  if (!client) {
    const env = getShopifyEnv()
    client = createStorefrontApiClient({
      storeDomain: env.storeDomain,
      apiVersion: SHOPIFY_API_VERSION,
      privateAccessToken: env.privateAccessToken,
      // Dev-only endpoint override (see ShopifyEnv.apiEndpoint) — requests
      // keep their headers/body but go to the override URL.
      ...(env.apiEndpoint
        ? {
            customFetchApi: (_url, init) =>
              fetch(env.apiEndpoint as string, init as RequestInit),
          }
        : {}),
    })
  }
  return client
}

export interface StorefrontRequestOptions {
  variables?: Record<string, unknown>
  /**
   * Visitor IP forwarded as `Shopify-Storefront-Buyer-IP` on buyer-initiated
   * requests, keeping SSR traffic in Shopify's unthrottled buyer lane (KTD7).
   */
  buyerIp?: string
}

export async function storefrontRequest<TData>(
  operation: string,
  { variables, buyerIp }: StorefrontRequestOptions = {},
): Promise<TData> {
  const response = await getClient().request<TData>(operation, {
    variables,
    ...(buyerIp ? { headers: { 'Shopify-Storefront-Buyer-IP': buyerIp } } : {}),
  })

  if (response.errors) {
    const { networkStatusCode, message, graphQLErrors } = response.errors
    const details =
      graphQLErrors
        ?.map((error: { message?: string }) => error.message)
        .filter(Boolean)
        .join('; ') ||
      message ||
      'unknown error'
    const status = networkStatusCode ? ` (HTTP ${networkStatusCode})` : ''
    throw new Error(`Storefront API request failed${status}: ${details}`)
  }

  if (response.data === undefined || response.data === null) {
    throw new Error('Storefront API returned a response with no data')
  }

  return response.data
}
