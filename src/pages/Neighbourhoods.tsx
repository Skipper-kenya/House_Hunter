import { ArrowRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { NEIGHBORHOODS } from '@/lib/data'
import type { Neighborhood } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Chip, Select } from '@/components/ui/controls'
import { Input } from '@/components/ui/input'
import { Badge, Card, EmptyState, Progress } from '@/components/ui/primitives'
import { SmartImage } from '@/components/ui/smart-image'

const SCORE_LABELS: { key: keyof Neighborhood['scores']; label: string }[] = [
  { key: 'commute', label: 'Commute' },
  { key: 'safety', label: 'Safety' },
  { key: 'schools', label: 'Schools' },
  { key: 'nightlife', label: 'Nightlife' },
  { key: 'greenery', label: 'Green space' },
]

type SortKey = 'listings' | 'buy-asc' | 'buy-desc' | 'rent-asc' | 'name'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'listings', label: 'Most listings' },
  { value: 'buy-asc', label: 'Cheapest to buy' },
  { value: 'buy-desc', label: 'Most expensive' },
  { value: 'rent-asc', label: 'Cheapest to rent' },
  { value: 'name', label: 'A–Z' },
]

const CITIES = Array.from(new Set(NEIGHBORHOODS.map((n) => n.city))).sort()

export function Neighbourhoods() {
  const [q, setQ] = useState('')
  const [city, setCity] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('listings')

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = NEIGHBORHOODS.filter((n) => {
      if (city && n.city !== city) return false
      if (!needle) return true
      return (
        n.name.toLowerCase().includes(needle) ||
        n.city.toLowerCase().includes(needle) ||
        n.vibe.some((v) => v.toLowerCase().includes(needle))
      )
    })
    const sorters: Record<SortKey, (a: Neighborhood, b: Neighborhood) => number> = {
      listings: (a, b) => b.listings - a.listings,
      'buy-asc': (a, b) => a.medianBuy - b.medianBuy,
      'buy-desc': (a, b) => b.medianBuy - a.medianBuy,
      'rent-asc': (a, b) => a.medianRent - b.medianRent,
      name: (a, b) => a.name.localeCompare(b.name),
    }
    return [...list].sort(sorters[sort])
  }, [q, city, sort])

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-default text-3xl font-semibold tracking-tight sm:text-4xl">
          Neighbourhood guides
        </h1>
        <p className="text-muted mt-3 text-pretty">
          What each area costs, how long the commute really is, and what it&rsquo;s like to live
          there once the viewing is over.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search areas"
          icon={<Search />}
          className="max-w-xs"
          aria-label="Search neighbourhoods"
        />
        <Chip active={city === null} onClick={() => setCity(null)}>
          All counties
        </Chip>
        {CITIES.map((c) => (
          <Chip key={c} active={city === c} onClick={() => setCity(city === c ? null : c)}>
            {c}
          </Chip>
        ))}
        <Select
          value={sort}
          onChange={setSort}
          options={SORTS}
          className="ml-auto w-48"
          ariaLabel="Sort neighbourhoods"
        />
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No areas match"
          action={
            <Button
              onClick={() => {
                setQ('')
                setCity(null)
              }}
            >
              Reset
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {results.map((n) => (
            <Card key={n.id} className="flex flex-col overflow-hidden">
              <Link to={`/search?q=${encodeURIComponent(n.name)}`} className="group relative block">
                <SmartImage
                  src={n.image}
                  alt={n.name}
                  wrapperClassName="aspect-16/9"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-white">{n.name}</h2>
                    <p className="text-xs font-medium text-white/80">{n.city} County</p>
                  </div>
                  <span className="glass text-default rounded-full px-2.5 py-1 text-xs font-bold">
                    {n.listings} homes
                  </span>
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap gap-1.5">
                  {n.vibe.map((v) => (
                    <Badge key={v} variant="neutral">
                      {v}
                    </Badge>
                  ))}
                </div>

                <p className="text-muted mt-3 text-sm text-pretty">{n.blurb}</p>

                <dl className="border-default mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <dt className="text-muted text-[11px] font-bold tracking-wide uppercase">
                      Median to buy
                    </dt>
                    <dd className="text-default mt-0.5 text-base font-bold tabular-nums">
                      {formatPrice(n.medianBuy)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted text-[11px] font-bold tracking-wide uppercase">
                      Median rent
                    </dt>
                    <dd className="text-default mt-0.5 text-base font-bold tabular-nums">
                      {formatPrice(n.medianRent)}
                      <span className="text-muted text-xs font-medium">/mo</span>
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 space-y-2.5">
                  {SCORE_LABELS.map((s) => (
                    <div key={s.key}>
                      <div className="mb-1 flex items-baseline justify-between text-xs">
                        <span className="text-muted font-medium">{s.label}</span>
                        <span className="text-default font-bold tabular-nums">
                          {n.scores[s.key]}
                        </span>
                      </div>
                      <Progress value={n.scores[s.key]} />
                    </div>
                  ))}
                </div>

                <Button asChild variant="outline" size="sm" className="mt-5 w-full">
                  <Link to={`/search?q=${encodeURIComponent(n.name)}`}>
                    Browse {n.name} <ArrowRight />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
