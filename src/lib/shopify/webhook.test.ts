import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { handleShopifyWebhook, verifyWebhookHmac } from './webhook'

const SECRET = 'shpss_test_webhook_secret'

function sign(rawBody: string, secret = SECRET): string {
  return createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
}

function makeDeps(overrides?: Partial<Parameters<typeof handleShopifyWebhook>[1]>) {
  return {
    secret: SECRET,
    invalidate: vi.fn(async (_tags: string[]) => undefined),
    log: vi.fn(),
    warn: vi.fn(),
    ...overrides,
  }
}

function makeInput(
  rawBody: string,
  topic: string | null,
  overrides?: Partial<Parameters<typeof handleShopifyWebhook>[0]>,
) {
  return {
    rawBody,
    hmacHeader: sign(rawBody),
    topic,
    webhookId: 'wh-test-0001',
    ...overrides,
  }
}

describe('handleShopifyWebhook', () => {
  it('purges product + listing tags on products/update with a valid handle', async () => {
    const rawBody = JSON.stringify({ id: 1, handle: 'cuban-link-chain' })
    const deps = makeDeps()

    const result = await handleShopifyWebhook(makeInput(rawBody, 'products/update'), deps)

    expect(result.status).toBe(200)
    expect(result.purgedTags).toEqual(['product-cuban-link-chain', 'products', 'home'])
    expect(deps.invalidate).toHaveBeenCalledTimes(1)
    expect(deps.invalidate).toHaveBeenCalledWith([
      'product-cuban-link-chain',
      'products',
      'home',
    ])
  })

  it('purges product + listing tags on products/delete with a valid handle', async () => {
    const rawBody = JSON.stringify({ id: 1, handle: 'cuban-link-chain' })
    const deps = makeDeps()

    const result = await handleShopifyWebhook(makeInput(rawBody, 'products/delete'), deps)

    expect(result.status).toBe(200)
    expect(result.purgedTags).toEqual(['product-cuban-link-chain', 'products', 'home'])
    expect(deps.invalidate).toHaveBeenCalledTimes(1)
    expect(deps.invalidate).toHaveBeenCalledWith([
      'product-cuban-link-chain',
      'products',
      'home',
    ])
  })

  it('rejects a tampered body with 401 and no purge', async () => {
    const rawBody = JSON.stringify({ handle: 'cuban-link-chain' })
    const tamperedBody = JSON.stringify({ handle: 'evil-handle' })
    const deps = makeDeps()

    const result = await handleShopifyWebhook(
      makeInput(tamperedBody, 'products/update', { hmacHeader: sign(rawBody) }),
      deps,
    )

    expect(result.status).toBe(401)
    expect(result.purgedTags).toBeNull()
    expect(deps.invalidate).not.toHaveBeenCalled()
  })

  it('rejects an HMAC computed with the wrong secret with 401 and no purge', async () => {
    const rawBody = JSON.stringify({ handle: 'cuban-link-chain' })
    const deps = makeDeps()

    const result = await handleShopifyWebhook(
      makeInput(rawBody, 'products/update', {
        hmacHeader: sign(rawBody, 'wrong-secret'),
      }),
      deps,
    )

    expect(result.status).toBe(401)
    expect(deps.invalidate).not.toHaveBeenCalled()
  })

  it('rejects a missing HMAC header with 401 and no purge', async () => {
    const rawBody = JSON.stringify({ handle: 'cuban-link-chain' })
    const deps = makeDeps()

    const result = await handleShopifyWebhook(
      makeInput(rawBody, 'products/update', { hmacHeader: null }),
      deps,
    )

    expect(result.status).toBe(401)
    expect(deps.invalidate).not.toHaveBeenCalled()
  })

  it('fails closed with 401 and a warning when the secret env is unset', async () => {
    const rawBody = JSON.stringify({ handle: 'cuban-link-chain' })
    const deps = makeDeps({ secret: undefined })

    const result = await handleShopifyWebhook(makeInput(rawBody, 'products/update'), deps)

    expect(result.status).toBe(401)
    expect(deps.invalidate).not.toHaveBeenCalled()
    expect(deps.warn).toHaveBeenCalledWith(
      expect.stringContaining('SHOPIFY_WEBHOOK_SECRET'),
    )
  })

  it('acknowledges unknown topics with 200 and no purge', async () => {
    const rawBody = JSON.stringify({ id: 42 })
    const deps = makeDeps()

    const result = await handleShopifyWebhook(makeInput(rawBody, 'orders/create'), deps)

    expect(result.status).toBe(200)
    expect(result.purgedTags).toBeNull()
    expect(deps.invalidate).not.toHaveBeenCalled()
  })

  it('purges listing tags only and warns on malformed JSON behind a valid HMAC', async () => {
    const rawBody = '{"handle": "cuban-link-chain"' // truncated JSON
    const deps = makeDeps()

    const result = await handleShopifyWebhook(makeInput(rawBody, 'products/update'), deps)

    expect(result.status).toBe(200)
    expect(result.purgedTags).toEqual(['products', 'home'])
    expect(deps.invalidate).toHaveBeenCalledTimes(1)
    expect(deps.invalidate).toHaveBeenCalledWith(['products', 'home'])
    expect(deps.warn).toHaveBeenCalledWith(expect.stringContaining('malformed JSON'))
  })

  it('purges listing tags only and warns when the handle fails the pattern', async () => {
    const rawBody = JSON.stringify({ handle: 'Bad Handle' })
    const deps = makeDeps()

    const result = await handleShopifyWebhook(makeInput(rawBody, 'products/update'), deps)

    expect(result.status).toBe(200)
    expect(result.purgedTags).toEqual(['products', 'home'])
    expect(deps.invalidate).toHaveBeenCalledTimes(1)
    expect(deps.invalidate).toHaveBeenCalledWith(['products', 'home'])
    expect(deps.warn).toHaveBeenCalledWith(expect.stringContaining('no usable handle'))
  })

  it('purges listing tags only when the handle is missing entirely', async () => {
    const rawBody = JSON.stringify({ id: 7 })
    const deps = makeDeps()

    const result = await handleShopifyWebhook(makeInput(rawBody, 'products/update'), deps)

    expect(result.status).toBe(200)
    expect(result.purgedTags).toEqual(['products', 'home'])
    expect(deps.invalidate).toHaveBeenCalledWith(['products', 'home'])
  })

  it('still returns 200 when invalidate throws', async () => {
    const rawBody = JSON.stringify({ handle: 'cuban-link-chain' })
    const deps = makeDeps({
      invalidate: vi.fn(async () => {
        throw new Error('not running on Vercel')
      }),
    })

    const result = await handleShopifyWebhook(makeInput(rawBody, 'products/update'), deps)

    expect(result.status).toBe(200)
    expect(result.purgedTags).toBeNull()
    expect(deps.warn).toHaveBeenCalledWith(expect.stringContaining('not running on Vercel'))
  })

  it('logs the webhook id and topic on every request', async () => {
    const rawBody = JSON.stringify({ handle: 'cuban-link-chain' })
    const deps = makeDeps()

    await handleShopifyWebhook(
      makeInput(rawBody, 'products/update', { webhookId: 'wh-forensics-42' }),
      deps,
    )

    expect(deps.log).toHaveBeenCalledWith(expect.stringContaining('wh-forensics-42'))
    expect(deps.log).toHaveBeenCalledWith(expect.stringContaining('products/update'))
  })
})

describe('verifyWebhookHmac', () => {
  it('verifies against the RAW body — a re-serialized equivalent payload fails', () => {
    // Same JSON data, different byte layout: key order + whitespace differ.
    const rawBody = '{ "updated_at": "2026-07-08T12:00:00Z", "handle": "cuban-link-chain" }'
    const hmac = sign(rawBody)

    // The raw bytes verify.
    expect(verifyWebhookHmac(rawBody, hmac, SECRET)).toBe(true)

    // JSON.stringify(JSON.parse(...)) is semantically identical but
    // byte-different — it must NOT verify.
    const reserialized = JSON.stringify(JSON.parse(rawBody))
    expect(reserialized).not.toBe(rawBody)
    expect(JSON.parse(reserialized)).toEqual(JSON.parse(rawBody))
    expect(verifyWebhookHmac(reserialized, hmac, SECRET)).toBe(false)
  })

  it('returns false for a header that is not valid base64 of the right length', () => {
    expect(verifyWebhookHmac('body', 'too-short', SECRET)).toBe(false)
  })

  it('returns false when the secret or header is missing', () => {
    const rawBody = '{}'
    expect(verifyWebhookHmac(rawBody, sign(rawBody), undefined)).toBe(false)
    expect(verifyWebhookHmac(rawBody, sign(rawBody), '')).toBe(false)
    expect(verifyWebhookHmac(rawBody, null, SECRET)).toBe(false)
  })
})
