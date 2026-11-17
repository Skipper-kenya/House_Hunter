import { AnimatePresence, motion } from 'motion/react'
import { Crosshair, Heart, Layers, Minus, Plus, X } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/lib/store'
import type { Listing } from '@/lib/types'
import { clamp, cn, formatArea, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SmartImage } from '@/components/ui/smart-image'
import { Tooltip } from '@/components/ui/overlay'

/* Decorative landmarks, placed in projected space so they pan and zoom with
   the pins. Purely visual — they give the canvas somewhere for the eye to rest. */
const LANDMARKS = [
  { x: 0.18, y: 0.3, w: 0.22, h: 0.18, kind: 'park', label: 'Karura Forest' },
  { x: 0.62, y: 0.68, w: 0.16, h: 0.13, kind: 'park', label: 'Nairobi N.P.' },
  { x: 0.46, y: 0.12, w: 0.1, h: 0.08, kind: 'water', label: '' },
] as const

/** Projected position in canvas percentages, with the pin's own label width
 *  kept clear of the edges. */
function project(listings: Listing[]) {
  if (!listings.length) return (_: { lat: number; lng: number }) => ({ x: 50, y: 50 })

  const lats = listings.map((l) => l.lat)
  const lngs = listings.map((l) => l.lng)
  const spanLat = Math.max(...lats) - Math.min(...lats)
  const spanLng = Math.max(...lngs) - Math.min(...lngs)

  // A minimum span stops two nearby pins from being flung to opposite corners,
  // and the proportional pad keeps a wide result set off the edges.
  const padLat = Math.max(spanLat * 0.2, 0.012)
  const padLng = Math.max(spanLng * 0.2, 0.016)

  const y0 = Math.min(...lats) - padLat
  const y1 = Math.max(...lats) + padLat
  const x0 = Math.min(...lngs) - padLng
  const x1 = Math.max(...lngs) + padLng

  return (l: { lat: number; lng: number }) => ({
    x: clamp(((l.lng - x0) / (x1 - x0)) * 100, 7, 93),
    // Latitude increases northwards, screen y increases downwards.
    y: clamp((1 - (l.lat - y0) / (y1 - y0)) * 100, 6, 94),
  })
}

interface Cluster {
  x: number
  y: number
  items: Listing[]
}

/** Greedily merge pins that would overlap at the current zoom. */
function cluster(
  listings: Listing[],
  toXY: (l: { lat: number; lng: number }) => { x: number; y: number },
  zoom: number,
): Cluster[] {
  const threshold = 7 / zoom
  const points = listings.map((l) => ({ l, ...toXY(l) }))
  const taken = new Set<string>()
  const out: Cluster[] = []

  for (const p of points) {
    if (taken.has(p.l.id)) continue
    taken.add(p.l.id)
    const members = [p]
    for (const q of points) {
      if (taken.has(q.l.id)) continue
      if (Math.hypot(q.x - p.x, q.y - p.y) < threshold) {
        taken.add(q.l.id)
        members.push(q)
      }
    }
    out.push({
      x: members.reduce((s, m) => s + m.x, 0) / members.length,
      y: members.reduce((s, m) => s + m.y, 0) / members.length,
      items: members.map((m) => m.l),
    })
  }
  return out
}

export function MapPane({
  listings,
  activeId,
  onActiveChange,
  className,
}: {
  listings: Listing[]
  activeId?: string | null
  onActiveChange?: (id: string | null) => void
  className?: string
}) {
  const { isSaved, toggleSaved } = useStore()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState<string | null>(null)
  const [satellite, setSatellite] = useState(false)
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const frame = useRef<HTMLDivElement>(null)

  const toXY = useMemo(() => project(listings), [listings])
  const clusters = useMemo(() => cluster(listings, toXY, zoom), [listings, toXY, zoom])

  const reset = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  /** Zoom one step and bring a point in canvas-percent space to the centre. */
  const focus = useCallback(
    (x: number, y: number) => {
      const box = frame.current?.getBoundingClientRect()
      if (!box) return
      const next = clamp(zoom * 1.9, 1, 5)
      const cx = box.width / 2
      const cy = box.height / 2
      setZoom(next)
      setPan({
        x: -((x / 100) * box.width - cx) * next,
        y: -((y / 100) * box.height - cy) * next,
      })
    },
    [zoom],
  )

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-pin]')) return
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    setPan({
      x: drag.current.px + (e.clientX - drag.current.x),
      y: drag.current.py + (e.clientY - drag.current.y),
    })
  }
  const onPointerUp = () => {
    drag.current = null
  }

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return
    setZoom((z) => clamp(z * (e.deltaY > 0 ? 0.92 : 1.08), 1, 5))
  }

  const selectedListing = listings.find((l) => l.id === selected)

  return (
    <div
      className={cn(
        'bg-subtle border-default relative overflow-hidden rounded-xl border',
        className,
      )}
    >
      {/* canvas */}
      <div
        ref={frame}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        role="application"
        aria-label="Map of search results"
        className={cn(
          'absolute inset-0 touch-none',
          drag.current ? 'cursor-grabbing' : 'cursor-grab',
          satellite
            ? 'bg-[radial-gradient(circle_at_30%_20%,oklch(0.38_0.05_150),oklch(0.26_0.03_160))]'
            : 'map-grid bg-subtle',
        )}
      >
        <div
          className="absolute inset-0 origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: drag.current ? 'none' : 'transform 0.35s var(--ease-out-quint)',
          }}
        >
          {/* landmarks */}
          {LANDMARKS.map((lm, i) => (
            <div
              key={i}
              aria-hidden
              className={cn(
                'absolute rounded-[40%_60%_55%_45%/50%_45%_55%_50%]',
                lm.kind === 'park'
                  ? 'bg-forest-200/50 dark:bg-forest-900/50'
                  : 'bg-sky-200/50 dark:bg-sky-950/60',
              )}
              style={{
                left: `${lm.x * 100}%`,
                top: `${lm.y * 100}%`,
                width: `${lm.w * 100}%`,
                height: `${lm.h * 100}%`,
              }}
            >
              {lm.label && (
                <span className="text-muted absolute inset-0 grid place-items-center text-[10px] font-semibold tracking-wide">
                  {lm.label}
                </span>
              )}
            </div>
          ))}

          {/* pins — single listings show a price, overlapping ones collapse
              into a count that splits apart as you zoom in */}
          {clusters.map((c) => {
            const single = c.items.length === 1 ? c.items[0] : null
            const isActive = single
              ? activeId === single.id || selected === single.id
              : c.items.some((i) => i.id === activeId)

            return (
              <button
                key={single ? single.id : `c-${c.x.toFixed(3)}-${c.y.toFixed(3)}`}
                data-pin
                type="button"
                onMouseEnter={() => single && onActiveChange?.(single.id)}
                onMouseLeave={() => single && onActiveChange?.(null)}
                onClick={() =>
                  single ? setSelected((s) => (s === single.id ? null : single.id)) : focus(c.x, c.y)
                }
                aria-label={
                  single
                    ? `${single.title}, ${formatPrice(single.price)}`
                    : `${c.items.length} homes here — zoom in`
                }
                className={cn(
                  'absolute rounded-full text-xs font-bold whitespace-nowrap shadow-lift transition-[background-color,color,border-color] duration-200',
                  single ? 'px-2.5 py-1' : 'grid size-9 place-items-center',
                  isActive
                    ? 'bg-brand text-on-brand z-20'
                    : single
                      ? 'bg-surface text-default border-default z-10 border hover:bg-surface-2'
                      : 'bg-brand text-on-brand z-10 hover:brightness-110',
                )}
                style={{
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  // Counter-scale so labels stay legible as the canvas zooms.
                  transform: `translate(-50%,-50%) scale(${(isActive ? 1.12 : 1) / Math.max(zoom * 0.74, 1)})`,
                }}
              >
                {isActive && single && (
                  <span className="bg-brand absolute inset-0 -z-10 animate-ping-slow rounded-full" />
                )}
                {single ? formatPrice(single.price) : c.items.length}
              </button>
            )
          })}
        </div>
      </div>

      {/* controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <div className="glass border-default flex flex-col overflow-hidden rounded-lg border shadow-soft">
          <button
            type="button"
            onClick={() => setZoom((z) => clamp(z * 1.3, 1, 5))}
            aria-label="Zoom in"
            className="text-default hover:bg-surface-2 grid size-9 place-items-center transition-colors"
          >
            <Plus className="size-4" />
          </button>
          <span className="bg-[var(--border)] h-px" />
          <button
            type="button"
            onClick={() => setZoom((z) => clamp(z / 1.3, 1, 5))}
            aria-label="Zoom out"
            className="text-default hover:bg-surface-2 grid size-9 place-items-center transition-colors"
          >
            <Minus className="size-4" />
          </button>
        </div>
        <Tooltip content="Reset view" side="left">
          <button
            type="button"
            onClick={reset}
            aria-label="Reset map view"
            className="glass border-default text-default hover:bg-surface-2 grid size-9 place-items-center rounded-lg border shadow-soft transition-colors"
          >
            <Crosshair className="size-4" />
          </button>
        </Tooltip>
        <Tooltip content={satellite ? 'Street view' : 'Satellite view'} side="left">
          <button
            type="button"
            onClick={() => setSatellite((s) => !s)}
            aria-pressed={satellite}
            aria-label="Toggle map style"
            className={cn(
              'glass border-default grid size-9 place-items-center rounded-lg border shadow-soft transition-colors',
              satellite ? 'bg-brand text-on-brand' : 'text-default hover:bg-surface-2',
            )}
          >
            <Layers className="size-4" />
          </button>
        </Tooltip>
      </div>

      <div className="glass border-default text-muted absolute bottom-3 left-3 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-soft">
        {listings.length} on map · drag to pan
      </div>

      {/* selected card */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="bg-surface border-default absolute right-3 bottom-3 left-3 flex gap-3 overflow-hidden rounded-xl border p-3 shadow-pop sm:left-auto sm:w-80"
          >
            <Link to={`/listing/${selectedListing.id}`} className="shrink-0">
              <SmartImage
                src={selectedListing.images[0]}
                alt=""
                wrapperClassName="size-20 rounded-lg"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                to={`/listing/${selectedListing.id}`}
                className="text-default hover:text-brand line-clamp-1 text-sm font-bold"
              >
                {selectedListing.title}
              </Link>
              <p className="text-muted mt-0.5 truncate text-xs">
                {selectedListing.address}, {selectedListing.neighborhood}
              </p>
              <p className="text-default mt-1.5 text-sm font-bold">
                {formatPrice(selectedListing.price)}
                {selectedListing.deal === 'rent' && (
                  <span className="text-muted text-xs font-medium">/mo</span>
                )}
              </p>
              <p className="text-muted mt-0.5 text-xs">
                {selectedListing.beds || 'Studio'} bd · {selectedListing.baths} ba ·{' '}
                {formatArea(selectedListing.area)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="text-muted hover:bg-surface-2 hover:text-default rounded p-1 transition-colors"
              >
                <X className="size-4" />
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => toggleSaved(selectedListing.id)}
                aria-label="Save"
              >
                <Heart
                  className={cn(isSaved(selectedListing.id) && 'fill-red-500 text-red-500')}
                />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
