import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const button = cva(
  'relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background-color,color,box-shadow,transform,border-color] duration-200 outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-on-brand shadow-soft hover:brightness-110 hover:shadow-lift',
        secondary:
          'bg-surface text-default border border-strong shadow-soft hover:bg-surface-2',
        outline: 'border border-strong text-default hover:bg-surface-2',
        ghost: 'text-muted hover:bg-surface-2 hover:text-default',
        soft: 'bg-brand-soft text-brand hover:brightness-95 dark:hover:brightness-125',
        accent: 'bg-clay-600 text-white shadow-soft hover:bg-clay-700 hover:shadow-lift',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        link: 'text-brand underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-8 rounded-xs px-2.5 text-xs [&_svg]:size-3.5',
        sm: 'h-9 rounded-sm px-3.5 text-sm [&_svg]:size-4',
        md: 'h-11 rounded-md px-5 text-sm [&_svg]:size-[18px]',
        lg: 'h-13 rounded-lg px-7 text-base [&_svg]:size-5',
        icon: 'size-10 rounded-md [&_svg]:size-[18px]',
        'icon-sm': 'size-8 rounded-xs [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof button> {
  asChild?: boolean
  loading?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(button({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { button as buttonVariants }
