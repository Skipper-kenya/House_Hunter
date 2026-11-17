import { motion } from 'motion/react'
import { ArrowRight, Building2, Key, MapPin, Search, Sparkles, TrendingUp } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LISTINGS, NEIGHBORHOODS } from '@/lib/data'
import { cn, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/controls'
import { SmartImage } from '@/components/ui/smart-image'
import { EXTERIORS, LIVING } from '@/lib/images'

const QUICK = ['Westlands', 'Kilimani', 'Karen', 'Lavington', 'Syokimau', 'Nyali']

export function Hero() {
  const navigate = useNavigate()
  const [deal, setDeal] = useState<'buy' | 'rent'>('buy')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const blurTimer = useRef<number>(undefined)

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return NEIGHBORHOODS.slice(0, 5)
    return NEIGHBORHOODS.filter(
      (n) => n.name.toLowerCase().includes(needle) || n.city.toLowerCase().includes(needle),
    ).slice(0, 6)
  }, [q])

  const submit = (value = q) => {
    const params = new URLSearchParams()
    if (value.trim()) params.set('q', value.trim())
    if (deal === 'rent') params.set('deal', 'rent')
    navigate(`/search?${params.toString()}`)
  }

  const stats = [
    { icon: <Building2 />, value: formatNumber(LISTINGS.length * 184), label: 'Live listings' },
    { icon: <MapPin />, value: NEIGHBORHOODS.length, label: 'Neighbourhoods' },
    { icon: <TrendingUp />, value: '4.9★', label: 'Agent rating' },
  ]

  return (
    <section className="relative overflow-hidden">
      {/* ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_18%_0%,color-mix(in_oklab,var(--brand)_14%,transparent),transparent_70%),radial-gradient(50%_50%_at_90%_15%,color-mix(in_oklab,var(--color-clay-500)_12%,transparent),transparent_70%)]"
      />

      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:pt-20 lg:pb-24">
        {/* ---------------- copy + search ---------------- */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-brand-soft text-brand inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold"
          >
            <Sparkles className="size-3.5" />
            {formatNumber(312)} new homes listed this week
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-display text-default mt-5 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Find the one you&rsquo;ll
            <span className="text-brand"> actually move into.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="text-muted mt-5 max-w-lg text-lg text-pretty"
          >
            Every listing verified, every agent rated, and the running costs shown up front —
            from Westlands apartments to half-acre plots in Karen.
          </motion.p>

          {/* search card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="bg-surface border-default mt-8 rounded-xl border p-3 shadow-lift"
          >
            <Segmented
              value={deal}
              onChange={setDeal}
              className="mb-3"
              options={[
                { value: 'buy', label: 'Buy', icon: <Key /> },
                { value: 'rent', label: 'Rent', icon: <Building2 /> },
              ]}
            />

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="relative flex flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="text-muted pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    setOpen(true)
                  }}
                  onFocus={() => setOpen(true)}
                  onBlur={() => {
                    blurTimer.current = window.setTimeout(() => setOpen(false), 120)
                  }}
                  placeholder="Area, street or landmark — try “Kilimani”"
                  aria-label="Where are you looking?"
                  autoComplete="off"
                  className="bg-surface-2 text-default placeholder:text-[var(--text-muted)] h-13 w-full rounded-lg pr-4 pl-11 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />

                {open && suggestions.length > 0 && (
                  <ul className="bg-surface border-default absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-lg border p-1.5 shadow-pop">
                    {suggestions.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            window.clearTimeout(blurTimer.current)
                            setQ(s.name)
                            setOpen(false)
                            submit(s.name)
                          }}
                          className="hover:bg-surface-2 flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors"
                        >
                          <MapPin className="text-muted size-4 shrink-0" />
                          <span className="text-default flex-1 text-sm font-medium">{s.name}</span>
                          <span className="text-muted text-xs">{s.listings} homes</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button type="submit" size="lg" className="sm:w-auto">
                Search <ArrowRight />
              </Button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
              <span className="text-muted text-xs font-semibold">Popular:</span>
              {QUICK.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => submit(area)}
                  className="text-muted hover:text-brand hover:bg-brand-soft rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
                >
                  {area}
                </button>
              ))}
            </div>
          </motion.div>

          {/* stats */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-x-10 gap-y-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="bg-surface-2 text-brand grid size-10 place-items-center rounded-lg [&_svg]:size-[18px]">
                  {s.icon}
                </span>
                <div>
                  <dd className="font-display text-default text-xl leading-none font-semibold">
                    {s.value}
                  </dd>
                  <dt className="text-muted mt-1 text-xs font-medium">{s.label}</dt>
                </div>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ---------------- collage ---------------- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden lg:block"
          aria-hidden
        >
          <div className="grid grid-cols-5 grid-rows-6 gap-4 h-[34rem]">
            <SmartImage
              src={EXTERIORS[0]}
              alt=""
              eager
              wrapperClassName="col-span-3 row-span-4 rounded-2xl shadow-lift"
            />
            <SmartImage
              src={LIVING[0]}
              alt=""
              eager
              wrapperClassName="col-span-2 row-span-3 rounded-2xl shadow-lift"
            />
            <SmartImage
              src={EXTERIORS[11]}
              alt=""
              wrapperClassName="col-span-2 row-span-3 rounded-2xl shadow-lift"
            />
            <SmartImage
              src={LIVING[3]}
              alt=""
              wrapperClassName="col-span-3 row-span-2 rounded-2xl shadow-lift"
            />
          </div>

          <FloatingCard
            className="-top-2 -left-6"
            delay={0.6}
            title="Kilimani · 2 bed"
            value="KSh 165K/mo"
            hint="3 viewings booked today"
          />
          <FloatingCard
            className="right-2 bottom-6"
            delay={0.8}
            title="Match score"
            value="92"
            hint="Based on your saved searches"
          />
        </motion.div>
      </div>
    </section>
  )
}

function FloatingCard({
  className,
  title,
  value,
  hint,
  delay,
}: {
  className?: string
  title: string
  value: string
  hint: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn('glass border-default absolute rounded-xl border p-3.5 shadow-pop', className)}
    >
      <p className="text-muted text-[11px] font-semibold tracking-wide uppercase">{title}</p>
      <p className="font-display text-default mt-1 text-xl font-semibold">{value}</p>
      <p className="text-muted mt-0.5 text-[11px]">{hint}</p>
    </motion.div>
  )
}
