import { AnimatePresence, motion } from 'motion/react'
import {
  BellPlus,
  Columns2,
  Frown,
  LayoutGrid,
  Map as MapIcon,
  Search as SearchIcon,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ListingCard, ListingCardSkeleton } from '@/components/listing/ListingCard'
import { FilterPanel } from '@/components/listing/FilterPanel'
import { MapPane } from '@/components/listing/MapPane'
import { LISTINGS } from '@/lib/data'
import {
  DEFAULT_FILTERS,
  PRICE_BOUNDS,
  SORT_OPTIONS,
  activeFilterCount,
  applyFilters,
  filtersToParams,
  paramsToFilters,
} from '@/lib/filters'
import { useStore } from '@/lib/store'
import type { Filters } from '@/lib/types'
import { cn, formatNumber } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Segmented, Select } from '@/components/ui/controls'
import { Badge, EmptyState } from '@/components/ui/primitives'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/overlay'

type View = 'grid' | 'split' | 'map'
const PAGE_SIZE = 12

export function Search() {
  const [params, setParams] = useSearchParams()
  const { addSearch } = useStore()
  const [view, setView] = useState<View>('split')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filterSheet, setFilterSheet] = useState(false)

  const filters = useMemo(() => paramsToFilters(params), [params])

  // Brief skeleton pass whenever the query changes — makes the result swap
  // legible instead of making the grid flicker.
  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => setLoading(false), 320)
    return () => window.clearTimeout(t)
  }, [params])

  useEffect(() => setPage(1), [params])

  const update = useCallback(
    (next: Partial<Filters>) => {
      const merged: Filters = { ...filters, ...next }
      // Switching buy↔rent changes the price scale entirely, so reset the range.
      if (next.deal && next.deal !== filters.deal) {
        merged.min = PRICE_BOUNDS[next.deal].min
        merged.max = PRICE_BOUNDS[next.deal].max
      }
      setParams(filtersToParams(merged), { replace: true })
    },
    [filters, setParams],
  )

  const results = useMemo(() => applyFilters(LISTINGS, filters), [filters])

  // Per-neighbourhood counts for the current query, ignoring the area filter
  // itself so the numbers don't collapse to zero as you tick boxes.
  const counts = useMemo(() => {
    const scoped = applyFilters(LISTINGS, { ...filters, neighborhoods: [] })
    return scoped.reduce<Record<string, number>>((acc, l) => {
      acc[l.neighborhood] = (acc[l.neighborhood] ?? 0) + 1
      return acc
    }, {})
  }, [filters])

  const visible = results.slice(0, page * PAGE_SIZE)
  const activeCount = activeFilterCount(filters)
  const mapListings = results.slice(0, 80)

  const heading = filters.q
    ? `${filters.deal === 'rent' ? 'Rentals' : 'Homes for sale'} in ${filters.q}`
    : filters.deal === 'rent'
      ? 'Rentals across Kenya'
      : 'Homes for sale across Kenya'

  const filterPanel = (
    <FilterPanel filters={filters} onChange={update} counts={counts} />
  )

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      {/* ------------- query bar ------------- */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            value={filters.deal}
            onChange={(deal) => update({ deal })}
            options={[
              { value: 'buy', label: 'Buy' },
              { value: 'rent', label: 'Rent' },
            ]}
          />

          <div className="relative min-w-56 flex-1">
            <SearchIcon className="text-muted pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2" />
            <input
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Area, street or landmark"
              aria-label="Search listings"
              className="bg-surface border-default text-default placeholder:text-[var(--text-muted)] h-11 w-full rounded-md border pr-10 pl-11 text-sm outline-none focus:border-[var(--ring)]"
            />
            {filters.q && (
              <button
                type="button"
                onClick={() => update({ q: '' })}
                aria-label="Clear search"
                className="text-muted hover:text-default absolute top-1/2 right-3 -translate-y-1/2"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Sheet open={filterSheet} onOpenChange={setFilterSheet}>
            <SheetTrigger asChild>
              <Button variant="secondary" className="lg:hidden">
                <SlidersHorizontal />
                Filters
                {activeCount > 0 && (
                  <Badge variant="solid" className="ml-1">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              title="Filters"
              description={`${formatNumber(results.length)} homes match`}
              footer={
                <Button className="w-full" onClick={() => setFilterSheet(false)}>
                  Show {formatNumber(results.length)} homes
                </Button>
              }
            >
              {filterPanel}
            </SheetContent>
          </Sheet>

          <Select
            value={filters.sort}
            onChange={(sort) => update({ sort })}
            options={SORT_OPTIONS}
            ariaLabel="Sort results"
            className="w-44"
          />

          <Segmented
            value={view}
            onChange={setView}
            size="sm"
            className="hidden lg:inline-flex"
            options={[
              { value: 'grid', label: '', icon: <LayoutGrid /> },
              { value: 'split', label: '', icon: <Columns2 /> },
              { value: 'map', label: '', icon: <MapIcon /> },
            ]}
          />
        </div>

        {/* ------------- heading row ------------- */}
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="font-display text-default text-2xl font-semibold tracking-tight">
              {heading}
            </h1>
            <p className="text-muted mt-1 text-sm">
              {loading ? 'Searching…' : `${formatNumber(results.length)} results`}
              {activeCount > 0 && ` · ${activeCount} filter${activeCount > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  update({ ...DEFAULT_FILTERS, q: filters.q, deal: filters.deal, sort: filters.sort })
                }
              >
                Clear filters
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                addSearch(
                  heading,
                  `?${filtersToParams(filters).toString()}`,
                )
              }
            >
              <BellPlus /> Save this search
            </Button>
          </div>
        </div>
      </div>

      {/* ------------- body ------------- */}
      <div
        className={cn(
          'mt-6 grid gap-6',
          view === 'map' ? 'lg:grid-cols-[18rem_1fr]' : 'lg:grid-cols-[18rem_1fr]',
        )}
      >
        {/* sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-surface border-default sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border">
            {filterPanel}
          </div>
        </aside>

        {/* results */}
        <div className="min-w-0">
          {view === 'map' ? (
            <MapPane
              listings={mapListings}
              activeId={activeId}
              onActiveChange={setActiveId}
              className="h-[calc(100vh-13rem)] min-h-125"
            />
          ) : (
            <div
              className={cn(
                'grid gap-6',
                view === 'split' ? 'xl:grid-cols-[1fr_minmax(22rem,40%)]' : '',
              )}
            >
              <div className="min-w-0">
                {loading ? (
                  <div
                    className={cn(
                      'grid gap-6',
                      view === 'split'
                        ? 'sm:grid-cols-2'
                        : 'sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
                    )}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ListingCardSkeleton key={i} />
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <EmptyState
                    icon={<Frown />}
                    title="Nothing matches — yet"
                    description="Try widening the price range, dropping a filter, or searching a neighbouring area."
                    action={
                      <Button
                        onClick={() =>
                          update({
                            ...DEFAULT_FILTERS,
                            deal: filters.deal,
                            sort: filters.sort,
                          })
                        }
                      >
                        Reset everything
                      </Button>
                    }
                  />
                ) : (
                  <>
                    <div
                      className={cn(
                        'grid gap-6',
                        view === 'split'
                          ? 'sm:grid-cols-2'
                          : 'sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
                      )}
                    >
                      <AnimatePresence mode="popLayout">
                        {visible.map((l, i) => (
                          <ListingCard
                            key={l.id}
                            listing={l}
                            index={i % PAGE_SIZE}
                            highlighted={activeId === l.id}
                            onHover={setActiveId}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    {visible.length < results.length && (
                      <div className="mt-10 flex flex-col items-center gap-3">
                        <p className="text-muted text-sm">
                          Showing {formatNumber(visible.length)} of {formatNumber(results.length)}
                        </p>
                        <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                          Load more homes
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {view === 'split' && (
                <div className="hidden xl:block">
                  <MapPane
                    listings={mapListings}
                    activeId={activeId}
                    onActiveChange={setActiveId}
                    className="sticky top-24 h-[calc(100vh-8rem)]"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* mobile map toggle */}
      {view !== 'map' && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-x-0 bottom-6 z-30 flex justify-center xl:hidden"
        >
          <Button
            size="sm"
            className="shadow-pop"
            onClick={() => {
              setView('map')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          >
            <MapIcon /> Show map
          </Button>
        </motion.div>
      )}
    </div>
  )
}
