// Server-only module. Env is validated lazily at first use so a missing
// variable fails fast with a clear message at call time, but never breaks
// boot/build of the rest of the site (Shopify env is absent until U2).

export const SHOPIFY_API_VERSION = '2026-07'

export interface ShopifyEnv {
  storeDomain: string
  privateAccessToken: string
  /**
   * Dev-only escape hatch: when set (e.g. https://mock.shop/api), every
   * Storefront request is sent to this endpoint instead of the store's
   * GraphQL URL, and the domain/token become optional. Never set this in
   * Vercel — it exists so the storefront can be built and reviewed locally
   * before real credentials arrive.
   */
  apiEndpoint?: string
}

export function getShopifyEnv(): ShopifyEnv {
  const apiEndpoint = process.env.SHOPIFY_API_ENDPOINT
  if (apiEndpoint) {
    // Fail closed on Vercel: a stray override in a deployed environment
    // would silently route the live store to an arbitrary host.
    if (process.env.VERCEL) {
      throw new Error(
        'SHOPIFY_API_ENDPOINT is a local-dev-only override and must never be set on Vercel deployments.',
      )
    }
    return {
      storeDomain: 'mock-storefront.myshopify.com',
      // Never hand the real private token to an override host — the mock
      // endpoint needs no auth, so a placeholder always goes out instead.
      privateAccessToken: 'mock-token',
      apiEndpoint,
    }
  }

  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN
  const privateAccessToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN

  const missing = [
    !storeDomain && 'SHOPIFY_STORE_DOMAIN',
    !privateAccessToken && 'SHOPIFY_STOREFRONT_PRIVATE_TOKEN',
  ].filter((name): name is string => Boolean(name))

  if (missing.length > 0) {
    throw new Error(
      `Missing Shopify environment variable(s): ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill them in (see docs/RUNBOOK.md).',
    )
  }

  return {
    storeDomain: storeDomain as string,
    privateAccessToken: privateAccessToken as string,
  }
}
