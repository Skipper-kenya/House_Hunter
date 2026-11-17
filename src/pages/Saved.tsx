import { Bell, BellOff, Heart, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ListingCard } from '@/components/listing/ListingCard'
import { getListing } from '@/lib/data'
import { useStore } from '@/lib/store'
import { formatDate, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge, Card, EmptyState, Stat } from '@/components/ui/primitives'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/controls'
import { Tooltip } from '@/components/ui/overlay'

export function Saved() {
  const { saved, searches, removeSearch, toggleAlerts, recent } = useStore()

  const homes = saved.map(getListing).filter(Boolean) as NonNullable<ReturnType<typeof getListing>>[]
  const recentHomes = recent
    .map(getListing)
    .filter(Boolean)
    .filter((l) => !saved.includes(l!.id)) as NonNullable<ReturnType<typeof getListing>>[]

  const total = homes.reduce((sum, l) => sum + l.price, 0)
  const avg = homes.length ? Math.round(total / homes.length) : 0

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-default text-3xl font-semibold tracking-tight sm:text-4xl">
          Your shortlist
        </h1>
        <p className="text-muted mt-2">
          Everything you&rsquo;ve saved, plus the searches we&rsquo;re watching for you.
        </p>
      </header>

      <Tabs defaultValue="homes">
        <TabsList>
          <TabsTrigger value="homes">
            Saved homes
            {homes.length > 0 && (
              <Badge variant="brand" className="ml-2">
                {homes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="searches">
            Saved searches
            {searches.length > 0 && (
              <Badge variant="brand" className="ml-2">
                {searches.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recent">Recently viewed</TabsTrigger>
        </TabsList>

        {/* ---------------- saved homes ---------------- */}
        <TabsContent value="homes" className="pt-8 outline-none">
          {homes.length === 0 ? (
            <EmptyState
              icon={<Heart />}
              title="Nothing saved yet"
              description="Tap the heart on any listing and it'll wait for you here, across devices."
              action={
                <Button asChild>
                  <Link to="/search">Start browsing</Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <Stat label="Homes saved" value={homes.length} />
                <Stat label="Average price" value={formatPrice(avg)} />
                <Stat
                  label="Price range"
                  value={
                    homes.length
                      ? `${formatPrice(Math.min(...homes.map((h) => h.price)))} – ${formatPrice(
                          Math.max(...homes.map((h) => h.price)),
                        )}`
                      : '—'
                  }
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {homes.map((l, i) => (
                  <ListingCard key={l.id} listing={l} index={i} />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ---------------- saved searches ---------------- */}
        <TabsContent value="searches" className="pt-8 outline-none">
          {searches.length === 0 ? (
            <EmptyState
              icon={<Search />}
              title="No saved searches"
              description="Save a search from the results page and we'll email you when something new matches."
              action={
                <Button asChild>
                  <Link to="/search">Build a search</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {searches.map((s) => (
                <li key={s.id}>
                  <Card className="flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/search${s.query}`}
                        className="text-default hover:text-brand font-display text-base font-semibold"
                      >
                        {s.name}
                      </Link>
                      <p className="text-muted mt-0.5 text-xs">
                        Saved {formatDate(s.createdAt)}
                        {s.alerts ? ' · alerts on' : ' · alerts off'}
                      </p>
                    </div>

                    {s.newMatches > 0 && (
                      <Badge variant="solid" size="md">
                        {s.newMatches} new
                      </Badge>
                    )}

                    <div className="flex items-center gap-1">
                      <Tooltip content={s.alerts ? 'Turn alerts off' : 'Turn alerts on'}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => toggleAlerts(s.id)}
                          aria-label="Toggle alerts"
                        >
                          {s.alerts ? <Bell /> : <BellOff />}
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete search">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeSearch(s.id)}
                          aria-label="Delete search"
                        >
                          <Trash2 />
                        </Button>
                      </Tooltip>
                      <Button asChild size="sm" variant="outline" className="ml-2">
                        <Link to={`/search${s.query}`}>View</Link>
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* ---------------- recently viewed ---------------- */}
        <TabsContent value="recent" className="pt-8 outline-none">
          {recentHomes.length === 0 ? (
            <EmptyState
              title="No recent views"
              description="Listings you open will show up here so you can find your way back."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recentHomes.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} compact />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
