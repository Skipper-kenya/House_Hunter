export type ListingType = 'house' | 'apartment' | 'townhouse' | 'villa' | 'studio' | 'land'
export type Deal = 'buy' | 'rent'
export type ListingStatus = 'available' | 'under-offer' | 'new' | 'reduced'

export interface Agent {
  id: string
  name: string
  title: string
  agency: string
  avatar: string
  phone: string
  email: string
  rating: number
  reviews: number
  deals: number
  years: number
  areas: string[]
  languages: string[]
  bio: string
  verified: boolean
}

export interface Listing {
  id: string
  slug: string
  title: string
  deal: Deal
  type: ListingType
  status: ListingStatus
  /** KES. For rentals this is the monthly figure. */
  price: number
  /** Previous asking price, when the listing has been reduced. */
  previousPrice?: number
  beds: number
  baths: number
  /** Internal area, square metres. */
  area: number
  /** Plot size in acres, where the listing has its own plot. */
  plot?: number
  parking: number
  yearBuilt: number
  address: string
  neighborhood: string
  city: string
  lat: number
  lng: number
  images: string[]
  description: string
  features: string[]
  amenities: string[]
  agentId: string
  listedAt: string
  views: number
  saves: number
  /** 0–100 editorial score shown as "Match" on cards. */
  score: number
  serviceCharge?: number
  furnished: boolean
  petFriendly: boolean
  tour3d: boolean
  nearby: { name: string; kind: 'school' | 'hospital' | 'mall' | 'transport' | 'park'; distance: number }[]
  priceHistory: { date: string; price: number }[]
}

export interface Neighborhood {
  id: string
  name: string
  city: string
  image: string
  listings: number
  medianBuy: number
  medianRent: number
  blurb: string
  vibe: string[]
  scores: { commute: number; safety: number; schools: number; nightlife: number; greenery: number }
}

export interface SavedSearch {
  id: string
  name: string
  query: string
  createdAt: string
  alerts: boolean
  newMatches: number
}

export interface Tour {
  id: string
  listingId: string
  date: string
  time: string
  mode: 'in-person' | 'video'
  status: 'confirmed' | 'pending' | 'completed'
  note?: string
}

export interface Filters {
  q: string
  deal: Deal
  types: ListingType[]
  min: number
  max: number
  beds: number
  baths: number
  minArea: number
  neighborhoods: string[]
  amenities: string[]
  furnished: boolean
  petFriendly: boolean
  tour3d: boolean
  sort: SortKey
}

export type SortKey =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'area-desc'
  | 'beds-desc'
