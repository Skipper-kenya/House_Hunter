import { Mail, MapPin, Phone } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import { NEIGHBORHOODS } from '@/lib/data'
import { Logo } from './Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const COLUMNS = [
  {
    title: 'Buy',
    links: [
      { label: 'Homes for sale', to: '/search?deal=buy' },
      { label: 'New developments', to: '/search?deal=buy&sort=newest' },
      { label: 'Land & plots', to: '/search?deal=buy&type=land' },
      { label: 'Mortgage calculator', to: '/mortgage' },
      { label: 'Compare homes', to: '/compare' },
    ],
  },
  {
    title: 'Rent',
    links: [
      { label: 'Apartments to let', to: '/search?deal=rent&type=apartment' },
      { label: 'Furnished rentals', to: '/search?deal=rent&furnished=1' },
      { label: 'Pet-friendly homes', to: '/search?deal=rent&pets=1' },
      { label: 'Short lets', to: '/search?deal=rent&type=studio' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Find an agent', to: '/agents' },
      { label: 'List your property', to: '/list-your-property' },
      { label: 'Neighbourhood guides', to: '/neighbourhoods' },
      { label: 'Your dashboard', to: '/dashboard' },
    ],
  },
]

/* Brand glyphs — lucide dropped its brand set, so these ship inline. */
type GlyphProps = ComponentProps<'svg'>

const Glyph = ({ d, ...props }: GlyphProps & { d: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d={d} />
  </svg>
)

const SOCIALS = [
  {
    label: 'X',
    d: 'M18.9 2.5h3.3l-7.2 8.2 8.5 11.3h-6.7l-5.2-6.9-6 6.9H2.3l7.7-8.8L1.9 2.5h6.9l4.7 6.3zm-1.2 17.6h1.8L7.4 4.3H5.4z',
  },
  {
    label: 'Instagram',
    d: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9s.7.8.9 1.4c.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4s-.8.7-1.4.9c-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9s-.7-.8-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4s.8-.7 1.4-.9c.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.3a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 10.7a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.8-11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
  },
  {
    label: 'Facebook',
    d: 'M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z',
  },
  {
    label: 'LinkedIn',
    d: 'M20.4 3H3.6C2.7 3 2 3.7 2 4.6v14.8c0 .9.7 1.6 1.6 1.6h16.8c.9 0 1.6-.7 1.6-1.6V4.6c0-.9-.7-1.6-1.6-1.6zM8.3 18.3H5.4V9.7h2.9v8.6zM6.9 8.5a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zm11.7 9.8h-2.9v-4.2c0-1-.4-1.7-1.3-1.7-.7 0-1.1.5-1.3 1-.1.2-.1.4-.1.7v4.2h-2.9s0-7 0-8.6h2.9v1.2c.4-.6 1.1-1.4 2.6-1.4 1.9 0 3.3 1.2 3.3 3.9v4.9z',
  },
]

export function Footer() {
  return (
    <footer className="bg-subtle border-default mt-24 border-t">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo />
            <p className="text-muted mt-4 text-sm text-pretty">
              Kenya&rsquo;s house hunt, in one place. Verified listings, agents who answer, and the
              numbers you actually need before you commit.
            </p>

            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault()
                e.currentTarget.reset()
              }}
            >
              <label htmlFor="footer-email" className="text-default mb-2 block text-sm font-semibold">
                New listings, once a week
              </label>
              <div className="flex gap-2">
                <Input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  icon={<Mail />}
                />
                <Button type="submit" className="shrink-0">
                  Subscribe
                </Button>
              </div>
            </form>

            <div className="text-muted mt-6 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="size-4" /> Delta Corner, Westlands, Nairobi
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4" /> +254 20 000 1234
              </p>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-default text-sm font-bold">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-muted hover:text-brand text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-default mt-12 border-t pt-8">
          <h2 className="text-muted text-xs font-bold tracking-wider uppercase">
            Popular areas
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {NEIGHBORHOODS.map((n) => (
              <li key={n.id}>
                <Link
                  to={`/search?q=${encodeURIComponent(n.name)}`}
                  className="text-muted hover:text-brand text-sm transition-colors"
                >
                  Property in {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-default mt-10 flex flex-col-reverse items-center justify-between gap-6 border-t pt-8 sm:flex-row">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} HouseHunter Ltd. Listings are illustrative demo data.
          </p>
          <div className="flex items-center gap-1">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                onClick={(e) => e.preventDefault()}
                className="text-muted hover:bg-surface-2 hover:text-default grid size-9 place-items-center rounded-md transition-colors"
              >
                <Glyph d={s.d} className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
