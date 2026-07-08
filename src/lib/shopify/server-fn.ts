// Single chokepoint for TanStack Start server-function creation. The builder
// API has renamed steps before (`validator` -> `inputValidator`), so both the
// factory and the validator hookup live here: if the API shifts again, the
// fix is a one-line change in this file instead of a hunt across the codebase.

import { createServerFn } from '@tanstack/react-start'
import type { Method, Register, ServerFnBuilder } from '@tanstack/react-start'

/** Start a server function builder: `serverFn('POST').handler(...)`. */
export function serverFn<TMethod extends Method>(
  method: TMethod,
): ServerFnBuilder<Register, TMethod> {
  return createServerFn({ method })
}

/**
 * Attach an input validator to a builder produced by {@link serverFn}.
 * `validate` receives the raw over-the-wire payload at runtime (treat it as
 * untrusted), while its parameter type declares the caller-facing input type.
 */
export function withInput<TMethod extends Method, TInput, TOutput>(
  builder: ServerFnBuilder<Register, TMethod>,
  validate: (input: TInput) => TOutput,
) {
  // Instantiation expression pins the validator type so the returned builder
  // keeps precise `data` typing. The cast is needed because the library's
  // ConstrainValidator conditional type cannot reduce over the unresolved
  // generics of this wrapper; it is the one cast this chokepoint buys us.
  const inputValidator = builder.inputValidator<(input: TInput) => TOutput>
  return inputValidator(
    validate as unknown as Parameters<typeof inputValidator>[0],
  )
}
