/**
 * routes/pages.$handle.tsx — static content pages.
 *
 * Shipping, returns, warranty, sizing, FAQ, about, orders and the three
 * service pages, all rendered from the typed content in
 * lib/pages-content.ts. A new page is one entry in that file.
 *
 * These are the pages the trust band and the footer link to. They are
 * cheap to build and they are load-bearing: a shopper who cannot find
 * the return policy assumes the worst one.
 */

import { createFileRoute, notFound } from '@tanstack/react-router'

import { Breadcrumbs } from '~/components/commerce/Breadcrumbs'
import { findPage, type ContentPage } from '~/lib/pages-content'
import { FOOTER_SUPPORT_LINKS, STORE } from '~/lib/catalog'
import {
  SITE_URL,
  breadcrumbJsonLd,
  jsonLdScript,
  pageMeta,
} from '~/lib/seo'

export const Route = createFileRoute('/pages/$handle')({
  loader: ({ params }) => {
    const page = findPage(params.handle)
    if (!page) throw notFound()
    return page
  },
  headers: () => ({
    // Policy copy changes rarely; a long shared TTL with SWR is right.
    'Cache-Control':
      'public, max-age=0, s-maxage=3600, stale-while-revalidate=604800',
  }),
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: 'Page not found | Jewelry Aura' }] }
    }
    const url = `${SITE_URL}/pages/${params.handle}`
    return {
      meta: pageMeta({
        title: `${loaderData.title} | Jewelry Aura`,
        description: loaderData.summary,
        url,
      }),
      links: [{ rel: 'canonical', href: url }],
      scripts: [
        {
          type: 'application/ld+json',
          children: jsonLdScript(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: loaderData.title, path: `/pages/${params.handle}` },
            ]),
          ),
        },
      ],
    }
  },
  component: StaticPage,
  notFoundComponent: () => (
    <main className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
      <h1 className="display text-[28px] text-ink md:text-[38px]">
        That page doesn’t exist
      </h1>
      <p className="mt-3 max-w-[52ch] text-[15px] text-ink">
        The links below cover most of what people come here looking for.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {FOOTER_SUPPORT_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-flex min-h-11 items-center bg-bone px-4 text-[13px] text-ink border border-hairline-light transition-colors duration-hover ease-apple motion-reduce:transition-none"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </main>
  ),
})

function StaticPage() {
  const page = Route.useLoaderData() as ContentPage

  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 md:px-8 md:pb-24 md:pt-8">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: page.title, path: `/pages/${page.handle}` },
        ]}
        className="mb-5"
      />

      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
        <header className="md:col-span-4">
          <h1 className="display text-[30px] leading-tight text-ink md:text-[40px]">
            {page.title}
          </h1>
          <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-ink">
            {page.summary}
          </p>

          <div className="mt-6 border-t border-hairline-light pt-5">
            <p className="text-[11px] label-wide text-ink">Still stuck?</p>
            <a
              href={STORE.phoneHref}
              className="mt-2 inline-flex min-h-11 items-center text-[16px] font-medium text-maroon transition-colors duration-hover ease-apple hover:text-ink motion-reduce:transition-none"
            >
              {STORE.phone}
            </a>
            <p className="text-[13px] text-ink">{STORE.replyWindow}</p>
          </div>
        </header>

        <div className="md:col-span-7 md:col-start-6">
          {page.blocks.map((block, index) => (
            <section
              key={index}
              className="border-t border-hairline-light py-6 first:border-t-0 first:pt-0"
            >
              {block.heading && (
                <h2 className="text-[17px] font-medium text-ink">
                  {block.heading}
                </h2>
              )}
              {block.body?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-ink first:mt-2"
                >
                  {paragraph}
                </p>
              ))}
              {block.list && (
                <ul className="mt-4 flex flex-col gap-2">
                  {block.list.map((entry) => (
                    <li
                      key={entry}
                      className="flex gap-3 text-[16px] leading-relaxed text-ink"
                    >
                      <span
                        aria-hidden
                        className="mt-3 h-px w-3.5 shrink-0 bg-maroon"
                      />
                      {entry}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
