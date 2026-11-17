import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as SelectPrimitive from '@radix-ui/react-select'
import * as SliderPrimitive from '@radix-ui/react-slider'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { Check, ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/* -------------------------------- Tabs ------------------------------- */

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'border-default no-scrollbar flex items-center gap-1 overflow-x-auto border-b',
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'text-muted data-[state=active]:text-default relative -mb-px shrink-0 border-b-2 border-transparent px-4 py-3 text-sm font-semibold transition-colors',
        'hover:text-default data-[state=active]:border-[var(--brand)]',
        className,
      )}
      {...props}
    />
  )
}

export const TabsContent = TabsPrimitive.Content

/* ----------------------------- Segmented ----------------------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = 'md',
  id,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: ReactNode; icon?: ReactNode }[]
  className?: string
  size?: 'sm' | 'md'
  id?: string
}) {
  const layoutId = useId()
  return (
    <div
      role="tablist"
      id={id}
      className={cn(
        'bg-surface-2 border-default inline-flex items-center gap-1 rounded-lg border p-1',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative flex items-center justify-center gap-1.5 rounded-md font-semibold whitespace-nowrap transition-colors [&_svg]:size-4',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
              active ? 'text-default' : 'text-muted hover:text-default',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${layoutId}`}
                className="bg-surface absolute inset-0 rounded-md shadow-soft"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.icon}
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------- Switch ------------------------------ */

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'bg-surface-2 border-default data-[state=checked]:bg-brand relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors data-[state=checked]:border-transparent',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-4.5 translate-x-0.5 rounded-full bg-white shadow-soft transition-transform duration-200 data-[state=checked]:translate-x-[1.4rem]" />
    </SwitchPrimitive.Root>
  )
}

export function SwitchField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="text-default block text-sm font-semibold">{label}</span>
        {description && <span className="text-muted mt-0.5 block text-xs">{description}</span>}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

/* ------------------------------ Checkbox ----------------------------- */

export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'border-strong data-[state=checked]:bg-brand grid size-5 shrink-0 place-items-center rounded-xs border transition-colors data-[state=checked]:border-transparent',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-on-brand">
        <Check className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export function CheckboxField({
  label,
  checked,
  onCheckedChange,
  count,
}: {
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
  count?: number
}) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className="hover:bg-surface-2 -mx-2 flex cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5 transition-colors"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
      <span className="text-default flex-1 text-sm">{label}</span>
      {count !== undefined && <span className="text-muted text-xs tabular-nums">{count}</span>}
    </label>
  )
}

/* ------------------------------- Slider ------------------------------ */

export function Slider({ className, ...props }: ComponentProps<typeof SliderPrimitive.Root>) {
  const count = props.value?.length ?? props.defaultValue?.length ?? 1
  return (
    <SliderPrimitive.Root
      className={cn('relative flex w-full touch-none items-center select-none py-2', className)}
      {...props}
    >
      <SliderPrimitive.Track className="bg-surface-2 relative h-1.5 w-full grow overflow-hidden rounded-full">
        <SliderPrimitive.Range className="bg-brand absolute h-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: count }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="bg-surface border-brand block size-5 cursor-grab rounded-full border-2 shadow-lift transition-transform hover:scale-110 active:scale-95 active:cursor-grabbing"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

/* ------------------------------- Select ------------------------------ */

export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  className,
  ariaLabel,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  placeholder?: string
  className?: string
  ariaLabel?: string
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectPrimitive.Trigger
        aria-label={ariaLabel}
        className={cn(
          'bg-surface border-default text-default flex h-11 items-center justify-between gap-2 rounded-md border px-3.5 text-sm font-medium transition-colors outline-none hover:bg-surface-2 focus:border-[var(--ring)]',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="text-muted size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="bg-surface border-default z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border p-1.5 shadow-pop data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95"
        >
          <SelectPrimitive.Viewport>
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="text-default data-highlighted:bg-surface-2 data-[state=checked]:text-brand flex cursor-pointer items-center justify-between gap-3 rounded-sm px-2.5 py-2 text-sm font-medium outline-none select-none"
              >
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator>
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

/* ------------------------- Chip (toggle pill) ------------------------ */

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-all',
        active
          ? 'bg-brand text-on-brand border-transparent shadow-soft'
          : 'bg-surface border-default text-muted hover:border-strong hover:text-default',
        className,
      )}
    >
      {children}
    </button>
  )
}
