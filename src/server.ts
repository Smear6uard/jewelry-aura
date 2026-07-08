/**
 * Custom server entry — buffered (non-streaming) SSR (plan KTD12).
 *
 * Vercel's CDN may not cache streamed responses, and every catalog page on
 * this site relies on CDN caching with stale-while-revalidate. Rendering
 * with `defaultRenderHandler` (render-to-string, single response body)
 * instead of the default `defaultStreamHandler` keeps catalog HTML
 * CDN-cacheable. Pages here are small; losing progressive streaming costs
 * nothing perceptible.
 */

import {
  createStartHandler,
  defaultRenderHandler,
} from '@tanstack/react-start/server'
import type { Register } from '@tanstack/react-router'
import type { RequestHandler } from '@tanstack/react-start/server'

const fetch = createStartHandler(defaultRenderHandler)

export type ServerEntry = { fetch: RequestHandler<Register> }

export default {
  fetch,
} satisfies ServerEntry
