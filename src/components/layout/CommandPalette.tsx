import {
  Building2,
  Calculator,
  CornerDownLeft,
  Heart,
  LayoutDashboard,
  MapPin,
  Moon,
  Scale,
  Search,
  Sun,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LISTINGS, NEIGHBORHOODS } from '@/lib/data'
import { useStore } from '@/lib/store'
import { cn, formatPriceLabel } from '@/lib/utils'
import { Dialog } from '@/components/ui/overlay'
import * as DialogPrimitive from '@radix-ui/react-dialog'

interface Cmd {
  id: string
  label: string
  hint?: string
  icon: ReactNode
  group: string
  run: () => void
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate()
  const { toggleTheme, theme } = useStore()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const go = (to: string) => () => {
    onOpenChange(false)
    navigate(to)
  }

  const commands = useMemo<Cmd[]>(() => {
    const q = query.trim().toLowerCase()

    const pages: Cmd[] = [
      { id: 'p-buy', label: 'Browse homes for sale', icon: <Building2 />, group: 'Go to', run: go('/search?deal=buy') },
      { id: 'p-rent', label: 'Browse rentals', icon: <Building2 />, group: 'Go to', run: go('/search?deal=rent') },
      { id: 'p-saved', label: 'Saved homes & alerts', icon: <Heart />, group: 'Go to', run: go('/saved') },
      { id: 'p-compare', label: 'Compare homes', icon: <Scale />, group: 'Go to', run: go('/compare') },
      { id: 'p-dash', label: 'Your dashboard', icon: <LayoutDashboard />, group: 'Go to', run: go('/dashboard') },
      { id: 'p-agents', label: 'Find an agent', icon: <Users />, group: 'Go to', run: go('/agents') },
      { id: 'p-mortgage', label: 'Mortgage calculator', icon: <Calculator />, group: 'Go to', run: go('/mortgage') },
      {
        id: 'a-theme',
        label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
        icon: theme === 'dark' ? <Sun /> : <Moon />,
        group: 'Actions',
        run: () => {
          toggleTheme()
          onOpenChange(false)
        },
      },
    ]

    const areas: Cmd[] = NEIGHBORHOODS.filter((n) => !q || n.name.toLowerCase().includes(q))
      .slice(0, q ? 5 : 4)
      .map((n) => ({
        id: `n-${n.id}`,
        label: n.name,
        hint: `${n.listings} homes · ${n.city}`,
        icon: <MapPin />,
        group: 'Neighbourhoods',
        run: go(`/search?q=${encodeURIComponent(n.name)}`),
      }))

    const homes: Cmd[] = q
      ? LISTINGS.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.neighborhood.toLowerCase().includes(q) ||
            l.address.toLowerCase().includes(q),
        )
          .slice(0, 6)
          .map((l) => ({
            id: `l-${l.id}`,
            label: l.title,
            hint: `${formatPriceLabel(l.price, l.deal)} · ${l.neighborhood}`,
            icon: <Building2 />,
            group: 'Homes',
            run: go(`/listing/${l.id}`),
          }))
      : []

    const filteredPages = pages.filter((p) => !q || p.label.toLowerCase().includes(q))

    const search: Cmd[] = q
      ? [
          {
            id: 'search-all',
            label: `Search all listings for “${query.trim()}”`,
            icon: <Search />,
            group: 'Search',
            run: go(`/search?q=${encodeURIComponent(query.trim())}`),
          },
        ]
      : []

    return [...search, ...homes, ...areas, ...filteredPages]
  }, [query, theme])

  useEffect(() => setCursor(0), [query])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => (c + 1) % Math.max(commands.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => (c - 1 + commands.length) % Math.max(commands.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commands[cursor]?.run()
    }
  }

  let lastGroup = ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[oklch(0.15_0.01_70/0.55)] backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          className="bg-surface border-default fixed top-[12vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border shadow-pop data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-4"
        >
          <DialogPrimitive.Title className="sr-only">Search and commands</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search homes and neighbourhoods, or jump to a page.
          </DialogPrimitive.Description>

          <div className="border-default flex items-center gap-3 border-b px-4">
            <Search className="text-muted size-[18px] shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search homes, areas, or jump to a page…"
              className="text-default placeholder:text-[var(--text-muted)] h-14 w-full bg-transparent text-base outline-none"
            />
            <kbd className="bg-surface-2 text-muted hidden rounded px-1.5 py-1 text-[10px] font-semibold sm:block">
              ESC
            </kbd>
          </div>

          <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
            {commands.length === 0 && (
              <p className="text-muted px-3 py-10 text-center text-sm">
                No matches for “{query}”.
              </p>
            )}
            {commands.map((cmd, i) => {
              const showGroup = cmd.group !== lastGroup
              lastGroup = cmd.group
              return (
                <div key={cmd.id}>
                  {showGroup && (
                    <div className="text-muted px-3 pt-3 pb-1.5 text-[11px] font-bold tracking-wider uppercase">
                      {cmd.group}
                    </div>
                  )}
                  <button
                    type="button"
                    data-index={i}
                    onMouseMove={() => setCursor(i)}
                    onClick={cmd.run}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors',
                      i === cursor ? 'bg-surface-2' : 'bg-transparent',
                    )}
                  >
                    <span className="text-muted [&_svg]:size-4">{cmd.icon}</span>
                    <span className="text-default min-w-0 flex-1 truncate text-sm font-medium">
                      {cmd.label}
                    </span>
                    {cmd.hint && <span className="text-muted shrink-0 text-xs">{cmd.hint}</span>}
                    {i === cursor && <CornerDownLeft className="text-muted size-3.5 shrink-0" />}
                  </button>
                </div>
              )
            })}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  )
}
