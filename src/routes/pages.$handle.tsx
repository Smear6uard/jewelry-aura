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
      <h1 className="font-display text-[28px] tracking-tight text-cream md:text-[38px]">
        That page doesn’t exist
      </h1>
      <p className="mt-3 max-w-[52ch] text-[14px] text-cream-muted">
        The links below cover most of what people come here looking for.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {FOOTER_SUPPORT_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-flex border border-hairline px-4 py-2.5 text-[12px] text-cream-muted transition-colors duration-hover ease-apple hover:border-cream-subtle hover:text-cream"
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
          <h1 className="font-display text-[30px] leading-tight tracking-tight text-cream md:text-[40px]">
            {page.title}
          </h1>
          <p className="mt-3 max-w-[44ch] text-[14px] leading-relaxed text-cream-muted">
            {page.summary}
          </p>

          <div className="mt-6 border-t border-hairline pt-5">
            <p className="text-[11px] label-wide text-cream-subtle">
              Still stuck?
            </p>
            <a
              href={STORE.phoneHref}
              className="mt-2 inline-block text-[15px] text-cream transition-colors duration-hover ease-apple hover:text-champagne"
            >
              {STORE.phone}
            </a>
            <p className="mt-1 text-[12px] text-cream-subtle">
              {STORE.hours[0].days} · {STORE.hours[0].time}
            </p>
          </div>
        </header>

        <div className="md:col-span-7 md:col-start-6">
          {page.blocks.map((block, index) => (
            <section
              key={index}
              className="border-t border-hairline py-6 first:border-t-0 first:pt-0"
            >
              {block.heading && (
                <h2 className="text-[16px] font-medium text-cream">
                  {block.heading}
                </h2>
              )}
              {block.body?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-cream-muted first:mt-2"
                >
                  {paragraph}
                </p>
              ))}
              {block.list && (
                <ul className="mt-4 flex flex-col gap-2">
                  {block.list.map((entry) => (
                    <li
                      key={entry}
                      className="flex gap-3 text-[15px] leading-relaxed text-cream-muted"
                    >
                      <span
                        aria-hidden
                        className="mt-3 h-px w-3.5 shrink-0 bg-champagne"
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
