import { AnimatePresence, motion } from 'motion/react'
import { Scale, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getListing } from '@/lib/data'
import { COMPARE_LIMIT, useStore } from '@/lib/store'
import { formatPriceLabel } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SmartImage } from '@/components/ui/smart-image'

/** Docked tray that collects homes as you shortlist them for comparison. */
export function CompareBar() {
  const { compare, toggleCompare, clearCompare } = useStore()
  const { pathname } = useLocation()
  const hidden = pathname === '/compare'

  return (
    <AnimatePresence>
      {compare.length > 0 && !hidden && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6"
        >
          <div className="glass border-default mx-auto flex max-w-4xl items-center gap-4 rounded-xl border p-3 shadow-pop">
            <div className="text-muted hidden shrink-0 items-center gap-2 pl-2 text-sm font-semibold sm:flex">
              <Scale className="size-4" />
              Compare
              <span className="tabular-nums">
                {compare.length}/{COMPARE_LIMIT}
              </span>
            </div>

            <ul className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
              {compare.map((id) => {
                const l = getListing(id)
                if (!l) return null
                return (
                  <li
                    key={id}
                    className="bg-surface border-default flex shrink-0 items-center gap-2 rounded-lg border p-1.5 pr-2"
                  >
                    <SmartImage
                      src={l.images[0]}
                      alt=""
                      wrapperClassName="size-10 rounded-md shrink-0"
                    />
                    <div className="hidden min-w-0 md:block">
                      <p className="text-default max-w-32 truncate text-xs font-semibold">
                        {l.neighborhood}
                      </p>
                      <p className="text-muted text-[11px]">{formatPriceLabel(l.price, l.deal)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCompare(id)}
                      aria-label={`Remove ${l.title} from compare`}
                      className="text-muted hover:bg-surface-2 hover:text-default rounded p-1 transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearCompare} className="hidden sm:inline-flex">
                Clear
              </Button>
              <Button asChild size="sm" disabled={compare.length < 2}>
                <Link to="/compare">Compare {compare.length}</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
