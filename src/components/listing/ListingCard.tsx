import { motion } from 'motion/react'
import {
  Bath,
  BedDouble,
  Car,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Maximize,
  Scale,
  Sparkles,
  Video,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAgent } from '@/lib/data'
import { useStore } from '@/lib/store'
import type { Listing } from '@/lib/types'
import { cn, formatArea, formatNumber, formatPriceLabel, timeAgo } from '@/lib/utils'
import { Badge, Skeleton } from '@/components/ui/primitives'
import { SmartImage } from '@/components/ui/smart-image'
import { Tooltip } from '@/components/ui/overlay'

const STATUS: Record<Listing['status'], { label: string; variant: 'solid' | 'accent' | 'warn' | 'neutral' } | null> = {
  new: { label: 'New', variant: 'solid' },
  reduced: { label: 'Price drop', variant: 'accent' },
  'under-offer': { label: 'Under offer', variant: 'warn' },
  available: null,
}

export function ListingCard({
  listing,
  index = 0,
  compact,
  highlighted,
  onHover,
}: {
  listing: Listing
  index?: number
  compact?: boolean
  highlighted?: boolean
  onHover?: (id: string | null) => void
}) {
  const { isSaved, toggleSaved, inCompare, toggleCompare } = useStore()
  const [frame, setFrame] = useState(0)
  const saved = isSaved(listing.id)
  const comparing = inCompare(listing.id)
  const status = STATUS[listing.status]
  const agent = getAgent(listing.agentId)

  const step = (dir: 1 | -1) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFrame((f) => (f + dir + listing.images.length) % listing.images.length)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        'group bg-surface border-default relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lift',
        highlighted && 'ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--bg)]',
      )}
    >
      {/* ---------- media ---------- */}
      <div className={cn('relative overflow-hidden', compact ? 'aspect-16/10' : 'aspect-4/3')}>
        <Link to={`/listing/${listing.id}`} aria-label={listing.title} className="block size-full">
          <SmartImage
            src={listing.images[frame]}
            alt={`${listing.title} — photo ${frame + 1}`}
            wrapperClassName="size-full"
            className="transition-transform duration-700 group-hover:scale-105"
            eager={index < 3}
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </Link>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />

        {/* top row */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {status && (
              <Badge variant={status.variant} className="shadow-soft">
                {status.label}
              </Badge>
            )}
            {listing.tour3d && (
              <Badge variant="glass">
                <Video /> 3D tour
              </Badge>
            )}
          </div>

          <div className="flex gap-1.5">
            <Tooltip content={comparing ? 'Remove from compare' : 'Add to compare'}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  toggleCompare(listing.id)
                }}
                aria-pressed={comparing}
                aria-label="Compare this home"
                className={cn(
                  'glass grid size-9 place-items-center rounded-full shadow-soft transition-all hover:scale-110',
                  comparing ? 'bg-brand text-on-brand' : 'text-default',
                )}
              >
                <Scale className="size-4" />
              </button>
            </Tooltip>
            <Tooltip content={saved ? 'Remove from shortlist' : 'Save to shortlist'}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  toggleSaved(listing.id)
                }}
                aria-pressed={saved}
                aria-label="Save this home"
                className="glass text-default grid size-9 place-items-center rounded-full shadow-soft transition-all hover:scale-110"
              >
                <Heart
                  className={cn('size-4 transition-all', saved && 'scale-110 fill-red-500 text-red-500')}
                />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* gallery arrows + dots */}
        {listing.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={step(-1)}
              aria-label="Previous photo"
              className="glass text-default absolute top-1/2 left-3 grid size-8 -translate-y-1/2 place-items-center rounded-full opacity-0 shadow-soft transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={step(1)}
              aria-label="Next photo"
              className="glass text-default absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full opacity-0 shadow-soft transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
              {listing.images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full bg-white/60 transition-all',
                    i === frame ? 'w-5 bg-white' : 'w-1.5',
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* price */}
        <div className="absolute bottom-3 left-3">
          <span className="glass text-default inline-flex items-baseline gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold shadow-soft">
            {formatPriceLabel(listing.price, listing.deal)}
            {listing.previousPrice && (
              <span className="text-muted text-xs font-medium line-through">
                {formatPriceLabel(listing.previousPrice, listing.deal)}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* ---------- body ---------- */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1">
            <Link
              to={`/listing/${listing.id}`}
              className="text-default font-display line-clamp-2 text-base leading-snug font-semibold hover:text-[var(--brand)]"
            >
              {listing.title}
            </Link>
          </h3>
          <Tooltip content="How well this matches your saved preferences">
            <span className="text-brand bg-brand-soft flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-bold">
              <Sparkles className="size-3" />
              {listing.score}
            </span>
          </Tooltip>
        </div>

        <p className="text-muted mt-1.5 flex items-center gap-1 text-sm">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {listing.address}, {listing.neighborhood}
          </span>
        </p>

        <dl className="text-muted mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
          {listing.type !== 'land' && (
            <>
              <div className="flex items-center gap-1.5">
                <BedDouble className="size-4" />
                <dd className="font-medium">{listing.beds || 'Studio'}</dd>
                <dt className="sr-only">bedrooms</dt>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="size-4" />
                <dd className="font-medium">{listing.baths}</dd>
                <dt className="sr-only">bathrooms</dt>
              </div>
              <div className="flex items-center gap-1.5">
                <Maximize className="size-4" />
                <dd className="font-medium">{formatArea(listing.area)}</dd>
                <dt className="sr-only">internal area</dt>
              </div>
              {listing.parking > 0 && (
                <div className="flex items-center gap-1.5">
                  <Car className="size-4" />
                  <dd className="font-medium">{listing.parking}</dd>
                  <dt className="sr-only">parking spaces</dt>
                </div>
              )}
            </>
          )}
          {listing.type === 'land' && listing.plot && (
            <div className="flex items-center gap-1.5">
              <Maximize className="size-4" />
              <dd className="font-medium">{listing.plot} acres</dd>
              <dt className="sr-only">plot size</dt>
            </div>
          )}
        </dl>

        <div className="border-default mt-auto flex items-center justify-between gap-2 border-t pt-3 text-xs">
          <span className="text-muted truncate">
            {agent?.agency} · {timeAgo(listing.listedAt)}
          </span>
          <span className="text-muted shrink-0 tabular-nums">{formatNumber(listing.views)} views</span>
        </div>
      </div>
    </motion.article>
  )
}

export function ListingCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="bg-surface border-default overflow-hidden rounded-xl border">
      <Skeleton className={cn('rounded-none', compact ? 'aspect-16/10' : 'aspect-4/3')} />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}
