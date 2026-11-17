import type { Filters, Listing, ListingType, SortKey } from './types'

export const PRICE_BOUNDS = {
  buy: { min: 0, max: 400_000_000, step: 500_000 },
  rent: { min: 0, max: 900_000, step: 5_000 },
} as const

export const DEFAULT_FILTERS: Filters = {
  q: '',
  deal: 'buy',
  types: [],
  min: 0,
  max: PRICE_BOUNDS.buy.max,
  beds: 0,
  baths: 0,
  minArea: 0,
  neighborhoods: [],
  amenities: [],
  furnished: false,
  petFriendly: false,
  tour3d: false,
  sort: 'relevance',
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Best match' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'area-desc', label: 'Largest first' },
  { value: 'beds-desc', label: 'Most bedrooms' },
]

export const TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'land', label: 'Land' },
]

export const AMENITY_OPTIONS = [
  'Swimming pool',
  'Gym',
  'Lift',
  '24/7 security',
  'Backup power',
  'Borehole',
  'Rooftop terrace',
  'Clubhouse',
  'Garden',
  'Visitor parking',
]

function matchesQuery(l: Listing, q: string) {
  if (!q) return true
  const needle = q.trim().toLowerCase()
  return (
    l.title.toLowerCase().includes(needle) ||
    l.neighborhood.toLowerCase().includes(needle) ||
    l.city.toLowerCase().includes(needle) ||
    l.address.toLowerCase().includes(needle) ||
    l.type.toLowerCase().includes(needle) ||
    l.features.some((f) => f.toLowerCase().includes(needle)) ||
    l.amenities.some((a) => a.toLowerCase().includes(needle))
  )
}

export function applyFilters(listings: Listing[], f: Filters): Listing[] {
  const result = listings.filter((l) => {
    if (l.deal !== f.deal) return false
    if (!matchesQuery(l, f.q)) return false
    if (f.types.length && !f.types.includes(l.type)) return false
    if (l.price < f.min || l.price > f.max) return false
    if (f.beds && l.beds < f.beds) return false
    if (f.baths && l.baths < f.baths) return false
    if (f.minArea && l.area < f.minArea) return false
    if (f.neighborhoods.length && !f.neighborhoods.includes(l.neighborhood)) return false
    if (f.amenities.length && !f.amenities.every((a) => l.amenities.includes(a))) return false
    if (f.furnished && !l.furnished) return false
    if (f.petFriendly && !l.petFriendly) return false
    if (f.tour3d && !l.tour3d) return false
    return true
  })

  const byDate = (l: Listing) => new Date(l.listedAt).getTime()
  const sorters: Record<SortKey, (a: Listing, b: Listing) => number> = {
    relevance: (a, b) => b.score - a.score || byDate(b) - byDate(a),
    newest: (a, b) => byDate(b) - byDate(a),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'area-desc': (a, b) => b.area - a.area,
    'beds-desc': (a, b) => b.beds - a.beds || b.area - a.area,
  }

  return result.sort(sorters[f.sort])
}

/** Count of filters the user has actively changed — drives the "N active" pill. */
export function activeFilterCount(f: Filters) {
  const bounds = PRICE_BOUNDS[f.deal]
  let n = 0
  if (f.types.length) n += 1
  if (f.min > bounds.min || f.max < bounds.max) n += 1
  if (f.beds) n += 1
  if (f.baths) n += 1
  if (f.minArea) n += 1
  if (f.neighborhoods.length) n += 1
  if (f.amenities.length) n += 1
  if (f.furnished) n += 1
  if (f.petFriendly) n += 1
  if (f.tour3d) n += 1
  return n
}

/* ---------------- URL <-> Filters ---------------- */

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams()
  const bounds = PRICE_BOUNDS[f.deal]
  if (f.q) p.set('q', f.q)
  if (f.deal !== 'buy') p.set('deal', f.deal)
  if (f.types.length) p.set('type', f.types.join(','))
  if (f.min > bounds.min) p.set('min', String(f.min))
  if (f.max < bounds.max) p.set('max', String(f.max))
  if (f.beds) p.set('beds', String(f.beds))
  if (f.baths) p.set('baths', String(f.baths))
  if (f.minArea) p.set('area', String(f.minArea))
  if (f.neighborhoods.length) p.set('area_in', f.neighborhoods.join(','))
  if (f.amenities.length) p.set('amen', f.amenities.join(','))
  if (f.furnished) p.set('furnished', '1')
  if (f.petFriendly) p.set('pets', '1')
  if (f.tour3d) p.set('tour3d', '1')
  if (f.sort !== 'relevance') p.set('sort', f.sort)
  return p
}

export function paramsToFilters(p: URLSearchParams): Filters {
  const deal = p.get('deal') === 'rent' ? 'rent' : 'buy'
  const bounds = PRICE_BOUNDS[deal]
  const list = (key: string) => (p.get(key) ? p.get(key)!.split(',').filter(Boolean) : [])
  const num = (key: string, fallback: number) => {
    const v = Number(p.get(key))
    return Number.isFinite(v) && p.get(key) !== null ? v : fallback
  }
  return {
    q: p.get('q') ?? '',
    deal,
    types: list('type') as ListingType[],
    min: num('min', bounds.min),
    max: num('max', bounds.max),
    beds: num('beds', 0),
    baths: num('baths', 0),
    minArea: num('area', 0),
    neighborhoods: list('area_in'),
    amenities: list('amen'),
    furnished: p.get('furnished') === '1',
    petFriendly: p.get('pets') === '1',
    tour3d: p.get('tour3d') === '1',
    sort: (p.get('sort') as SortKey) ?? 'relevance',
  }
}
