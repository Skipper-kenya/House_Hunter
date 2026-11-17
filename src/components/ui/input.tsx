import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'bg-surface border-default text-default placeholder:text-[var(--text-muted)] w-full rounded-md border px-3.5 text-sm transition-[border-color,box-shadow] outline-none focus:border-[var(--ring)] focus:ring-4 focus:ring-[color-mix(in_oklab,var(--ring)_18%,transparent)] disabled:opacity-50'

export function Input({
  className,
  icon,
  suffix,
  ...props
}: ComponentProps<'input'> & { icon?: ReactNode; suffix?: ReactNode }) {
  if (!icon && !suffix) {
    return <input className={cn(fieldBase, 'h-11', className)} {...props} />
  }
  return (
    <div className="relative flex items-center">
      {icon && (
        <span className="text-muted pointer-events-none absolute left-3.5 flex items-center [&_svg]:size-[18px]">
          {icon}
        </span>
      )}
      <input
        className={cn(fieldBase, 'h-11', icon && 'pl-11', suffix && 'pr-12', className)}
        {...props}
      />
      {suffix && (
        <span className="text-muted absolute right-3.5 text-sm font-medium">{suffix}</span>
      )}
    </div>
  )
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(fieldBase, 'min-h-28 resize-y py-3', className)} {...props} />
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      className={cn('text-default mb-1.5 block text-sm font-semibold', className)}
      {...props}
    />
  )
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
}: {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
  htmlFor?: string
}) {
  return (
    <div className={cn('w-full', className)}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-muted mt-1.5 text-xs">{hint}</p>
      ) : null}
    </div>
  )
}
