import { createHmac, timingSafeEqual } from 'node:crypto'

// Shopify webhook verification + purge logic (plan U9). Pure/injectable so the
// route handler stays a thin wrapper and the logic is unit-testable.

// Handle sanity (never interpolate an unvalidated string into a cache tag)
// shares the adapters module's definition of a valid Shopify handle.
import { isValidHandle } from './adapters'

/**
 * Verify Shopify's X-Shopify-Hmac-Sha256 header against the RAW request body.
 *
 * Verification MUST run on the exact bytes Shopify sent — never on a
 * re-serialized parsed object (key order / whitespace changes break the HMAC).
 * Fails closed: missing header or missing secret → false.
 */
export function verifyWebhookHmac(
  rawBody: string,
  hmacHeader: string | null,
  secret: string | undefined,
): boolean {
  if (!secret || !hmacHeader) return false
  try {
    const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest()
    const provided = Buffer.from(hmacHeader, 'base64')
    // timingSafeEqual throws on length mismatch — guard first.
    if (provided.length !== expected.length) return false
    return timingSafeEqual(provided, expected)
  } catch {
    return false
  }
}

export interface ShopifyWebhookInput {
  rawBody: string
  hmacHeader: string | null
  topic: string | null
  webhookId: string | null
}

export interface ShopifyWebhookDeps {
  secret: string | undefined
  invalidate: (tags: string[]) => Promise<unknown>
  log?: (message: string) => void
  warn?: (message: string) => void
}

export interface ShopifyWebhookResult {
  status: 200 | 401
  /** Tags actually purged; null when nothing was purged. */
  purgedTags: string[] | null
}

const PURGE_TOPICS = new Set(['products/update', 'products/delete'])

/**
 * Handle a Shopify webhook delivery.
 *
 * - Invalid/missing HMAC or missing secret → 401, no purge (fail closed).
 * - products/update | products/delete with a usable handle →
 *   purge ['product-<handle>', 'products', 'home']. The broad 'products' tag
 *   also covers handle renames and deletes (KTD9). Collection tags are
 *   deliberately NOT purged — collection freshness is timer-bounded (KTD2).
 * - Valid HMAC but malformed JSON or no usable handle → 200 + warn, purge
 *   ['products', 'home'] only (the update is real, so listing surfaces still
 *   refresh; 5xx would trigger Shopify retry storms).
 * - Unknown topic → 200 acknowledgment, no purge.
 * - invalidate throwing (e.g. outside Vercel) → 200; SWR TTL is the backstop.
 */
export async function handleShopifyWebhook(
  input: ShopifyWebhookInput,
  deps: ShopifyWebhookDeps,
): Promise<ShopifyWebhookResult> {
  const log = deps.log ?? ((message: string) => console.log(message))
  const warn = deps.warn ?? ((message: string) => console.warn(message))
  const context = `webhookId=${input.webhookId ?? '<missing>'} topic=${input.topic ?? '<missing>'}`

  // Log every delivery for replay/dedup forensics.
  log(`[shopify-webhook] received ${context}`)

  if (!deps.secret) {
    warn(
      `[shopify-webhook] SHOPIFY_WEBHOOK_SECRET is not set — rejecting delivery (fail closed). ${context}`,
    )
    return { status: 401, purgedTags: null }
  }

  if (!verifyWebhookHmac(input.rawBody, input.hmacHeader, deps.secret)) {
    warn(`[shopify-webhook] HMAC verification failed — rejecting delivery. ${context}`)
    return { status: 401, purgedTags: null }
  }

  if (input.topic === null || !PURGE_TOPICS.has(input.topic)) {
    log(`[shopify-webhook] unknown topic — acknowledged without purge. ${context}`)
    return { status: 200, purgedTags: null }
  }

  let handle: string | null = null
  try {
    const payload = JSON.parse(input.rawBody) as { handle?: unknown } | null
    const candidate = payload?.handle
    if (typeof candidate === 'string' && isValidHandle(candidate)) {
      handle = candidate
    } else {
      warn(
        `[shopify-webhook] payload has no usable handle — purging listing tags only. ${context}`,
      )
    }
  } catch {
    warn(
      `[shopify-webhook] malformed JSON payload behind valid HMAC — purging listing tags only. ${context}`,
    )
  }

  const tags =
    handle !== null ? [`product-${handle}`, 'products', 'home'] : ['products', 'home']

  try {
    await deps.invalidate(tags)
  } catch (error) {
    // Must not 5xx: Shopify would retry-storm. SWR TTL is the freshness backstop.
    warn(
      `[shopify-webhook] invalidateByTag failed (${error instanceof Error ? error.message : String(error)}). ${context}`,
    )
    return { status: 200, purgedTags: null }
  }

  log(`[shopify-webhook] purged tags [${tags.join(', ')}]. ${context}`)
  return { status: 200, purgedTags: tags }
}
