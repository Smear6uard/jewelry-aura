import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const QUERY = `#graphql
  query ShopName {
    shop {
      name
    }
  }
`

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function loadStorefrontRequest() {
  const mod = await import('./client')
  return mod.storefrontRequest
}

function fetchMockReturning(body: unknown) {
  return vi.fn(async (_url: string, _init?: RequestInit) => jsonResponse(body))
}

beforeEach(() => {
  // client.ts memoizes its client, so isolate modules per test
  vi.resetModules()
  vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'test-store.myshopify.com')
  vi.stubEnv('SHOPIFY_STOREFRONT_PRIVATE_TOKEN', 'shppa_test_private_token')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('storefrontRequest', () => {
  it('throws a descriptive error when env vars are missing', async () => {
    vi.stubEnv('SHOPIFY_STOREFRONT_PRIVATE_TOKEN', '')
    const storefrontRequest = await loadStorefrontRequest()

    await expect(storefrontRequest(QUERY)).rejects.toThrow(
      /SHOPIFY_STOREFRONT_PRIVATE_TOKEN/,
    )
  })

  it('sends the private token and forwards the buyer IP header when given', async () => {
    const fetchMock = fetchMockReturning({
      data: { shop: { name: 'Jewelry Aura' } },
    })
    vi.stubGlobal('fetch', fetchMock)
    const storefrontRequest = await loadStorefrontRequest()

    await storefrontRequest(QUERY, { buyerIp: '203.0.113.7' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('test-store.myshopify.com')
    expect(url).toContain('2026-07')
    const headers = new Headers(init?.headers)
    expect(headers.get('shopify-storefront-private-token')).toBe(
      'shppa_test_private_token',
    )
    expect(headers.get('shopify-storefront-buyer-ip')).toBe('203.0.113.7')
  })

  it('does not send a buyer IP header when none is given', async () => {
    const fetchMock = fetchMockReturning({
      data: { shop: { name: 'Jewelry Aura' } },
    })
    vi.stubGlobal('fetch', fetchMock)
    const storefrontRequest = await loadStorefrontRequest()

    await storefrontRequest(QUERY)

    const [, init] = fetchMock.mock.calls[0]
    expect(new Headers(init?.headers).get('shopify-storefront-buyer-ip')).toBeNull()
  })

  it('surfaces GraphQL errors in a 200 response as a thrown error', async () => {
    const fetchMock = fetchMockReturning({
      errors: [{ message: "Field 'bogus' doesn't exist on type 'Shop'" }],
    })
    vi.stubGlobal('fetch', fetchMock)
    const storefrontRequest = await loadStorefrontRequest()

    await expect(storefrontRequest(QUERY)).rejects.toThrow(/bogus/)
  })

  it('returns data on the happy path', async () => {
    const fetchMock = fetchMockReturning({
      data: { shop: { name: 'Jewelry Aura' } },
    })
    vi.stubGlobal('fetch', fetchMock)
    const storefrontRequest = await loadStorefrontRequest()

    const data = await storefrontRequest<{ shop: { name: string } }>(QUERY)

    expect(data.shop.name).toBe('Jewelry Aura')
  })

  describe('SHOPIFY_API_ENDPOINT dev override', () => {
    it('routes requests to the override URL and never sends a real token', async () => {
      vi.stubEnv('SHOPIFY_API_ENDPOINT', 'https://mock.shop/api')
      // Even with a real token configured, the override must not receive it.
      vi.stubEnv('SHOPIFY_STOREFRONT_PRIVATE_TOKEN', 'shppa_real_secret')
      const fetchMock = fetchMockReturning({
        data: { shop: { name: 'Mock Shop' } },
      })
      vi.stubGlobal('fetch', fetchMock)
      const storefrontRequest = await loadStorefrontRequest()

      await storefrontRequest(QUERY)

      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe('https://mock.shop/api')
      const token = new Headers(init?.headers).get(
        'shopify-storefront-private-token',
      )
      expect(token).toBe('mock-token')
      expect(token).not.toContain('shppa_real_secret')
    })

    it('fails closed when the override is set on a Vercel deployment', async () => {
      vi.stubEnv('SHOPIFY_API_ENDPOINT', 'https://mock.shop/api')
      vi.stubEnv('VERCEL', '1')
      const storefrontRequest = await loadStorefrontRequest()

      await expect(storefrontRequest(QUERY)).rejects.toThrow(/local-dev-only/)
    })
  })
})
