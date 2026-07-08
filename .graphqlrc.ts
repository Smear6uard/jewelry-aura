import { ApiType, shopifyApiProject } from '@shopify/api-codegen-preset'

// R5 gate: `npm run codegen` validates every `#graphql` document under
// src/lib/shopify against the live 2026-07 Storefront schema and generates
// operation types into src/lib/shopify/generated.
export default {
  projects: {
    default: shopifyApiProject({
      apiType: ApiType.Storefront,
      apiVersion: '2026-07',
      documents: ['./src/lib/shopify/**/*.ts'],
      outputDir: './src/lib/shopify/generated',
    }),
  },
}
