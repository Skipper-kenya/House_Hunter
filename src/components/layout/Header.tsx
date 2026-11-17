import { AnimatePresence, motion } from 'motion/react'
import {
  Building2,
  Calculator,
  Heart,
  LayoutDashboard,
  Menu,
  Moon,
  Scale,
  Search,
  Sun,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/primitives'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
} from '@/components/ui/overlay'
import { Avatar } from '@/components/ui/primitives'

const NAV = [
  { to: '/search?deal=buy', label: 'Buy', match: '/search' },
  { to: '/search?deal=rent', label: 'Rent', match: '/rent-never' },
  { to: '/neighbourhoods', label: 'Neighbourhoods' },
  { to: '/agents', label: 'Agents' },
  { to: '/mortgage', label: 'Mortgage' },
]

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('group flex items-center gap-2.5', className)}>
      <span className="bg-brand text-on-brand grid size-9 place-items-center rounded-lg shadow-soft transition-transform group-hover:-rotate-6">
        <Building2 className="size-5" />
      </span>
      <span className="font-display text-default text-lg leading-none font-bold tracking-tight">
        House<span className="text-brand">Hunter</span>
      </span>
    </Link>
  )
}

export function Header({ onOpenCommand }: { onOpenCommand: () => void }) {
  const { theme, toggleTheme, saved, compare } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname, location.search])

  const dealParam = new URLSearchParams(location.search).get('deal') ?? 'buy'
  const isActive = (item: (typeof NAV)[number]) => {
    if (item.label === 'Buy') return location.pathname === '/search' && dealParam === 'buy'
    if (item.label === 'Rent') return location.pathname === '/search' && dealParam === 'rent'
    return location.pathname.startsWith(item.to.split('?')[0])
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300',
        scrolled ? 'glass border-default border-b shadow-soft' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                isActive(item)
                  ? 'text-brand bg-brand-soft'
                  : 'text-muted hover:text-default hover:bg-surface-2',
              )}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCommand}
            className="bg-surface-2 border-default text-muted hover:text-default hidden h-10 items-center gap-2.5 rounded-md border px-3 text-sm transition-colors md:flex"
          >
            <Search className="size-4" />
            <span className="pr-6">Search homes…</span>
            <kbd className="bg-surface border-default text-muted rounded border px-1.5 py-0.5 font-sans text-[10px] font-semibold">
              ⌘K
            </kbd>
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onOpenCommand}
            aria-label="Search"
          >
            <Search />
          </Button>

          <Tooltip content="Compare">
            <Link
              to="/compare"
              aria-label={`Compare (${compare.length})`}
              className="text-muted hover:bg-surface-2 hover:text-default relative hidden size-10 place-items-center rounded-md transition-colors sm:grid"
            >
              <Scale className="size-[18px]" />
              {compare.length > 0 && (
                <Badge
                  variant="solid"
                  className="absolute -top-0.5 -right-0.5 size-4.5 justify-center p-0 text-[10px]"
                >
                  {compare.length}
                </Badge>
              )}
            </Link>
          </Tooltip>

          <Tooltip content="Saved homes">
            <Link
              to="/saved"
              aria-label={`Saved homes (${saved.length})`}
              className="text-muted hover:bg-surface-2 hover:text-default relative grid size-10 place-items-center rounded-md transition-colors"
            >
              <Heart className="size-[18px]" />
              {saved.length > 0 && (
                <Badge
                  variant="solid"
                  className="absolute -top-0.5 -right-0.5 size-4.5 justify-center p-0 text-[10px]"
                >
                  {saved.length}
                </Badge>
              )}
            </Link>
          </Tooltip>

          <Tooltip content={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                  className="grid place-items-center"
                >
                  {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
                </motion.span>
              </AnimatePresence>
            </Button>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Your account"
                className="ml-0.5 hidden rounded-full outline-offset-2 sm:block"
              >
                <Avatar name="Amos K" src="" className="size-9 ring-2 ring-[var(--border)]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Signed in as Amos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/dashboard')}>
                <LayoutDashboard /> Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/saved')}>
                <Heart /> Saved & alerts
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/agents')}>
                <Users /> Find an agent
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/mortgage')}>
                <Calculator /> Mortgage tools
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/list-your-property')}>
                <UserRound /> List your property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild size="sm" className="ml-1 hidden xl:inline-flex">
            <Link to="/list-your-property">List a property</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Menu"
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass border-default overflow-hidden border-b lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-default hover:bg-surface-2 rounded-md px-3 py-2.5 text-sm font-semibold"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/dashboard"
                className="text-default hover:bg-surface-2 rounded-md px-3 py-2.5 text-sm font-semibold"
              >
                Dashboard
              </Link>
              <Button asChild className="mt-2">
                <Link to="/list-your-property">List a property</Link>
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
