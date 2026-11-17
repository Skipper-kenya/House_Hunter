import { Award, Briefcase, Languages, MapPin, Phone, Search, ShieldCheck, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ListingCard } from '@/components/listing/ListingCard'
import { AGENTS, agentListings, getAgent } from '@/lib/data'
import { formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/controls'
import { Input } from '@/components/ui/input'
import { Avatar, Badge, Card, EmptyState, Stat } from '@/components/ui/primitives'

const ALL_AREAS = Array.from(new Set(AGENTS.flatMap((a) => a.areas))).sort()

function Rating({ value, reviews }: { value: number; reviews: number }) {
  return (
    <span className="text-muted flex items-center gap-1.5 text-xs">
      <span className="flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={
              i < Math.round(value) ? 'size-3.5 fill-amber-400 text-amber-400' : 'size-3.5 opacity-30'
            }
          />
        ))}
      </span>
      <span className="text-default font-bold">{value.toFixed(1)}</span>
      <span>({formatNumber(reviews)})</span>
    </span>
  )
}

export function Agents() {
  const [q, setQ] = useState('')
  const [area, setArea] = useState<string | null>(null)

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return AGENTS.filter((a) => {
      if (area && !a.areas.includes(area)) return false
      if (!needle) return true
      return (
        a.name.toLowerCase().includes(needle) ||
        a.agency.toLowerCase().includes(needle) ||
        a.areas.some((x) => x.toLowerCase().includes(needle))
      )
    }).sort((x, y) => y.rating - x.rating || y.deals - x.deals)
  }, [q, area])

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-default text-3xl font-semibold tracking-tight sm:text-4xl">
          Agents who know the street
        </h1>
        <p className="text-muted mt-3 text-pretty">
          Every agent here is licence-verified and rated only by people who actually transacted
          with them.
        </p>
      </header>

      <div className="mb-8 space-y-4">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, agency or area"
          icon={<Search />}
          className="max-w-md"
          aria-label="Search agents"
        />
        <div className="flex flex-wrap gap-2">
          <Chip active={area === null} onClick={() => setArea(null)}>
            All areas
          </Chip>
          {ALL_AREAS.map((a) => (
            <Chip key={a} active={area === a} onClick={() => setArea(area === a ? null : a)}>
              {a}
            </Chip>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No agents match"
          description="Try a different area or clear the search."
          action={
            <Button
              onClick={() => {
                setQ('')
                setArea(null)
              }}
            >
              Reset
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((a) => (
            <Card key={a.id} className="flex flex-col p-5 transition-all hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-start gap-3">
                <Avatar name={a.name} src={a.avatar} className="size-14" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-default flex items-center gap-1.5 text-base font-bold">
                    <Link to={`/agents/${a.id}`} className="hover:text-brand truncate">
                      {a.name}
                    </Link>
                    {a.verified && <ShieldCheck className="text-brand size-4 shrink-0" />}
                  </h2>
                  <p className="text-muted truncate text-xs">{a.title}</p>
                  <p className="text-muted truncate text-xs">{a.agency}</p>
                </div>
              </div>

              <div className="mt-3">
                <Rating value={a.rating} reviews={a.reviews} />
              </div>

              <p className="text-muted mt-3 line-clamp-3 flex-1 text-sm text-pretty">{a.bio}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.areas.map((x) => (
                  <Badge key={x} variant="neutral">
                    {x}
                  </Badge>
                ))}
              </div>

              <div className="border-default text-muted mt-4 grid grid-cols-2 gap-2 border-t pt-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="size-3.5" /> {a.deals} deals
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="size-3.5" /> {a.years} yrs
                </span>
              </div>

              <Button asChild size="sm" className="mt-4">
                <Link to={`/agents/${a.id}`}>View profile</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function AgentDetail() {
  const { id = '' } = useParams()
  const agent = getAgent(id)

  if (!agent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          title="Agent not found"
          action={
            <Button asChild>
              <Link to="/agents">All agents</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const listings = agentListings(agent.id)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <Card className="overflow-hidden">
        <div className="bg-forest-900 relative h-32">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(60%_120%_at_20%_0%,oklch(0.5_0.1_165/0.6),transparent)]"
          />
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end gap-5">
            <Avatar
              name={agent.name}
              src={agent.avatar}
              className="size-24 ring-4 ring-[var(--surface)]"
            />
            <div className="flex-1 pb-1">
              <h1 className="font-display text-default flex items-center gap-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {agent.name}
                {agent.verified && <ShieldCheck className="text-brand size-5" />}
              </h1>
              <p className="text-muted mt-1 text-sm">
                {agent.title} · {agent.agency}
              </p>
            </div>
            <div className="flex gap-2 pb-1">
              <Button asChild variant="outline">
                <a href={`tel:${agent.phone.replace(/\s/g, '')}`}>
                  <Phone /> {agent.phone}
                </a>
              </Button>
              <Button asChild>
                <a href={`mailto:${agent.email}`}>Email {agent.name.split(' ')[0]}</a>
              </Button>
            </div>
          </div>

          <p className="text-muted mt-6 max-w-3xl text-pretty">{agent.bio}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Rating"
              value={`${agent.rating} ★`}
              hint={`${formatNumber(agent.reviews)} verified reviews`}
            />
            <Stat label="Deals closed" value={formatNumber(agent.deals)} hint="Lifetime" />
            <Stat label="Experience" value={`${agent.years} years`} />
            <Stat label="Live listings" value={listings.length} />
          </div>

          <div className="border-default mt-6 grid gap-6 border-t pt-6 sm:grid-cols-2">
            <div>
              <h2 className="text-default mb-3 flex items-center gap-2 text-sm font-bold">
                <MapPin className="size-4" /> Areas covered
              </h2>
              <div className="flex flex-wrap gap-2">
                {agent.areas.map((a) => (
                  <Link key={a} to={`/search?q=${encodeURIComponent(a)}`}>
                    <Badge variant="brand" size="md">
                      {a}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-default mb-3 flex items-center gap-2 text-sm font-bold">
                <Languages className="size-4" /> Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {agent.languages.map((l) => (
                  <Badge key={l} variant="neutral" size="md">
                    {l}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <section className="mt-12">
        <h2 className="font-display text-default text-2xl font-semibold tracking-tight">
          {agent.name.split(' ')[0]}&rsquo;s listings
        </h2>
        {listings.length === 0 ? (
          <p className="text-muted mt-3">No live listings right now.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} compact />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
