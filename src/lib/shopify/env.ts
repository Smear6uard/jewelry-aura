// Server-only module. Env is validated lazily at first use so a missing
// variable fails fast with a clear message at call time, but never breaks
// boot/build of the rest of the site (Shopify env is absent until U2).

export const SHOPIFY_API_VERSION = '2026-07'

export interface ShopifyEnv {
  storeDomain: string
  privateAccessToken: string
}

export function getShopifyEnv(): ShopifyEnv {
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
