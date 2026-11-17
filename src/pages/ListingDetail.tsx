import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building,
  CalendarCheck,
  Car,
  Check,
  Clock,
  Eye,
  GraduationCap,
  Heart,
  Hospital,
  Link2,
  MapPin,
  Maximize,
  MessageSquare,
  Phone,
  Scale,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  TramFront,
  Video,
} from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PriceHistoryChart } from '@/components/charts'
import { ListingCard } from '@/components/listing/ListingCard'
import { MapPane } from '@/components/listing/MapPane'
import { PropertyGallery } from '@/components/listing/PropertyGallery'
import { MortgageCalculator } from '@/components/tools/MortgageCalculator'
import { ScheduleTourDialog } from '@/components/tools/ScheduleTourDialog'
import { getAgent, getListing, similarListings } from '@/lib/data'
import { useStore } from '@/lib/store'
import type { Listing } from '@/lib/types'
import {
  cn,
  formatArea,
  formatDate,
  formatNumber,
  formatPrice,
  pluralize,
  timeAgo,
} from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, Badge, Card, EmptyState, Progress, Separator } from '@/components/ui/primitives'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/controls'
import { Tooltip } from '@/components/ui/overlay'

const NEARBY_ICON: Record<Listing['nearby'][number]['kind'], ReactNode> = {
  school: <GraduationCap />,
  hospital: <Hospital />,
  mall: <Building />,
  transport: <TramFront />,
  park: <Trees />,
}

function KeyFact({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <div className="bg-surface-2 flex items-center gap-3 rounded-lg p-3.5">
      <span className="text-brand [&_svg]:size-5">{icon}</span>
      <div className="min-w-0">
        <p className="text-default text-sm font-bold">{value}</p>
        <p className="text-muted text-xs">{label}</p>
      </div>
    </div>
  )
}

export function ListingDetail() {
  const { id = '' } = useParams()
  const listing = getListing(id)
  const { isSaved, toggleSaved, inCompare, toggleCompare, markViewed } = useStore()

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (listing) markViewed(listing.id)
  }, [listing, markViewed])

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          title="That listing has gone"
          description="It may have been let, sold, or taken down by the agent."
          action={
            <Button asChild>
              <Link to="/search">Back to search</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const agent = getAgent(listing.agentId)
  const similar = similarListings(listing)
  const saved = isSaved(listing.id)
  const comparing = inCompare(listing.id)

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Could not share this listing')
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-muted mb-4 flex items-center gap-2 text-sm">
        <Link
          to={`/search?deal=${listing.deal}`}
          className="hover:text-default inline-flex items-center gap-1.5 font-semibold transition-colors"
        >
          <ArrowLeft className="size-4" /> All {listing.deal === 'rent' ? 'rentals' : 'homes'}
        </Link>
        <span aria-hidden>·</span>
        <Link
          to={`/search?q=${encodeURIComponent(listing.neighborhood)}&deal=${listing.deal}`}
          className="hover:text-default transition-colors"
        >
          {listing.neighborhood}
        </Link>
      </nav>

      <PropertyGallery images={listing.images} title={listing.title} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        {/* ------------------------- main column ------------------------- */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                {listing.status === 'new' && <Badge variant="solid">New listing</Badge>}
                {listing.status === 'reduced' && <Badge variant="accent">Price reduced</Badge>}
                {listing.status === 'under-offer' && <Badge variant="warn">Under offer</Badge>}
                {listing.tour3d && (
                  <Badge variant="brand">
                    <Video /> 3D tour available
                  </Badge>
                )}
                <Badge variant="outline">
                  <Sparkles /> {listing.score} match
                </Badge>
              </div>

              <h1 className="font-display text-default text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {listing.title}
              </h1>
              <p className="text-muted mt-2 flex items-center gap-1.5 text-sm">
                <MapPin className="size-4" />
                {listing.address}, {listing.neighborhood}, {listing.city}
              </p>
            </div>

            <div className="flex gap-2">
              <Tooltip content={comparing ? 'In your compare tray' : 'Add to compare'}>
                <Button
                  variant={comparing ? 'soft' : 'outline'}
                  size="icon"
                  onClick={() => toggleCompare(listing.id)}
                  aria-pressed={comparing}
                  aria-label="Compare"
                >
                  <Scale />
                </Button>
              </Tooltip>
              <Tooltip content="Share">
                <Button variant="outline" size="icon" onClick={share} aria-label="Share listing">
                  <Share2 />
                </Button>
              </Tooltip>
              <Button
                variant={saved ? 'soft' : 'outline'}
                onClick={() => toggleSaved(listing.id)}
                aria-pressed={saved}
              >
                <Heart className={cn(saved && 'fill-red-500 text-red-500')} />
                {saved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>

          {/* key facts */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {listing.type === 'land' ? (
              <>
                <KeyFact icon={<Maximize />} value={`${listing.plot} acres`} label="Plot size" />
                <KeyFact icon={<ShieldCheck />} value="Ready" label="Title status" />
                <KeyFact icon={<Eye />} value={formatNumber(listing.views)} label="Views" />
                <KeyFact icon={<Clock />} value={timeAgo(listing.listedAt)} label="Listed" />
              </>
            ) : (
              <>
                <KeyFact
                  icon={<BedDouble />}
                  value={listing.beds || 'Studio'}
                  label={listing.beds ? pluralize(listing.beds, 'bedroom') : 'Open plan'}
                />
                <KeyFact
                  icon={<Bath />}
                  value={listing.baths}
                  label={pluralize(listing.baths, 'bathroom')}
                />
                <KeyFact icon={<Maximize />} value={formatArea(listing.area)} label="Internal area" />
                <KeyFact
                  icon={<Car />}
                  value={listing.parking}
                  label={pluralize(listing.parking, 'parking space')}
                />
              </>
            )}
          </div>

          <Separator className="my-8" />

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features & amenities</TabsTrigger>
              <TabsTrigger value="area">Location</TabsTrigger>
              <TabsTrigger value="costs">Costs & history</TabsTrigger>
            </TabsList>

            {/* ---------- overview ---------- */}
            <TabsContent value="overview" className="pt-6 outline-none">
              <h2 className="font-display text-default text-xl font-semibold">About this home</h2>
              <p className="text-muted mt-3 leading-relaxed text-pretty">{listing.description}</p>

              <dl className="border-default mt-8 grid gap-x-10 gap-y-4 border-t pt-6 sm:grid-cols-2">
                {[
                  ['Property type', listing.type[0].toUpperCase() + listing.type.slice(1)],
                  ['Listing type', listing.deal === 'rent' ? 'To let' : 'For sale'],
                  listing.yearBuilt ? ['Year built', String(listing.yearBuilt)] : null,
                  listing.plot ? ['Plot size', `${listing.plot} acres`] : null,
                  ['Furnishing', listing.furnished ? 'Furnished' : 'Unfurnished'],
                  ['Pets', listing.petFriendly ? 'Allowed' : 'Not allowed'],
                  listing.serviceCharge
                    ? ['Service charge', `${formatPrice(listing.serviceCharge)}/mo`]
                    : null,
                  ['Listed', formatDate(listing.listedAt)],
                  ['Reference', listing.id],
                  ['Saves', formatNumber(listing.saves)],
                ]
                  .filter(Boolean)
                  .map((row) => {
                    const [k, v] = row as [string, string]
                    return (
                      <div key={k} className="flex justify-between gap-4 text-sm">
                        <dt className="text-muted">{k}</dt>
                        <dd className="text-default font-semibold">{v}</dd>
                      </div>
                    )
                  })}
              </dl>
            </TabsContent>

            {/* ---------- features ---------- */}
            <TabsContent value="features" className="pt-6 outline-none">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h2 className="font-display text-default text-xl font-semibold">Features</h2>
                  <ul className="mt-4 space-y-2.5">
                    {listing.features.map((f) => (
                      <li key={f} className="text-muted flex items-center gap-2.5 text-sm">
                        <Check className="text-brand size-4 shrink-0" strokeWidth={3} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                {listing.amenities.length > 0 && (
                  <div>
                    <h2 className="font-display text-default text-xl font-semibold">
                      Building amenities
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {listing.amenities.map((a) => (
                        <li key={a} className="text-muted flex items-center gap-2.5 text-sm">
                          <Check className="text-brand size-4 shrink-0" strokeWidth={3} />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ---------- location ---------- */}
            <TabsContent value="area" className="pt-6 outline-none">
              <h2 className="font-display text-default text-xl font-semibold">
                {listing.neighborhood}, {listing.city}
              </h2>
              <MapPane listings={[listing]} className="mt-4 h-80" />

              <h3 className="text-default mt-8 text-sm font-bold">What&rsquo;s nearby</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {listing.nearby.map((p) => (
                  <li
                    key={p.name}
                    className="bg-surface-2 flex items-center gap-3 rounded-lg px-3.5 py-3"
                  >
                    <span className="text-brand [&_svg]:size-[18px]">{NEARBY_ICON[p.kind]}</span>
                    <span className="text-default flex-1 text-sm font-medium">{p.name}</span>
                    <span className="text-muted text-xs font-semibold tabular-nums">
                      {p.distance} km
                    </span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            {/* ---------- costs ---------- */}
            <TabsContent value="costs" className="pt-6 outline-none">
              <Card className="p-5">
                <PriceHistoryChart data={listing.priceHistory} />
              </Card>

              <h3 className="text-default mt-8 text-sm font-bold">Price changes</h3>
              <ol className="border-default mt-4 space-y-0 divide-y divide-[var(--border)] rounded-lg border">
                {[...listing.priceHistory].reverse().map((p, i, arr) => {
                  const prev = arr[i + 1]
                  const change = prev ? ((p.price - prev.price) / prev.price) * 100 : 0
                  return (
                    <li key={p.date} className="flex items-center justify-between gap-4 px-4 py-3">
                      <span className="text-muted text-sm">{formatDate(p.date)}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-default text-sm font-bold tabular-nums">
                          {formatPrice(p.price, { compact: false })}
                        </span>
                        {prev && (
                          <span
                            className={cn(
                              'w-16 text-right text-xs font-bold tabular-nums',
                              change >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400',
                            )}
                          >
                            {change >= 0 ? '+' : ''}
                            {change.toFixed(1)}%
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ol>

              {listing.deal === 'buy' && (
                <Card className="mt-8 p-5">
                  <h3 className="font-display text-default mb-5 text-lg font-semibold">
                    Work out the repayments
                  </h3>
                  <MortgageCalculator price={listing.price} compact />
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ------------------------- sidebar ------------------------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <div className="p-5">
              <div className="flex items-baseline gap-2">
                <p className="font-display text-default text-3xl font-semibold tabular-nums">
                  {formatPrice(listing.price, { compact: false })}
                </p>
                {listing.deal === 'rent' && (
                  <span className="text-muted text-sm font-semibold">/month</span>
                )}
              </div>
              {listing.previousPrice && (
                <p className="text-muted mt-1 text-sm">
                  <span className="line-through">
                    {formatPrice(listing.previousPrice, { compact: false })}
                  </span>{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    down {formatPrice(listing.previousPrice - listing.price)}
                  </span>
                </p>
              )}
              {listing.serviceCharge && (
                <p className="text-muted mt-1 text-sm">
                  + {formatPrice(listing.serviceCharge)}/mo service charge
                </p>
              )}

              <div className="mt-5 space-y-2">
                <ScheduleTourDialog listing={listing}>
                  <Button className="w-full" size="lg">
                    <CalendarCheck /> Book a viewing
                  </Button>
                </ScheduleTourDialog>
                <Button
                  variant="secondary"
                  className="w-full"
                  size="lg"
                  onClick={() => toast.success('Message sent', { description: `${agent?.name} will reply shortly.` })}
                >
                  <MessageSquare /> Message the agent
                </Button>
              </div>

              <div className="text-muted mt-4 flex items-center justify-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <Eye className="size-3.5" /> {formatNumber(listing.views)} views
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="size-3.5" /> {formatNumber(listing.saves)} saves
                </span>
              </div>
            </div>

            {agent && (
              <>
                <Separator />
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={agent.name} src={agent.avatar} className="size-12" />
                    <div className="min-w-0 flex-1">
                      <p className="text-default flex items-center gap-1.5 text-sm font-bold">
                        <Link to={`/agents/${agent.id}`} className="hover:text-brand truncate">
                          {agent.name}
                        </Link>
                        {agent.verified && (
                          <Tooltip content="Identity and licence verified">
                            <ShieldCheck className="text-brand size-4 shrink-0" />
                          </Tooltip>
                        )}
                      </p>
                      <p className="text-muted truncate text-xs">{agent.agency}</p>
                    </div>
                  </div>

                  <div className="text-muted mt-3 flex items-center gap-1.5 text-xs">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-default font-bold">{agent.rating}</span>
                    <span>({formatNumber(agent.reviews)} reviews)</span>
                    <span aria-hidden>·</span>
                    <span>{agent.deals} deals closed</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${agent.phone.replace(/\s/g, '')}`}>
                        <Phone /> Call
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/agents/${agent.id}`}>
                        <Link2 /> Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="p-5">
              <h3 className="text-default mb-3 text-sm font-bold">How this home scores</h3>
              <div className="space-y-3">
                {[
                  { label: 'Value for the area', value: listing.score },
                  { label: 'Condition', value: Math.min(100, listing.score + 6) },
                  { label: 'Agent responsiveness', value: Math.round((agent?.rating ?? 4.5) * 20) },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-muted font-medium">{s.label}</span>
                      <span className="text-default font-bold tabular-nums">{s.value}</span>
                    </div>
                    <Progress value={s.value} />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {/* ------------------------- similar ------------------------- */}
      {similar.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-default text-2xl font-semibold tracking-tight">
            Similar homes nearby
          </h2>
          <p className="text-muted mt-1.5 text-sm">
            Same kind of property, within 35% of this asking price.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
