import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Eye,
  Heart,
  MapPin,
  MessageSquare,
  Scale,
  Video,
  X,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ActivityChart, MagnitudeBars } from '@/components/charts'
import { getAgent, getListing, LISTINGS } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn, formatDate, formatNumber, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, Badge, Card, EmptyState, Separator, Stat } from '@/components/ui/primitives'
import { SmartImage } from '@/components/ui/smart-image'
import { Tooltip } from '@/components/ui/overlay'

/** Deterministic 30-day activity curve — stands in for real analytics. */
function activitySeries(seed: number) {
  const out: { label: string; value: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const wave = Math.sin((i + seed) / 3.4) * 9 + Math.cos((i + seed) / 7) * 6
    out.push({
      label: d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }),
      value: Math.max(2, Math.round(26 + wave + ((i * seed) % 7))),
    })
  }
  return out
}

export function Dashboard() {
  const { saved, compare, tours, searches, cancelTour, recent } = useStore()

  const savedHomes = saved.map(getListing).filter(Boolean) as NonNullable<
    ReturnType<typeof getListing>
  >[]

  const upcoming = tours
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const past = tours.filter((t) => t.status === 'completed')

  const activity = useMemo(() => activitySeries(saved.length + 3), [saved.length])

  const priceBands = useMemo(() => {
    const source = savedHomes.length ? savedHomes : LISTINGS.filter((l) => l.deal === 'buy')
    const bands = [
      { label: 'Under 10M', test: (p: number) => p < 10_000_000 },
      { label: '10–25M', test: (p: number) => p >= 10_000_000 && p < 25_000_000 },
      { label: '25–50M', test: (p: number) => p >= 25_000_000 && p < 50_000_000 },
      { label: '50–100M', test: (p: number) => p >= 50_000_000 && p < 100_000_000 },
      { label: '100M+', test: (p: number) => p >= 100_000_000 },
    ]
    return bands
      .map((b) => ({ label: b.label, value: source.filter((l) => b.test(l.price)).length }))
      .filter((b) => b.value > 0)
  }, [savedHomes])

  const alertsOn = searches.filter((s) => s.alerts).length
  const newMatches = searches.reduce((n, s) => n + s.newMatches, 0)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-default text-3xl font-semibold tracking-tight sm:text-4xl">
            Good to see you, Amos
          </h1>
          <p className="text-muted mt-2">
            {newMatches > 0
              ? `${newMatches} new ${newMatches === 1 ? 'home matches' : 'homes match'} your saved searches.`
              : 'Nothing new since you last looked — your searches are still running.'}
          </p>
        </div>
        <Button asChild>
          <Link to="/search">Keep browsing</Link>
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Saved homes" value={savedHomes.length} icon={<Heart />} />
        <Stat
          label="Viewings booked"
          value={upcoming.length}
          icon={<CalendarDays />}
          hint={past.length ? `${past.length} completed` : undefined}
        />
        <Stat
          label="Active alerts"
          value={alertsOn}
          icon={<Bell />}
          hint={`${searches.length} saved searches`}
        />
        <Stat label="In compare tray" value={compare.length} icon={<Scale />} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* --------------- viewings --------------- */}
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-default text-lg font-semibold">Your viewings</h2>
            <Badge variant="brand">{upcoming.length} upcoming</Badge>
          </div>

          {tours.length === 0 ? (
            <EmptyState
              icon={<CalendarDays />}
              title="No viewings booked"
              description="Book one from any listing and it'll appear here with the agent's details."
              className="border-0 py-10"
              action={
                <Button asChild size="sm">
                  <Link to="/search">Find a home</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {[...upcoming, ...past].map((t) => {
                const l = getListing(t.listingId)
                const agent = l ? getAgent(l.agentId) : undefined
                if (!l) return null
                const done = t.status === 'completed'
                return (
                  <li
                    key={t.id}
                    className={cn(
                      'border-default flex gap-3 rounded-lg border p-3',
                      done && 'opacity-60',
                    )}
                  >
                    <Link to={`/listing/${l.id}`} className="shrink-0">
                      <SmartImage src={l.images[0]} alt="" wrapperClassName="size-16 rounded-md" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/listing/${l.id}`}
                        className="text-default hover:text-brand line-clamp-1 text-sm font-bold"
                      >
                        {l.title}
                      </Link>
                      <p className="text-muted mt-0.5 flex items-center gap-1 truncate text-xs">
                        <MapPin className="size-3" /> {l.neighborhood}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge variant={done ? 'neutral' : t.status === 'confirmed' ? 'success' : 'warn'}>
                          {done ? (
                            <>
                              <CheckCircle2 /> Completed
                            </>
                          ) : (
                            t.status
                          )}
                        </Badge>
                        <span className="text-muted text-xs font-semibold">
                          {formatDate(t.date)} · {t.time}
                        </span>
                        <span className="text-muted flex items-center gap-1 text-xs">
                          {t.mode === 'video' ? <Video className="size-3" /> : <MapPin className="size-3" />}
                          {t.mode === 'video' ? 'Video' : 'In person'}
                        </span>
                      </div>
                      {t.note && <p className="text-muted mt-1.5 text-xs italic">“{t.note}”</p>}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {agent && <Avatar name={agent.name} src={agent.avatar} className="size-8" />}
                      {!done && (
                        <Tooltip content="Cancel viewing">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => cancelTour(t.id)}
                            aria-label="Cancel viewing"
                          >
                            <X />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        {/* --------------- alerts --------------- */}
        <Card className="p-5">
          <h2 className="font-display text-default mb-5 text-lg font-semibold">Saved searches</h2>
          {searches.length === 0 ? (
            <p className="text-muted text-sm">
              No saved searches yet.{' '}
              <Link to="/search" className="text-brand font-semibold">
                Build one
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {searches.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/search${s.query}`}
                    className="border-default hover:bg-surface-2 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full',
                        s.alerts ? 'bg-brand-soft text-brand' : 'bg-surface-2 text-muted',
                      )}
                    >
                      <Bell className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-default block truncate text-sm font-semibold">
                        {s.name}
                      </span>
                      <span className="text-muted text-xs">
                        {s.alerts ? 'Alerts on' : 'Alerts off'} · saved {formatDate(s.createdAt)}
                      </span>
                    </span>
                    {s.newMatches > 0 && <Badge variant="solid">{s.newMatches}</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Separator className="my-5" />

          <h2 className="font-display text-default mb-4 text-lg font-semibold">Recently viewed</h2>
          {recent.length === 0 ? (
            <p className="text-muted text-sm">Nothing yet.</p>
          ) : (
            <ul className="space-y-2">
              {recent
                .slice(0, 4)
                .map(getListing)
                .filter(Boolean)
                .map((l) => (
                  <li key={l!.id}>
                    <Link
                      to={`/listing/${l!.id}`}
                      className="hover:bg-surface-2 flex items-center gap-3 rounded-lg p-2 transition-colors"
                    >
                      <SmartImage src={l!.images[0]} alt="" wrapperClassName="size-10 rounded-md" />
                      <span className="min-w-0 flex-1">
                        <span className="text-default block truncate text-sm font-semibold">
                          {l!.neighborhood}
                        </span>
                        <span className="text-muted text-xs">{formatPrice(l!.price)}</span>
                      </span>
                      <Eye className="text-muted size-4" />
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>

      {/* --------------- charts --------------- */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <ActivityChart data={activity} title="Views on homes you follow — last 30 days" />
        </Card>
        <Card className="p-5">
          <MagnitudeBars
            data={priceBands}
            title={savedHomes.length ? 'Your shortlist by price band' : 'Market stock by price band'}
            valueFormat={(v) => `${v} ${v === 1 ? 'home' : 'homes'}`}
          />
        </Card>
      </div>

      {/* --------------- messages --------------- */}
      <Card className="mt-6 p-5">
        <h2 className="font-display text-default mb-5 text-lg font-semibold">Recent messages</h2>
        <ul className="divide-y divide-[var(--border)]">
          {[
            {
              agent: getAgent('a1')!,
              text: 'The owner is open to 36.5M if you can close within six weeks. Shall I put it forward?',
              when: '2h ago',
              unread: true,
            },
            {
              agent: getAgent('a3')!,
              text: 'Confirmed for Thursday 10:30. The caretaker will have the keys — ask for Joseph at the gate.',
              when: 'Yesterday',
              unread: false,
            },
            {
              agent: getAgent('a4')!,
              text: 'Sent the service charge breakdown and the last two years of minutes to your email.',
              when: '3 days ago',
              unread: false,
            },
          ].map((m, i) => (
            <li key={i} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
              <Avatar name={m.agent.name} src={m.agent.avatar} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="text-default text-sm font-bold">{m.agent.name}</span>
                  {m.unread && <Badge variant="solid">New</Badge>}
                  <span className="text-muted ml-auto shrink-0 text-xs">{m.when}</span>
                </p>
                <p className="text-muted mt-1 text-sm text-pretty">{m.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="mt-5">
          <MessageSquare /> Open inbox ({formatNumber(12)})
        </Button>
      </Card>
    </div>
  )
}
