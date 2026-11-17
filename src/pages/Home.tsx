import { motion } from 'motion/react'
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Hero } from '@/components/home/Hero'
import { ListingCard } from '@/components/listing/ListingCard'
import { LISTINGS, NEIGHBORHOODS, TESTIMONIALS } from '@/lib/data'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, Badge, Card } from '@/components/ui/primitives'
import { SmartImage } from '@/components/ui/smart-image'

function SectionHead({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: { label: string; to: string }
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-brand text-xs font-bold tracking-wider uppercase">{eyebrow}</p>
        )}
        <h2 className="font-display text-default mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {description && <p className="text-muted mt-3 text-pretty">{description}</p>}
      </div>
      {action && (
        <Button asChild variant="outline" size="sm">
          <Link to={action.to}>
            {action.label} <ArrowRight />
          </Link>
        </Button>
      )}
    </div>
  )
}

const STEPS = [
  {
    icon: <Search />,
    title: 'Narrow it down',
    body: 'Filter by the things that actually decide it — commute, service charge, backup power, whether the landlord takes pets.',
  },
  {
    icon: <CalendarCheck />,
    title: 'Book the viewings',
    body: 'Pick a slot straight from the listing. In person or over video, confirmed with the agent in minutes.',
  },
  {
    icon: <Wallet />,
    title: 'Check the real cost',
    body: 'Mortgage, deposit, service charge and stamp duty, worked out per listing before you make an offer.',
  },
  {
    icon: <BadgeCheck />,
    title: 'Close with confidence',
    body: 'Rated agents, verified titles, and a record of every price change the property has had.',
  },
]

export function Home() {
  const featured = [...LISTINGS].sort((a, b) => b.score - a.score).slice(0, 6)
  const newest = [...LISTINGS]
    .sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime())
    .slice(0, 3)

  return (
    <>
      <Hero />

      {/* ------------------- trust band ------------------- */}
      <section className="border-default bg-subtle border-y">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-muted text-sm font-semibold">Listings sourced with</p>
          {['Acacia Residential', 'Meridian Homes', 'Skyline Developments', 'Blue Horizon Realty', 'Rift Valley Property Co.'].map(
            (name) => (
              <span
                key={name}
                className="font-display text-muted text-base font-semibold opacity-70 transition-opacity hover:opacity-100"
              >
                {name}
              </span>
            ),
          )}
        </div>
      </section>

      {/* ------------------- featured ------------------- */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="Handpicked"
          title="Homes worth clearing your Saturday for"
          description="Ranked by condition, value against the street average, and how quickly the agent responds."
          action={{ label: 'See all listings', to: '/search' }}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} />
          ))}
        </div>
      </section>

      {/* ------------------- neighbourhoods ------------------- */}
      <section className="bg-subtle border-default border-y">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
          <SectionHead
            eyebrow="Know before you go"
            title="Pick the street, not just the house"
            description="Median prices, commute scores and what it's actually like to live there."
            action={{ label: 'All neighbourhoods', to: '/neighbourhoods' }}
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {NEIGHBORHOODS.slice(0, 8).map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.3) }}
              >
                <Link
                  to={`/search?q=${encodeURIComponent(n.name)}`}
                  className="group bg-surface border-default relative block overflow-hidden rounded-xl border shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative">
                    <SmartImage
                      src={n.image}
                      alt={n.name}
                      wrapperClassName="aspect-5/4"
                      className="transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="font-display text-lg font-semibold text-white">{n.name}</h3>
                      <p className="text-xs font-medium text-white/80">
                        {n.city} · {n.listings} homes
                      </p>
                    </div>
                  </div>
                  <div className="bg-surface flex items-center justify-between gap-2 p-4">
                    <div>
                      <p className="text-muted text-[11px] font-semibold tracking-wide uppercase">
                        Median
                      </p>
                      <p className="text-default text-sm font-bold">
                        {formatPrice(n.medianBuy)}
                        <span className="text-muted font-medium"> · {formatPrice(n.medianRent)}/mo</span>
                      </p>
                    </div>
                    <ChevronRight className="text-muted size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------- how it works ------------------- */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="How it works"
          title="Four steps, no runaround"
          description="The parts of a house hunt that usually take six phone calls, collapsed into one place."
        />
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Card className="h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="bg-brand-soft text-brand grid size-11 place-items-center rounded-lg [&_svg]:size-5">
                    {s.icon}
                  </span>
                  <span className="font-display text-muted text-3xl font-semibold opacity-30">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-display text-default mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="text-muted mt-2 text-sm text-pretty">{s.body}</p>
              </Card>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ------------------- just listed strip ------------------- */}
      <section className="bg-subtle border-default border-y">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <Badge variant="brand" size="md">
                <Sparkles /> Just listed
              </Badge>
              <h2 className="font-display text-default mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Be first through the door
              </h2>
              <p className="text-muted mt-3 text-pretty">
                Homes in Nairobi&rsquo;s tightest areas go under offer in a fortnight. Save a search
                and we&rsquo;ll email you the moment something matches — before it reaches the
                portals.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/search?sort=newest">
                    Browse newest <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/saved">Set up an alert</Link>
                </Button>
              </div>

              <ul className="text-muted mt-8 space-y-3 text-sm">
                {[
                  { icon: <ShieldCheck />, text: 'Every title verified before a listing goes live' },
                  { icon: <TrendingUp />, text: 'Full price history, including the quiet reductions' },
                  { icon: <BadgeCheck />, text: 'Agents rated by people who actually transacted' },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    <span className="text-brand [&_svg]:size-[18px]">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {newest.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} compact />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------- testimonials ------------------- */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead
          eyebrow="From people who moved"
          title="The hunt, finished"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Card className="flex h-full flex-col p-6">
                <Quote className="text-brand size-7 opacity-40" />
                <blockquote className="text-default mt-4 flex-1 text-sm leading-relaxed text-pretty">
                  {t.quote}
                </blockquote>
                <figcaption className="border-default mt-6 flex items-center gap-3 border-t pt-5">
                  <Avatar name={t.name} src={t.avatar} />
                  <div>
                    <p className="text-default text-sm font-bold">{t.name}</p>
                    <p className="text-muted text-xs">{t.role}</p>
                  </div>
                </figcaption>
              </Card>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ------------------- CTA ------------------- */}
      <section className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6 lg:px-8">
        <div className="bg-forest-900 relative overflow-hidden rounded-2xl px-6 py-16 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_20%_0%,oklch(0.5_0.1_165/0.55),transparent),radial-gradient(50%_70%_at_85%_100%,oklch(0.6_0.14_48/0.35),transparent)]"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              Have a property to sell or let?
            </h2>
            <p className="mt-4 text-pretty text-white/70">
              List it in under ten minutes. We&rsquo;ll match it to buyers already searching your
              street, and you&rsquo;ll see every enquiry in one inbox.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/list-your-property">
                  List your property <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/agents">Talk to an agent</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
