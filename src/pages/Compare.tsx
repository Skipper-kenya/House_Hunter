import { Check, Minus, Scale, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getAgent, getListing } from '@/lib/data'
import { useStore } from '@/lib/store'
import type { Listing } from '@/lib/types'
import { cn, formatArea, formatNumber, formatPrice, formatPriceLabel, timeAgo } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge, EmptyState } from '@/components/ui/primitives'
import { SmartImage } from '@/components/ui/smart-image'

type Row = {
  label: string
  get: (l: Listing) => string | number | boolean
  /** How to mark the winner: higher is better, lower is better, or neither. */
  best?: 'high' | 'low'
  format?: (v: number) => string
  formatFor?: (l: Listing, v: number) => string
  /** Money rows are only comparable when every home is the same kind of deal. */
  moneyRow?: boolean
}

const ROWS: Row[] = [
  {
    label: 'Price',
    get: (l) => l.price,
    best: 'low',
    moneyRow: true,
    formatFor: (l, v) => formatPriceLabel(v, l.deal),
  },
  {
    label: 'Price per m²',
    get: (l) => (l.area ? Math.round(l.price / l.area) : 0),
    best: 'low',
    moneyRow: true,
    formatFor: (l, v) =>
      v ? `${formatPrice(v, { compact: false })}${l.deal === 'rent' ? '/mo' : ''}` : '—',
  },
  { label: 'Bedrooms', get: (l) => l.beds, best: 'high' },
  { label: 'Bathrooms', get: (l) => l.baths, best: 'high' },
  { label: 'Internal area', get: (l) => l.area, best: 'high', format: (v) => (v ? formatArea(v) : '—') },
  { label: 'Plot', get: (l) => l.plot ?? 0, best: 'high', format: (v) => (v ? `${v} acres` : '—') },
  { label: 'Parking', get: (l) => l.parking, best: 'high' },
  { label: 'Year built', get: (l) => l.yearBuilt, best: 'high', format: (v) => (v ? String(v) : '—') },
  { label: 'Service charge', get: (l) => l.serviceCharge ?? 0, best: 'low', format: (v) => (v ? `${formatPrice(v)}/mo` : 'None') },
  { label: 'Match score', get: (l) => l.score, best: 'high' },
  { label: 'Furnished', get: (l) => l.furnished },
  { label: 'Pet friendly', get: (l) => l.petFriendly },
  { label: '3D tour', get: (l) => l.tour3d },
  { label: 'Views', get: (l) => l.views, best: 'high', format: (v) => formatNumber(v) },
]

const AMENITY_ROWS = [
  'Swimming pool',
  'Gym',
  'Lift',
  '24/7 security',
  'Backup power',
  'Borehole',
  'Garden',
  'Clubhouse',
]

function Cell({ value, winner }: { value: string | number | boolean; winner?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="text-brand mx-auto size-4" strokeWidth={3} />
    ) : (
      <Minus className="text-muted mx-auto size-4 opacity-50" />
    )
  }
  return (
    <span
      className={cn(
        'text-sm tabular-nums',
        winner ? 'text-brand font-bold' : 'text-default font-semibold',
      )}
    >
      {value}
    </span>
  )
}

export function Compare() {
  const { compare, toggleCompare, clearCompare } = useStore()
  const listings = compare.map(getListing).filter(Boolean) as Listing[]

  if (listings.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          icon={<Scale />}
          title="Nothing to compare yet"
          description="Add two or more homes from any listing card and they'll line up side by side here."
          action={
            <Button asChild>
              <Link to="/search">Find homes to compare</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const mixedDeals = new Set(listings.map((l) => l.deal)).size > 1
  const LABEL_COL = 11
  const DATA_COL = 15
  const cols = `${LABEL_COL}rem repeat(${listings.length}, minmax(${DATA_COL}rem, 1fr))`
  // Below this the table scrolls horizontally rather than crushing the columns.
  const minWidth = `${LABEL_COL + listings.length * DATA_COL}rem`

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-default text-3xl font-semibold tracking-tight sm:text-4xl">
            Side by side
          </h1>
          <p className="text-muted mt-2">
            Comparing {listings.length} {listings.length === 1 ? 'home' : 'homes'}. The best figure
            in each row is highlighted.
            {mixedDeals && ' Price rows aren’t ranked — this tray mixes sales and rentals.'}
          </p>
        </div>
        <Button variant="outline" onClick={clearCompare}>
          Clear all
        </Button>
      </header>

      <div className="border-default overflow-x-auto rounded-xl border">
        <div style={{ minWidth }}>
          {/* header row */}
          <div
            className="bg-surface border-default grid gap-px border-b"
            style={{ gridTemplateColumns: cols }}
          >
            <div className="bg-surface p-4" />
            {listings.map((l) => (
              <div key={l.id} className="bg-surface relative p-4">
                <button
                  type="button"
                  onClick={() => toggleCompare(l.id)}
                  aria-label={`Remove ${l.title}`}
                  className="text-muted hover:bg-surface-2 hover:text-default absolute top-2 right-2 z-10 rounded p-1.5 transition-colors"
                >
                  <X className="size-3.5" />
                </button>
                <Link to={`/listing/${l.id}`} className="group block">
                  <SmartImage
                    src={l.images[0]}
                    alt={l.title}
                    wrapperClassName="aspect-16/10 rounded-lg"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <h2 className="text-default group-hover:text-brand mt-3 line-clamp-2 text-sm font-bold">
                    {l.title}
                  </h2>
                </Link>
                <p className="text-muted mt-1 truncate text-xs">
                  {l.neighborhood} · {timeAgo(l.listedAt)}
                </p>
                <Badge variant={l.deal === 'rent' ? 'accent' : 'brand'} className="mt-2">
                  {l.deal === 'rent' ? 'To let' : 'For sale'}
                </Badge>
              </div>
            ))}
          </div>

          {/* spec rows */}
          {ROWS.map((row, ri) => {
            const values = listings.map(row.get)
            const numeric = values.filter((v) => typeof v === 'number') as number[]
            // A monthly rent and a purchase price are not the same quantity, so
            // a mixed tray gets no "best price" crown.
            const comparable = !(row.moneyRow && mixedDeals)
            const bestValue =
              row.best && comparable && numeric.length
                ? row.best === 'high'
                  ? Math.max(...numeric)
                  : Math.min(...numeric.filter((n) => n > 0))
                : undefined

            return (
              <div
                key={row.label}
                className={cn(
                  'grid items-center gap-px',
                  ri % 2 === 0 ? 'bg-surface' : 'bg-surface-2',
                )}
                style={{ gridTemplateColumns: cols }}
              >
                <div className="text-muted p-3.5 text-sm font-semibold">{row.label}</div>
                {listings.map((l, i) => {
                  const raw = values[i]
                  const display =
                    typeof raw === 'number'
                      ? row.formatFor
                        ? row.formatFor(l, raw)
                        : row.format
                          ? row.format(raw)
                          : raw || '—'
                      : raw
                  const winner =
                    bestValue !== undefined &&
                    typeof raw === 'number' &&
                    raw === bestValue &&
                    listings.length > 1 &&
                    numeric.filter((n) => n === bestValue).length < listings.length
                  return (
                    <div key={l.id} className="p-3.5 text-center">
                      <Cell value={display} winner={winner} />
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* amenities */}
          <div
            className="bg-surface border-default grid gap-px border-t"
            style={{ gridTemplateColumns: cols }}
          >
            <div className="text-default p-3.5 text-sm font-bold">Amenities</div>
            {listings.map((l) => (
              <div key={l.id} />
            ))}
          </div>
          {AMENITY_ROWS.map((a, ri) => (
            <div
              key={a}
              className={cn('grid items-center gap-px', ri % 2 === 0 ? 'bg-surface-2' : 'bg-surface')}
              style={{ gridTemplateColumns: cols }}
            >
              <div className="text-muted p-3.5 text-sm font-semibold">{a}</div>
              {listings.map((l) => (
                <div key={l.id} className="p-3.5 text-center">
                  <Cell value={l.amenities.includes(a)} />
                </div>
              ))}
            </div>
          ))}

          {/* agent + CTA */}
          <div
            className="bg-surface border-default grid items-center gap-px border-t"
            style={{ gridTemplateColumns: cols }}
          >
            <div className="text-muted p-3.5 text-sm font-semibold">Agent</div>
            {listings.map((l) => (
              <div key={l.id} className="p-3.5 text-center">
                <span className="text-default text-sm font-semibold">
                  {getAgent(l.agentId)?.name ?? '—'}
                </span>
              </div>
            ))}
          </div>

          <div
            className="bg-surface border-default grid gap-px border-t"
            style={{ gridTemplateColumns: cols }}
          >
            <div />
            {listings.map((l) => (
              <div key={l.id} className="p-3.5">
                <Button asChild size="sm" className="w-full">
                  <Link to={`/listing/${l.id}`}>View listing</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
