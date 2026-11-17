import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/* ------------------------------- Dialog ------------------------------ */

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

const overlayClass =
  'fixed inset-0 z-50 bg-[oklch(0.15_0.01_70/0.55)] backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out'

export function DialogContent({
  className,
  children,
  title,
  description,
  size = 'md',
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}) {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[min(96vw,1400px)]',
  }
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClass} />
      <DialogPrimitive.Content
        className={cn(
          'bg-surface border-default fixed top-1/2 left-1/2 z-50 flex max-h-[92vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border shadow-pop',
          'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          widths[size],
          className,
        )}
        {...props}
      >
        <div className="border-default flex items-start justify-between gap-4 border-b px-6 py-4">
          <div className="min-w-0">
            <DialogPrimitive.Title className="font-display text-default truncate text-lg font-semibold">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-muted mt-0.5 text-sm">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Close"
            className="text-muted hover:bg-surface-2 hover:text-default -mr-2 -mt-1 rounded-md p-2 transition-colors"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

/* ------------------------- Sheet (side drawer) ----------------------- */

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export function SheetContent({
  side = 'right',
  className,
  children,
  title,
  description,
  footer,
}: {
  side?: 'left' | 'right' | 'bottom'
  className?: string
  children: ReactNode
  title: string
  description?: string
  footer?: ReactNode
}) {
  const sides = {
    left: 'inset-y-0 left-0 h-full w-[min(92vw,26rem)] border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
    right:
      'inset-y-0 right-0 h-full w-[min(92vw,26rem)] border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
    bottom:
      'inset-x-0 bottom-0 max-h-[88vh] rounded-t-2xl border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
  }
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClass} />
      <DialogPrimitive.Content
        className={cn(
          'bg-surface border-default fixed z-50 flex flex-col shadow-pop duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out',
          sides[side],
          className,
        )}
      >
        <div className="border-default flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <DialogPrimitive.Title className="font-display text-default text-lg font-semibold">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-muted mt-0.5 text-sm">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            aria-label="Close"
            className="text-muted hover:bg-surface-2 hover:text-default -mr-2 -mt-1 rounded-md p-2 transition-colors"
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-default bg-surface border-t p-4">{footer}</div>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

/* ------------------------------ Tooltip ------------------------------ */

export const TooltipProvider = TooltipPrimitive.Provider

export function Tooltip({
  children,
  content,
  side = 'top',
}: {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="bg-sand-900 text-sand-50 dark:bg-sand-100 dark:text-sand-900 z-50 max-w-xs rounded-md px-2.5 py-1.5 text-xs font-medium shadow-lift data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in data-[state=delayed-open]:zoom-in-95"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

/* ------------------------------ Popover ------------------------------ */

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 8,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-surface border-default z-50 rounded-lg border p-4 shadow-pop outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

/* --------------------------- Dropdown menu --------------------------- */

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownMenuTrigger = DropdownPrimitive.Trigger

export function DropdownMenuContent({
  className,
  align = 'end',
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-surface border-default z-50 min-w-48 overflow-hidden rounded-lg border p-1.5 shadow-pop',
          'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Item>) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'text-default flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm font-medium outline-none select-none',
        'data-highlighted:bg-surface-2 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:text-[var(--text-muted)]',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Label>) {
  return (
    <DropdownPrimitive.Label
      className={cn('text-muted px-2.5 py-1.5 text-[11px] font-bold tracking-wider uppercase', className)}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Separator>) {
  return (
    <DropdownPrimitive.Separator
      className={cn('bg-[var(--border)] -mx-1.5 my-1.5 h-px', className)}
      {...props}
    />
  )
}
