import { Banknote, Calculator, Info, TrendingDown, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListingCard } from '@/components/listing/ListingCard'
import { MortgageCalculator } from '@/components/tools/MortgageCalculator'
import { LISTINGS } from '@/lib/data'
import { formatPrice, monthlyPayment } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/controls'
import { Card, Stat } from '@/components/ui/primitives'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/controls'

const LENDERS = [
  { name: 'KCB Bank', rate: 13.2, maxLtv: 90, term: 25 },
  { name: 'Stanbic Bank', rate: 12.9, maxLtv: 85, term: 20 },
  { name: 'Absa Kenya', rate: 13.5, maxLtv: 90, term: 25 },
  { name: 'NCBA', rate: 13.9, maxLtv: 80, term: 20 },
  { name: 'HF Group', rate: 14.4, maxLtv: 95, term: 25 },
]

/** Affordability works the other way round: income in, price out. */
function Affordability() {
  const [income, setIncome] = useState(350_000)
  const [debts, setDebts] = useState(25_000)
  const [deposit, setDeposit] = useState(2_500_000)
  const [rate, setRate] = useState(13.5)
  const [years, setYears] = useState(20)

  // Lenders cap total repayments at ~35% of gross income, less existing debt.
  const budget = Math.max(income * 0.35 - debts, 0)
  const r = rate / 100 / 12
  const n = years * 12
  const maxLoan = r === 0 ? budget * n : (budget * (1 - Math.pow(1 + r, -n))) / r
  const maxPrice = Math.round((maxLoan + deposit) / 100_000) * 100_000

  const matches = useMemo(
    () =>
      LISTINGS.filter((l) => l.deal === 'buy' && l.price <= maxPrice && l.price > maxPrice * 0.6)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4),
    [maxPrice],
  )

  const field = (
    label: string,
    value: number,
    set: (v: number) => void,
    min: number,
    max: number,
    step: number,
    format: (v: number) => string,
  ) => (
    <div key={label}>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-default text-sm font-semibold">{label}</span>
        <span className="text-muted text-sm font-semibold tabular-nums">{format(value)}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => set(v)}
        aria-label={label}
      />
    </div>
  )

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        <Card className="space-y-6 p-6">
          {field('Gross monthly income', income, setIncome, 50_000, 2_000_000, 10_000, (v) =>
            formatPrice(v),
          )}
          {field('Existing monthly debts', debts, setDebts, 0, 500_000, 5_000, (v) => formatPrice(v))}
          {field('Deposit saved', deposit, setDeposit, 0, 50_000_000, 250_000, (v) => formatPrice(v))}
          {field('Interest rate', rate, setRate, 8, 22, 0.25, (v) => `${v.toFixed(2)}%`)}
          {field('Term', years, setYears, 5, 30, 1, (v) => `${v} years`)}
        </Card>

        {matches.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-default text-xl font-semibold">
              Homes inside your budget
            </h2>
            <p className="text-muted mt-1 text-sm">
              Priced between {formatPrice(maxPrice * 0.6)} and {formatPrice(maxPrice)}.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {matches.map((l, i) => (
                <ListingCard key={l.id} listing={l} index={i} compact />
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="p-6">
          <p className="text-muted text-xs font-bold tracking-wider uppercase">
            You could afford up to
          </p>
          <p className="font-display text-default mt-2 text-4xl font-semibold tabular-nums">
            {formatPrice(maxPrice)}
          </p>
          <p className="text-muted mt-2 text-sm">
            on a {formatPrice(Math.round(maxLoan))} loan plus your {formatPrice(deposit)} deposit.
          </p>

          <dl className="border-default mt-6 space-y-3 border-t pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Monthly repayment ceiling</dt>
              <dd className="text-default font-bold tabular-nums">{formatPrice(budget)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Share of income</dt>
              <dd className="text-default font-bold tabular-nums">35%</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Repayment on that loan</dt>
              <dd className="text-default font-bold tabular-nums">
                {formatPrice(Math.round(monthlyPayment(maxLoan, rate, years)))}
              </dd>
            </div>
          </dl>

          <p className="text-muted mt-5 flex gap-2 text-xs text-pretty">
            <Info className="mt-0.5 size-4 shrink-0" />
            Lenders also weigh your employment type, credit history and age at the end of the term.
            Treat this as a starting point, not a decision.
          </p>

          <Button asChild className="mt-5 w-full">
            <Link to={`/search?deal=buy&max=${maxPrice}`}>See every home under {formatPrice(maxPrice)}</Link>
          </Button>
        </Card>
      </aside>
    </div>
  )
}

export function MortgagePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <span className="bg-brand-soft text-brand inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold">
          <Calculator className="size-3.5" /> Money tools
        </span>
        <h1 className="font-display text-default mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Work out what it really costs
        </h1>
        <p className="text-muted mt-3 text-pretty">
          Repayments, deposit, stamp duty and the income a Kenyan lender will want to see — before
          you fall for a house you can&rsquo;t finance.
        </p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Average mortgage rate"
          value="13.5%"
          hint="CBK commercial bank average"
          icon={<Banknote />}
        />
        <Stat label="Typical deposit" value="10–20%" hint="Of the purchase price" icon={<Wallet />} />
        <Stat
          label="Stamp duty"
          value="4% / 2%"
          hint="Municipality / outside"
          icon={<TrendingDown />}
        />
      </div>

      <Tabs defaultValue="repayments">
        <TabsList>
          <TabsTrigger value="repayments">Repayment calculator</TabsTrigger>
          <TabsTrigger value="afford">What can I afford?</TabsTrigger>
          <TabsTrigger value="lenders">Compare lenders</TabsTrigger>
        </TabsList>

        <TabsContent value="repayments" className="pt-8 outline-none">
          <Card className="mx-auto max-w-2xl p-6">
            <MortgageCalculator price={28_000_000} />
          </Card>
        </TabsContent>

        <TabsContent value="afford" className="pt-8 outline-none">
          <Affordability />
        </TabsContent>

        <TabsContent value="lenders" className="pt-8 outline-none">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-xl text-sm">
                <caption className="sr-only">
                  Indicative mortgage terms by lender, on a 25 million shilling property
                </caption>
                <thead>
                  <tr className="border-default text-muted border-b text-left text-xs font-bold tracking-wider uppercase">
                    <th scope="col" className="p-4">
                      Lender
                    </th>
                    <th scope="col" className="p-4 text-right">
                      Rate
                    </th>
                    <th scope="col" className="p-4 text-right">
                      Max LTV
                    </th>
                    <th scope="col" className="p-4 text-right">
                      Max term
                    </th>
                    <th scope="col" className="p-4 text-right">
                      On KSh 25M (20% down)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {LENDERS.map((l) => {
                    const monthly = monthlyPayment(20_000_000, l.rate, 20)
                    const cheapest = Math.min(...LENDERS.map((x) => x.rate)) === l.rate
                    return (
                      <tr key={l.name} className="hover:bg-surface-2 transition-colors">
                        <th scope="row" className="text-default p-4 text-left font-bold">
                          {l.name}
                          {cheapest && (
                            <span className="text-brand ml-2 text-xs font-semibold">
                              lowest rate
                            </span>
                          )}
                        </th>
                        <td className="text-default p-4 text-right font-semibold tabular-nums">
                          {l.rate.toFixed(2)}%
                        </td>
                        <td className="text-muted p-4 text-right tabular-nums">{l.maxLtv}%</td>
                        <td className="text-muted p-4 text-right tabular-nums">{l.term} yrs</td>
                        <td className="text-default p-4 text-right font-bold tabular-nums">
                          {formatPrice(Math.round(monthly), { compact: false })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="text-muted mt-4 text-xs">
            Indicative rates for illustration. Banks price each application individually.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
