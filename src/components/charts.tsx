import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStore } from '@/lib/store'
import { cn, formatDate, formatPrice } from '@/lib/utils'

/**
 * Categorical slots, assigned in fixed order and never cycled. Both sets were
 * checked for CVD separation and surface contrast against their own mode's
 * chart surface — do not substitute a hue without re-running that check.
 */
const VIZ = {
  light: ['#0F8A69', '#D97706', '#4F46E5', '#BE123C'],
  dark: ['#10A079', '#CA8008', '#7C83F0', '#E2496B'],
} as const

export function useViz() {
  const { theme } = useStore()
  return VIZ[theme]
}

const axisProps = {
  stroke: 'var(--border-strong)',
  tick: { fill: 'var(--text-muted)', fontSize: 11, fontWeight: 600 },
  tickLine: false,
  axisLine: false,
} as const

function TooltipCard({
  active,
  payload,
  label,
  valueFormat,
}: {
  active?: boolean
  payload?: { value: number; name: string; color?: string }[]
  label?: string | number
  valueFormat: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border-default rounded-lg border px-3 py-2 shadow-pop">
      {label !== undefined && (
        <p className="text-muted mb-1 text-[11px] font-semibold">{label}</p>
      )}
      {payload.map((p) => (
        <p key={p.name} className="text-default flex items-center gap-2 text-sm font-bold">
          {p.color && (
            <span className="size-2.5 rounded-full" style={{ background: p.color }} />
          )}
          {valueFormat(p.value)}
        </p>
      ))}
    </div>
  )
}

/* -------------------- price history (single series) -------------------- */

export function PriceHistoryChart({
  data,
  className,
}: {
  data: { date: string; price: number }[]
  className?: string
}) {
  const viz = useViz()
  const rows = useMemo(
    () =>
      data.map((d) => ({
        label: new Date(d.date).toLocaleDateString('en-KE', { month: 'short', year: '2-digit' }),
        full: formatDate(d.date),
        price: d.price,
      })),
    [data],
  )

  const last = rows.at(-1)
  const first = rows[0]
  const delta = last && first ? ((last.price - first.price) / first.price) * 100 : 0

  return (
    <figure className={cn('w-full', className)}>
      <figcaption className="mb-3 flex items-baseline justify-between gap-3">
        <span className="text-default text-sm font-bold">Asking price over time</span>
        <span
          className={cn(
            'text-xs font-bold tabular-nums',
            delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
          )}
        >
          {delta >= 0 ? '+' : ''}
          {delta.toFixed(1)}% since first listed
        </span>
      </figcaption>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id="ph-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={viz[0]} stopOpacity={0.28} />
                <stop offset="100%" stopColor={viz[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis
              {...axisProps}
              width={56}
              tickFormatter={(v: number) => formatPrice(v).replace('KSh ', '')}
            />
            <RTooltip
              cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
              content={<TooltipCard valueFormat={(v) => formatPrice(v, { compact: false })} />}
            />
            <Area
              type="monotone"
              dataKey="price"
              name="Asking price"
              stroke={viz[0]}
              strokeWidth={2}
              fill="url(#ph-fill)"
              dot={{ r: 3, fill: 'var(--surface)', stroke: viz[0], strokeWidth: 2 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--surface)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}

/* ------------- principal vs interest (2 categories, labelled) ------------- */

export function CostSplitBar({
  principal,
  interest,
  className,
}: {
  principal: number
  interest: number
  className?: string
}) {
  const viz = useViz()
  const total = principal + interest || 1
  const parts = [
    { label: 'Principal', value: principal, color: viz[0] },
    { label: 'Interest', value: interest, color: viz[1] },
  ]

  return (
    <figure className={className}>
      <figcaption className="text-default mb-3 text-sm font-bold">
        What you repay over the full term
      </figcaption>

      {/* 2px surface gap between segments keeps the boundary readable without a stroke */}
      <div className="flex h-7 w-full gap-0.5 overflow-hidden rounded-md">
        {parts.map((p) => (
          <div
            key={p.label}
            className="h-full first:rounded-l-md last:rounded-r-md"
            style={{ width: `${(p.value / total) * 100}%`, background: p.color }}
            role="img"
            aria-label={`${p.label}: ${formatPrice(p.value)}`}
          />
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4">
        {parts.map((p) => (
          <div key={p.label}>
            <dt className="text-muted flex items-center gap-2 text-xs font-semibold">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
              {p.label}
            </dt>
            <dd className="text-default mt-1 text-lg font-bold tabular-nums">
              {formatPrice(p.value)}
            </dd>
            <dd className="text-muted text-xs tabular-nums">
              {Math.round((p.value / total) * 100)}% of total
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  )
}

/* ------------------- magnitude bars (one hue) ------------------- */

export function MagnitudeBars({
  data,
  title,
  valueFormat = (v: number) => String(v),
  className,
}: {
  data: { label: string; value: number }[]
  title: string
  valueFormat?: (v: number) => string
  className?: string
}) {
  const viz = useViz()
  return (
    <figure className={cn('w-full', className)}>
      <figcaption className="text-default mb-3 text-sm font-bold">{title}</figcaption>
      <div style={{ height: Math.max(data.length * 34 + 10, 120) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 76, bottom: 0, left: 0 }}
            barCategoryGap={6}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              {...axisProps}
              width={96}
              tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
            />
            <RTooltip
              cursor={{ fill: 'var(--surface-2)' }}
              content={<TooltipCard valueFormat={valueFormat} />}
            />
            <Bar dataKey="value" name={title} radius={[0, 4, 4, 0]} fill={viz[0]}>
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v: unknown) => valueFormat(Number(v))}
                className="fill-[var(--text-muted)] text-[11px] font-bold"
              />
              {data.map((_, i) => (
                <Cell key={i} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}

/* ------------------- activity over time (single series) ------------------- */

export function ActivityChart({
  data,
  title,
  className,
}: {
  data: { label: string; value: number }[]
  title: string
  className?: string
}) {
  const viz = useViz()
  return (
    <figure className={cn('w-full', className)}>
      <figcaption className="text-default mb-3 text-sm font-bold">{title}</figcaption>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="act-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={viz[0]} stopOpacity={0.26} />
                <stop offset="100%" stopColor={viz[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={24} />
            <YAxis {...axisProps} width={40} allowDecimals={false} />
            <RTooltip
              cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
              content={<TooltipCard valueFormat={(v) => `${v} views`} />}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={title}
              stroke={viz[0]}
              strokeWidth={2}
              fill="url(#act-fill)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--surface)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}
