import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { cn, clamp, initials } from '@/lib/utils'

/* ------------------------------- Badge ------------------------------- */

const badge = cva(
  'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap [&_svg]:size-3.5',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-2 text-muted',
        brand: 'bg-brand-soft text-brand',
        solid: 'bg-brand text-on-brand',
        accent: 'bg-clay-100 text-clay-800 dark:bg-clay-900 dark:text-clay-200',
        success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        warn: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
        outline: 'border border-strong text-muted',
        glass: 'glass text-default shadow-soft',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'sm' },
  },
)

export function Badge({
  className,
  variant,
  size,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ variant, size }), className)} {...props} />
}

/* ------------------------------- Card -------------------------------- */

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-surface border-default rounded-xl border shadow-soft',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-0', className)} {...props} />
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('text-default text-base font-bold', className)} {...props} />
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-muted text-sm', className)} {...props} />
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-5', className)} {...props} />
}

/* ----------------------------- Skeleton ------------------------------ */

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('skeleton rounded-md', className)} {...props} />
}

/* ----------------------------- Separator ----------------------------- */

export function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: ComponentProps<'div'> & { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'bg-[var(--border)]',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}

/* ------------------------------ Avatar ------------------------------- */

export function Avatar({
  src,
  name,
  className,
}: {
  src?: string
  name: string
  className?: string
}) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'bg-surface-2 relative flex size-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={name}
        className="size-full object-cover"
      />
      <AvatarPrimitive.Fallback className="text-muted flex size-full items-center justify-center text-xs font-bold">
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

/* ------------------------------ Progress ----------------------------- */

export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number
  className?: string
  barClassName?: string
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('bg-surface-2 h-1.5 w-full overflow-hidden rounded-full', className)}
    >
      <div
        className={cn('bg-brand h-full rounded-full transition-[width] duration-700 ease-out', barClassName)}
        style={{ width: `${clamp(value, 0, 100)}%` }}
      />
    </div>
  )
}

/* ----------------------------- EmptyState ---------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-default flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="bg-surface-2 text-muted mb-4 flex size-14 items-center justify-center rounded-full [&_svg]:size-6">
          {icon}
        </div>
      )}
      <h3 className="text-default font-display text-xl font-semibold">{title}</h3>
      {description && (
        <p className="text-muted mt-2 max-w-sm text-sm text-pretty">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/* ------------------------------- Stat -------------------------------- */

export function Stat({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-surface border-default rounded-lg border p-4', className)}>
      <div className="text-muted flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
        {icon && <span className="[&_svg]:size-4">{icon}</span>}
        {label}
      </div>
      <div className="text-default font-display mt-2 text-2xl font-semibold tabular-nums">
        {value}
      </div>
      {hint && <div className="text-muted mt-1 text-xs">{hint}</div>}
    </div>
  )
}
