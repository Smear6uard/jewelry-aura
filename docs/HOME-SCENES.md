# The three velvet scenes — design record

Why the homepage's dark scenes look the way they do, what was considered
and rejected, and what the first build got wrong. Companion to
`docs/PALETTE-NOTES.md` (the colour system) and the CHOREOGRAPHY blocks
in `src/app.css` (the mechanics).

## The brief, in one line

Alternate paper and velvet all the way down the homepage: light sections
are where a visitor chooses something, full-bleed dark scenes are where
the workshop says something.

## What was fixed before anything was drawn

Two of the four axes a design normally spends were already settled, and
correctly:

- **Colour.** Eight tokens, non-negotiable, tested. There was no palette
  decision to make — only decisions about ratio and placement.
- **Type.** Fraunces for display, Manrope for body, mono for spec.

That leaves **scale** and **structure** as the places to spend anything.
The site had never set type above 48px. That is where the scenes went.

## The signature: the hallmark, enlarged

A hallmark is the stamp inside a clasp — `14K`, a maker's mark, four
characters you need a loupe to read. It is also the only mark on a piece
of jewelry that is a promise rather than a decoration. Every one of the
three scenes is that stamp at a different magnification:

| Scene              | The stamp at…      | Form                                        |
| ------------------ | ------------------ | ------------------------------------------- |
| Featured exhibit   | wall scale         | `5.0MM / 14K / SOLID`, gold mono ~90px       |
| Commissioned work  | the size it is     | ONE OF ONE plate + one mono spec line        |
| The bench          | applied to the shop| four promises as one mono hairline-ruled line|

That is the whole connective idea, and it comes out of the subject rather
than out of a layout library. It is also why the exhibit carries **no
headline**: a display-serif title over a photograph would make it a
second hero, and the spec IS the type there.

## What was rejected

- **Numbered markers (01 / 02 / 03) on the commission beats.** Five
  commissions are not a sequence — nothing about Kemo follows from
  Twenty-Three — so the list is a `<ul>` and the beats carry no numbers.
  The `/custom` process steps keep theirs, because a quote genuinely
  precedes a build.
- **A maroon ONE OF ONE stamp on velvet**, as the brief drew it. Maroon
  on velvet measures 1.4:1: the plate would be a dark rectangle a reader
  has to guess at. The stamp inverts to bone and keeps its maroon on
  `/custom`, on paper, at 11.8:1. See PALETTE-NOTES.
- **"Add to cart" on the exhibit.** The 5mm Cuban has five lengths and
  one of them is in stock, so a one-tap add picks a length for the
  shopper. The ghost reads "Choose a length" — the label always matches
  what pressing it does.
- **Icons on the bench line.** A truck glyph beside "insured shipping"
  adds nothing a shopper has not already read, and a row of pictograms
  is the most template-shaped object on the internet.
- **A velvet trust rail between the exhibit and the commissions.** Two
  full-bleed dark scenes with a third dark band between them is one long
  dark stretch, not a rhythm. The rail went paper and one line tall.

## Layout

    FEATURED EXHIBIT (lg: 220svh stage, 100svh pin)
    ┌──────────────────────── velvet ───────┐
    │  5.0MM                                │  specs left, over the
    │  ────────────  ← gold hairline        │  dark quarter of the frame
    │  14K                                  │
    │  ────────────                         │
    │  SOLID                  ┌───────────┐ │  note bottom-right,
    │                         │ bench note│ │  the piece between them
    │                         │ $199      │ │
    │                         │ [ ghost ] │ │
    └───────────────────────────────────────┘

    COMMISSIONED WORK (lg: 500svh stage, five beats in one pin)
    ┌───────────────────────────────────────┐
    │              Twenty-Three ┌─────────┐ │  name right-aligned,
    │      ONE OF ONE · spec    │  piece  │ │  overhanging the picture
    │                           │         │ │  by a fixed 4rem
    │                           └─────────┘ │
    └───────────────────────────────────────┘

    THE BENCH (60svh)
    ┌──────── photograph, full bleed ───────┐
    │                                       │
    │ insured │ warranty │ returns │ hand-set│  one mono line, bone,
    └───────────────────────────────────────┘  gold hairlines between

The name is **right-aligned** so every beat overhangs the picture by the
same measured distance. Left-aligned, the overlap is whatever the name
happens to measure, which is not a decision — "HRG" would clear the
photograph entirely and "Twenty-Three" would run across the piece.

## What the first build got wrong

Four defects the screenshots caught that reading the code did not:

1. **A seam across every arriving photograph.** The sheet translated
   100% down and the picture counter-moved 32% up, netting +68% — so a
   third of the next beat's picture sat in frame before its turn. Fix:
   the sheet clips as well as the window. Applies to `Unmask` too.
2. **Two poster names crossing.** The outgoing beat held at full opacity
   while the incoming one arrived, so "Twenty-Three" and "Kemo" overlapped
   for a whole beat window. Fix: the frame fades out during the next
   beat's arrival, and faster than that arrival takes.
3. **A velvet strip under the exhibit's photograph.** The last act drifts
   the picture up 4vh; a layer exactly one screen tall pulls its own
   bottom edge into view. Fix: the photo layer bleeds 6svh past the frame.
4. **Reduced motion left four beats invisible.** The start states are
   written `.commission-beat:not(:first-child) .commission-sheet`, and
   the reduce block reset a bare `.commission-sheet` — which loses on
   specificity however far down the file it sits. Fix: repeat the exact
   selectors. This one is worth remembering; it is silent, and it only
   affects visitors who never see the animation anyway.

## Next pass

- `bench-band.*` is a wide crop of the campaign frame. A real photograph
  of the bench — hands, tools, a piece mid-set — is the obvious upgrade,
  and it is a drop-in: replace the avif/webp/jpg set.
- The five commission photographs are one series shot the same way. A
  sixth commission means matching that setup (gloved hand, green velvet,
  raking light) or the sequence stops reading as a series.
