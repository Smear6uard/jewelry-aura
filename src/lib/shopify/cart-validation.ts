// Pure cart input types + validators. This module is client-safe: it is
// imported by the RPC layer (cart-fns.ts), which client components load,
// so it must never import server-only modules.

export interface AddToCartInput {
  merchandiseId: string
  quantity: number
}

export interface UpdateCartLineInput {
  lineId: string
  /** New quantity; 0 removes the line. */
  quantity: number
}

export interface RemoveCartLineInput {
  lineId: string
}

function asRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Cart input must be an object')
  }
  return input as Record<string, unknown>
}

function assertId(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${name} must be a non-empty string`)
  }
  return value
}

function assertQuantity(value: unknown, minimum: 0 | 1): number {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < minimum
  ) {
    throw new Error(`quantity must be an integer >= ${minimum}`)
  }
  return value
}

export function validateAddToCartInput(input: AddToCartInput): AddToCartInput {
  const raw = asRecord(input)
  return {
    merchandiseId: assertId(raw.merchandiseId, 'merchandiseId'),
    quantity: assertQuantity(raw.quantity, 1),
  }
}

export function validateUpdateCartLineInput(
  input: UpdateCartLineInput,
): UpdateCartLineInput {
  const raw = asRecord(input)
  return {
    lineId: assertId(raw.lineId, 'lineId'),
    quantity: assertQuantity(raw.quantity, 0),
  }
}

export function validateRemoveCartLineInput(
  input: RemoveCartLineInput,
): RemoveCartLineInput {
  const raw = asRecord(input)
  return { lineId: assertId(raw.lineId, 'lineId') }
}
