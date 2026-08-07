/**
 * lib/commissions.ts — the finished commissions, written down once.
 *
 * Five real pieces off this bench, photographed in the same series: the
 * piece held in a gloved hand against green velvet. They are the only
 * photography the workshop owns that is neither a catalog cut-out nor the
 * campaign frame, which is why they carry three surfaces between them —
 * the homepage sequence, the /custom portfolio grid, and the featured
 * card in each mega-menu panel.
 *
 * They lived as a private array inside CommissionGrid until the homepage
 * needed the same five in the same order. Two copies of a name and a
 * specification is how "Queen" becomes "Queen " on one page and not the
 * other.
 *
 * `spec` is the hallmark line: the metal, then the work. It is set in the
 * mono face on velvet and reads as what it is — the note a jeweller
 * writes on the job envelope, not a caption.
 */

export interface Commission {
  /** The name the customer gave the piece. */
  name: string
  /** One mono line: metal · construction. */
  spec: string
  /** Base path with no extension — avif, webp and jpg all exist. */
  image: string
  width: number
  height: number
  alt: string
  /** object-position for a crop that is not centred. */
  focus: string
}

export const COMMISSIONS: Commission[] = [
  {
    name: 'Twenty-Three',
    spec: 'White gold · Praying-hands plate',
    image: '/JA-image1',
    width: 1122,
    height: 1402,
    alt: 'Custom 23 plate pendant with praying-hands cap, set in white gold and baguette diamonds.',
    focus: '52% 50%',
  },
  {
    name: 'Kemo',
    spec: 'White gold · Custom monogram',
    image: '/JA-image2',
    width: 1122,
    height: 1402,
    alt: 'Custom KEMO monogram pendant in white gold, fully iced with round and baguette stones.',
    focus: '52% 50%',
  },
  {
    name: 'Queen',
    spec: 'Yellow gold · Heart drop · Two-tone',
    image: '/JA-image3',
    width: 1122,
    height: 1402,
    alt: 'Custom Queen script pendant with heart drop, in yellow gold and pavé diamonds.',
    focus: '50% 50%',
  },
  {
    name: 'ATDB',
    spec: 'Two-tone · Hand-engraved plate',
    image: '/JA-image4',
    width: 1122,
    height: 1402,
    alt: 'Custom ATDB block pendant in two-tone gold with engraved tagline and hand-set diamonds.',
    focus: '52% 50%',
  },
  {
    name: 'HRG',
    spec: 'White gold · Diamond globe bail',
    image: '/JA-image5',
    width: 1086,
    height: 1448,
    alt: 'Custom HRG plate pendant reading “Hustle Russell The God”, fully set in white gold with a diamond globe bail.',
    focus: '48% 45%',
  },
]
