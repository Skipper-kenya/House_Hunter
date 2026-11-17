import { Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CostSplitBar } from '@/components/charts'
import { Slider } from '@/components/ui/controls'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/primitives'
import { Tooltip } from '@/components/ui/overlay'
import { cn, formatPrice, monthlyPayment } from '@/lib/utils'

/** Central Bank of Kenya average mortgage rate — the realistic starting point. */
const DEFAULT_RATE = 13.5

function Row({
  label,
  value,
  hint,
  strong,
}: {
  label: string
  value: string
  hint?: string
  strong?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className={cn('text-sm', strong ? 'text-default font-bold' : 'text-muted')}>
        {label}
        {hint && (
          <Tooltip content={hint}>
            <span className="text-muted ml-1 inline-flex align-middle">
              <Info className="size-3.5" />
            </span>
          </Tooltip>
        )}
      </dt>
      <dd
        className={cn(
          'shrink-0 tabular-nums',
          strong ? 'text-default text-lg font-bold' : 'text-default text-sm font-semibold',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

export function MortgageCalculator({
  price,
  compact,
  className,
}: {
  price: number
  compact?: boolean
  className?: string
}) {
  const [depositPct, setDepositPct] = useState(20)
  const [rate, setRate] = useState(DEFAULT_RATE)
  const [years, setYears] = useState(20)
  const [amount, setAmount] = useState(price)

  const deposit = Math.round((amount * depositPct) / 100)
  const principal = amount - deposit
  const monthly = monthlyPayment(principal, rate, years)
  const totalPaid = monthly * years * 12
  const interest = Math.max(totalPaid - principal, 0)

  // Kenyan buyer-side costs, as a share of the purchase price.
  const stampDuty = Math.round(amount * 0.04)
  const legal = Math.round(amount * 0.015)
  const upfront = deposit + stampDuty + legal

  const incomeNeeded = useMemo(() => Math.round((monthly / 0.35) / 1000) * 1000, [monthly])

  return (
    <div className={cn('space-y-6', className)}>
      {/* hero number — the one figure people came for */}
      <div className="bg-brand-soft rounded-xl p-5 text-center">
        <p className="text-brand text-xs font-bold tracking-wider uppercase">
          Estimated monthly repayment
        </p>
        <p className="font-display text-default mt-2 text-4xl font-semibold tabular-nums">
          {formatPrice(Math.round(monthly), { compact: false })}
        </p>
        <p className="text-muted mt-1.5 text-xs">
          over {years} years at {rate.toFixed(2)}% · {depositPct}% deposit
        </p>
      </div>

      <div className="space-y-5">
        {!compact && (
          <div>
            <label htmlFor="mc-price" className="text-default mb-1.5 block text-sm font-semibold">
              Property price
            </label>
            <Input
              id="mc-price"
              type="number"
              min={500_000}
              step={100_000}
              value={amount}
              onChange={(e) => setAmount(Math.max(Number(e.target.value) || 0, 0))}
              suffix="KSh"
            />
          </div>
        )}

        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor="mc-deposit" className="text-default text-sm font-semibold">
              Deposit
            </label>
            <span className="text-muted text-sm font-semibold tabular-nums">
              {depositPct}% · {formatPrice(deposit)}
            </span>
          </div>
          <Slider
            id="mc-deposit"
            value={[depositPct]}
            min={5}
            max={70}
            step={1}
            onValueChange={([v]) => setDepositPct(v)}
            aria-label="Deposit percentage"
          />
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor="mc-rate" className="text-default text-sm font-semibold">
              Interest rate
            </label>
            <span className="text-muted text-sm font-semibold tabular-nums">
              {rate.toFixed(2)}%
            </span>
          </div>
          <Slider
            id="mc-rate"
            value={[rate]}
            min={8}
            max={22}
            step={0.25}
            onValueChange={([v]) => setRate(v)}
            aria-label="Annual interest rate"
          />
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor="mc-term" className="text-default text-sm font-semibold">
              Term
            </label>
            <span className="text-muted text-sm font-semibold tabular-nums">{years} years</span>
          </div>
          <Slider
            id="mc-term"
            value={[years]}
            min={5}
            max={30}
            step={1}
            onValueChange={([v]) => setYears(v)}
            aria-label="Loan term in years"
          />
        </div>
      </div>

      <Separator />

      <CostSplitBar principal={principal} interest={interest} />

      <Separator />

      <dl className="divide-y divide-[var(--border)]">
        <Row label="Loan amount" value={formatPrice(principal, { compact: false })} />
        <Row
          label="Stamp duty"
          value={formatPrice(stampDuty)}
          hint="4% within a municipality; 2% outside. Shown at the urban rate."
        />
        <Row label="Legal & valuation" value={formatPrice(legal)} hint="Roughly 1.5% of the price." />
        <Row label="Cash needed up front" value={formatPrice(upfront)} strong />
        <Row
          label="Income to qualify"
          value={`${formatPrice(incomeNeeded)}/mo`}
          hint="Most Kenyan lenders cap repayments at about 35% of gross monthly income."
        />
      </dl>

      <p className="text-muted text-xs text-pretty">
        Indicative only. Rates, fees and the loan-to-value a bank will offer vary by lender and by
        your own credit profile.
      </p>
    </div>
  )
}
