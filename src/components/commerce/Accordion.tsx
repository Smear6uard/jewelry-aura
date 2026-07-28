/**
 * components/commerce/Accordion.tsx — the PDP's detail sections.
 *
 * Built on <details>/<summary>. The browser handles open/close state,
 * keyboard operation and — importantly for a product page — in-page
 * find: Chrome and Safari expand a closed <details> when the text
 * inside it matches a Ctrl-F search. A JavaScript accordion silently
 * hides that content from the browser's own search.
 *
 * The first section opens by default; it holds the product description,
 * which is the one thing a shopper reads before deciding.
 */

interface AccordionItem {
  title: string
  /** Paragraphs. */
  body: string[]
  list?: string[]
}

interface AccordionProps {
  items: ReadonlyArray<AccordionItem>
}

export function Accordion({ items }: AccordionProps) {
  return (
    <div className="border-t border-hairline">
      {items.map((item, index) => (
        <details
          key={item.title}
          open={index === 0}
          className="group border-b border-hairline"
        >
          {/* 52px row: a summary is a tap target on a phone. */}
          <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 text-[12px] label text-ink marker:content-none [&::-webkit-details-marker]:hidden">
            {item.title}
            <span
              aria-hidden
              className="relative h-3 w-3 shrink-0 text-ink-muted"
            >
              <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
              <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-hover ease-apple group-open:scale-y-0 motion-reduce:transition-none" />
            </span>
          </summary>

          <div className="pb-5">
            {item.body.map((paragraph) => (
              <p
                key={paragraph}
                className="mb-2.5 max-w-[62ch] text-[15px] leading-relaxed text-ink-muted last:mb-0"
              >
                {paragraph}
              </p>
            ))}
            {item.list && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {item.list.map((entry) => (
                  <li
                    key={entry}
                    className="flex gap-2.5 text-[15px] leading-relaxed text-ink-muted"
                  >
                    <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-brand" />
                    {entry}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      ))}
    </div>
  )
}
