import type { Agent, Listing, ListingType, Neighborhood, SavedSearch, Tour } from './types'
import { AVATARS, EXTERIORS, gallery } from './images'

/* ------------------------------------------------------------------ *
 * Deterministic pseudo-random source so the catalogue is identical on
 * every render, every reload, and in every browser.
 * ------------------------------------------------------------------ */
function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const AGENTS: Agent[] = [
  {
    id: 'a1',
    name: 'Wanjiru Kamau',
    title: 'Principal Agent',
    agency: 'Acacia Residential',
    avatar: AVATARS[0],
    phone: '+254 712 004 118',
    email: 'wanjiru@acaciaresidential.co.ke',
    rating: 4.9,
    reviews: 184,
    deals: 312,
    years: 11,
    areas: ['Westlands', 'Kilimani', 'Lavington'],
    languages: ['English', 'Kiswahili', 'Kikuyu'],
    bio: 'Eleven years selling into the Westlands–Kilimani corridor. Wanjiru is the agent people call when a deal has to close cleanly and quickly, and she turns down more listings than she takes.',
    verified: true,
  },
  {
    id: 'a2',
    name: 'Daniel Otieno',
    title: 'Senior Property Consultant',
    agency: 'Meridian Homes',
    avatar: AVATARS[1],
    phone: '+254 733 561 920',
    email: 'daniel.o@meridianhomes.co.ke',
    rating: 4.8,
    reviews: 142,
    deals: 221,
    years: 8,
    areas: ['Karen', 'Runda', 'Kitisuru'],
    languages: ['English', 'Kiswahili', 'Dholuo'],
    bio: 'Specialises in standalone homes on half-acre and above. Daniel does his own due diligence on title and will tell you plainly when a property is not worth the asking price.',
    verified: true,
  },
  {
    id: 'a3',
    name: 'Aisha Noor',
    title: 'Lettings Director',
    agency: 'Acacia Residential',
    avatar: AVATARS[2],
    phone: '+254 722 883 407',
    email: 'aisha@acaciaresidential.co.ke',
    rating: 4.9,
    reviews: 263,
    deals: 480,
    years: 13,
    areas: ['Parklands', 'Westlands', 'Kileleshwa'],
    languages: ['English', 'Kiswahili', 'Arabic', 'Hindi'],
    bio: 'Runs the largest managed rental book in Parklands. Aisha handles tenant placement end to end, from viewing through to handover inventory.',
    verified: true,
  },
  {
    id: 'a4',
    name: 'Brian Mutiso',
    title: 'Associate Agent',
    agency: 'Rift Valley Property Co.',
    avatar: AVATARS[3],
    phone: '+254 701 229 554',
    email: 'brian@riftvalleyproperty.co.ke',
    rating: 4.7,
    reviews: 96,
    deals: 134,
    years: 6,
    areas: ['Syokimau', 'Athi River', 'Ruiru'],
    languages: ['English', 'Kiswahili', 'Kamba'],
    bio: 'Focused on first-home buyers along Mombasa Road and Thika Road. Brian walks clients through mortgage pre-approval before they ever book a viewing.',
    verified: true,
  },
  {
    id: 'a5',
    name: 'Grace Chepkoech',
    title: 'Luxury Portfolio Specialist',
    agency: 'Meridian Homes',
    avatar: AVATARS[4],
    phone: '+254 718 640 331',
    email: 'grace.c@meridianhomes.co.ke',
    rating: 5.0,
    reviews: 71,
    deals: 88,
    years: 9,
    areas: ['Muthaiga', 'Runda', 'Spring Valley'],
    languages: ['English', 'Kiswahili', 'French'],
    bio: 'Handles the quiet end of the market — off-market diplomatic and executive residences that never reach a public portal.',
    verified: true,
  },
  {
    id: 'a6',
    name: 'Samuel Njoroge',
    title: 'Coastal Sales Lead',
    agency: 'Blue Horizon Realty',
    avatar: AVATARS[5],
    phone: '+254 707 118 275',
    email: 'samuel@bluehorizon.co.ke',
    rating: 4.8,
    reviews: 118,
    deals: 160,
    years: 10,
    areas: ['Nyali', 'Diani', 'Mombasa'],
    languages: ['English', 'Kiswahili'],
    bio: 'Coast-based since 2016. Samuel knows which beachfront plots have clean leasehold paperwork and which ones to walk away from.',
    verified: true,
  },
  {
    id: 'a7',
    name: 'Nadia Hassan',
    title: 'New Developments Manager',
    agency: 'Skyline Developments',
    avatar: AVATARS[6],
    phone: '+254 726 905 440',
    email: 'nadia@skylinedev.co.ke',
    rating: 4.6,
    reviews: 88,
    deals: 205,
    years: 7,
    areas: ['Kilimani', 'Kileleshwa', 'South C'],
    languages: ['English', 'Kiswahili', 'Arabic'],
    bio: 'Sells off-plan apartments and knows every completion schedule in Kilimani by heart, including the ones that have slipped.',
    verified: false,
  },
  {
    id: 'a8',
    name: 'Peter Macharia',
    title: 'Land & Country Homes',
    agency: 'Rift Valley Property Co.',
    avatar: AVATARS[7],
    phone: '+254 735 412 806',
    email: 'peter@riftvalleyproperty.co.ke',
    rating: 4.7,
    reviews: 64,
    deals: 97,
    years: 14,
    areas: ['Naivasha', 'Nanyuki', 'Karen'],
    languages: ['English', 'Kiswahili'],
    bio: 'Fourteen years in country property. Peter handles lake-view and ranch-adjacent land where a site visit matters more than any brochure.',
    verified: true,
  },
]

interface AreaSpec {
  name: string
  city: string
  lat: number
  lng: number
  /** Multiplier applied to the base price band. */
  tier: number
  agents: string[]
  streets: string[]
  vibe: string[]
  scores: Neighborhood['scores']
  blurb: string
}

const AREAS: AreaSpec[] = [
  {
    name: 'Westlands',
    city: 'Nairobi',
    lat: -1.2655,
    lng: 36.803,
    tier: 1.35,
    agents: ['a1', 'a3'],
    streets: ['Rhapta Road', 'Peponi Road', 'Church Road', 'Woodvale Grove', 'Ring Road Westlands'],
    vibe: ['Walkable', 'Nightlife', 'Corporate'],
    scores: { commute: 92, safety: 78, schools: 80, nightlife: 95, greenery: 58 },
    blurb:
      'Nairobi’s business core. You trade garden space for a five-minute walk to everything, and traffic you can mostly avoid on foot.',
  },
  {
    name: 'Kilimani',
    city: 'Nairobi',
    lat: -1.2921,
    lng: 36.786,
    tier: 1.2,
    agents: ['a1', 'a7'],
    streets: ['Dennis Pritt Road', 'Argwings Kodhek Road', 'Lenana Road', 'Chaka Road', 'Wood Avenue'],
    vibe: ['Apartments', 'Cafés', 'Central'],
    scores: { commute: 88, safety: 76, schools: 82, nightlife: 84, greenery: 62 },
    blurb:
      'The densest new-build market in the city. Enormous choice of apartments, and the quality gap between towers is wider than the prices suggest.',
  },
  {
    name: 'Lavington',
    city: 'Nairobi',
    lat: -1.28,
    lng: 36.77,
    tier: 1.45,
    agents: ['a1', 'a5'],
    streets: ['James Gichuru Road', 'Muthangari Drive', 'Hatheru Road', 'Kingara Road', 'Gitanga Road'],
    vibe: ['Leafy', 'Family', 'Established'],
    scores: { commute: 80, safety: 86, schools: 94, nightlife: 60, greenery: 88 },
    blurb:
      'Mature trees, large plots and the best cluster of international schools in Nairobi. Prices reflect all three.',
  },
  {
    name: 'Kileleshwa',
    city: 'Nairobi',
    lat: -1.283,
    lng: 36.782,
    tier: 1.15,
    agents: ['a3', 'a7'],
    streets: ['Othaya Road', 'Laikipia Road', 'Mandera Road', 'Siaya Road', 'Ring Road Kileleshwa'],
    vibe: ['Quiet', 'Apartments', 'Central'],
    scores: { commute: 85, safety: 82, schools: 84, nightlife: 64, greenery: 74 },
    blurb:
      'Old bungalow plots steadily replaced by mid-rise apartments. Still quiet, still central, and better value than Lavington next door.',
  },
  {
    name: 'Karen',
    city: 'Nairobi',
    lat: -1.319,
    lng: 36.706,
    tier: 1.6,
    agents: ['a2', 'a8'],
    streets: ['Karen Road', 'Ngong Road', 'Bogani Road', 'Marula Lane', 'Dagoretti Road'],
    vibe: ['Acreage', 'Horses', 'Serene'],
    scores: { commute: 54, safety: 90, schools: 92, nightlife: 48, greenery: 98 },
    blurb:
      'Half-acre minimums, indigenous trees and genuine quiet. The commute into town is the price you pay, and it is a real one.',
  },
  {
    name: 'Runda',
    city: 'Nairobi',
    lat: -1.218,
    lng: 36.809,
    tier: 1.75,
    agents: ['a2', 'a5'],
    streets: ['Runda Drive', 'Mimosa Road', 'Kigwaru Drive', 'Whispers Avenue', 'Ridgeways Lane'],
    vibe: ['Gated', 'Diplomatic', 'Secure'],
    scores: { commute: 68, safety: 96, schools: 88, nightlife: 42, greenery: 90 },
    blurb:
      'Controlled access, manicured verges and a heavy diplomatic presence. The most consistently secure address in the city.',
  },
  {
    name: 'Muthaiga',
    city: 'Nairobi',
    lat: -1.249,
    lng: 36.833,
    tier: 1.9,
    agents: ['a5'],
    streets: ['Muthaiga Road', 'Limuru Road', 'Mathenge Drive', 'Thigiri Ridge Road'],
    vibe: ['Historic', 'Private', 'Prestige'],
    scores: { commute: 74, safety: 95, schools: 86, nightlife: 46, greenery: 93 },
    blurb:
      'Colonial-era estates on one- and two-acre plots. Stock turns over rarely and most of it never reaches a listings site.',
  },
  {
    name: 'Parklands',
    city: 'Nairobi',
    lat: -1.262,
    lng: 36.818,
    tier: 1.0,
    agents: ['a3'],
    streets: ['3rd Parklands Avenue', '4th Parklands Avenue', 'Masari Road', 'Ojijo Road'],
    vibe: ['Community', 'Rentals', 'Convenient'],
    scores: { commute: 90, safety: 74, schools: 78, nightlife: 70, greenery: 55 },
    blurb:
      'Dense, sociable and extremely well served for shops and clinics. The strongest rental yields inside the ring road.',
  },
  {
    name: 'Kitisuru',
    city: 'Nairobi',
    lat: -1.236,
    lng: 36.782,
    tier: 1.7,
    agents: ['a2', 'a5'],
    streets: ['Kitisuru Road', 'Lower Kabete Road', 'Rosslyn Lane', 'Red Hill Road'],
    vibe: ['Valley views', 'Gated', 'Spacious'],
    scores: { commute: 66, safety: 92, schools: 90, nightlife: 40, greenery: 94 },
    blurb:
      'Ridge-top plots overlooking the Karura side of the valley. Large houses, deep gardens, and very few neighbours.',
  },
  {
    name: 'Spring Valley',
    city: 'Nairobi',
    lat: -1.256,
    lng: 36.783,
    tier: 1.5,
    agents: ['a5', 'a1'],
    streets: ['Lower Kabete Road', 'Spring Valley Road', 'Mugumo Road', 'Loresho Ridge'],
    vibe: ['Quiet', 'Townhouses', 'Green'],
    scores: { commute: 78, safety: 88, schools: 86, nightlife: 50, greenery: 86 },
    blurb:
      'A pocket of townhouse clusters between Westlands and Lower Kabete. Convenient without being noisy.',
  },
  {
    name: 'Syokimau',
    city: 'Machakos',
    lat: -1.368,
    lng: 36.953,
    tier: 0.52,
    agents: ['a4'],
    streets: ['Katani Road', 'Airport View Road', 'Gateway Mall Road', 'Quickmart Lane'],
    vibe: ['Value', 'Commuter rail', 'New build'],
    scores: { commute: 62, safety: 72, schools: 68, nightlife: 44, greenery: 60 },
    blurb:
      'Where most Nairobi first-home buyers actually end up. New estates, the SGR commuter line, and roughly half the per-square-metre price of Kilimani.',
  },
  {
    name: 'Ruiru',
    city: 'Kiambu',
    lat: -1.148,
    lng: 36.958,
    tier: 0.48,
    agents: ['a4'],
    streets: ['Eastern Bypass', 'Kamakis Road', 'Membley Estate Road', 'Gatong’ora Road'],
    vibe: ['Value', 'Family', 'Growing'],
    scores: { commute: 58, safety: 70, schools: 72, nightlife: 46, greenery: 66 },
    blurb:
      'Thika Road’s fastest-growing suburb. Gated estates going up quickly and the infrastructure mostly keeping pace.',
  },
  {
    name: 'South C',
    city: 'Nairobi',
    lat: -1.318,
    lng: 36.83,
    tier: 0.72,
    agents: ['a7', 'a4'],
    streets: ['Mombasa Road', 'Bellevue Road', 'Muhoho Avenue', 'Red Cross Road'],
    vibe: ['Central', 'Value', 'Established'],
    scores: { commute: 82, safety: 72, schools: 74, nightlife: 58, greenery: 62 },
    blurb:
      'Ten minutes from the CBD and the airport both. Solid 1970s housing stock alongside newer blocks.',
  },
  {
    name: 'Nyali',
    city: 'Mombasa',
    lat: -4.03,
    lng: 39.7,
    tier: 0.95,
    agents: ['a6'],
    streets: ['Links Road', 'Mombasa–Malindi Road', 'Beach Road', 'Mwamba Drive'],
    vibe: ['Coastal', 'Resort', 'Warm'],
    scores: { commute: 70, safety: 78, schools: 76, nightlife: 80, greenery: 72 },
    blurb:
      'Mombasa’s established residential north shore. Sea breeze, mature compounds, and an easy bridge into town.',
  },
  {
    name: 'Diani',
    city: 'Kwale',
    lat: -4.3,
    lng: 39.58,
    tier: 1.05,
    agents: ['a6'],
    streets: ['Diani Beach Road', 'Kongo River Road', 'Galu Beach Road'],
    vibe: ['Beachfront', 'Holiday let', 'Quiet'],
    scores: { commute: 38, safety: 80, schools: 58, nightlife: 74, greenery: 88 },
    blurb:
      'White sand and strong short-let demand. Check the leasehold term before anything else — it varies wildly plot to plot.',
  },
  {
    name: 'Naivasha',
    city: 'Nakuru',
    lat: -0.717,
    lng: 36.431,
    tier: 0.68,
    agents: ['a8'],
    streets: ['Moi South Lake Road', 'Kongoni Road', 'Mundui Road'],
    vibe: ['Lake view', 'Weekend home', 'Open'],
    scores: { commute: 34, safety: 76, schools: 54, nightlife: 48, greenery: 96 },
    blurb:
      'Ninety minutes from Nairobi on the new expressway. Lake frontage, big skies, and the country’s best weekend-home value.',
  },
]

const TYPE_BY_AREA: Record<string, ListingType[]> = {
  Westlands: ['apartment', 'apartment', 'townhouse', 'studio'],
  Kilimani: ['apartment', 'apartment', 'studio', 'townhouse'],
  Lavington: ['townhouse', 'house', 'apartment', 'villa'],
  Kileleshwa: ['apartment', 'apartment', 'townhouse'],
  Karen: ['house', 'villa', 'house', 'land'],
  Runda: ['villa', 'house', 'townhouse'],
  Muthaiga: ['villa', 'house'],
  Parklands: ['apartment', 'apartment', 'studio'],
  Kitisuru: ['villa', 'house', 'townhouse'],
  'Spring Valley': ['townhouse', 'house', 'apartment'],
  Syokimau: ['apartment', 'townhouse', 'house'],
  Ruiru: ['townhouse', 'house', 'apartment'],
  'South C': ['apartment', 'house', 'studio'],
  Nyali: ['villa', 'apartment', 'house'],
  Diani: ['villa', 'house', 'land'],
  Naivasha: ['house', 'villa', 'land'],
}

const TYPE_LABEL: Record<ListingType, string> = {
  house: 'Home',
  apartment: 'Apartment',
  townhouse: 'Townhouse',
  villa: 'Villa',
  studio: 'Studio',
  land: 'Plot',
}

const ADJECTIVES = [
  'Light-filled',
  'Newly refurbished',
  'Architect-designed',
  'Corner-unit',
  'Garden-level',
  'Penthouse-level',
  'Double-volume',
  'North-facing',
  'Quietly positioned',
  'Fully serviced',
  'Split-level',
  'Courtyard',
]

const FEATURE_POOL = [
  'Solar water heating',
  'Borehole supply',
  'Backup generator',
  'Fibre-ready',
  'Fitted wardrobes',
  'Granite worktops',
  'En-suite master',
  'Walk-in closet',
  'Private balcony',
  'Underfloor heating',
  'Rainwater harvesting',
  'DSQ (staff quarters)',
  'Electric fence',
  'Double glazing',
  'Open-plan kitchen',
  'Laundry room',
  'Study / home office',
  'Mature garden',
]

const AMENITY_POOL = [
  'Swimming pool',
  'Gym',
  'Lift',
  '24/7 security',
  'CCTV',
  'Borehole',
  'Backup power',
  'Children’s play area',
  'Clubhouse',
  'Rooftop terrace',
  'Visitor parking',
  'Padel / tennis court',
  'Jogging track',
  'Pet friendly',
  'Garden',
]

const NEARBY_POOL: { name: string; kind: Listing['nearby'][number]['kind'] }[] = [
  { name: 'Brookhouse School', kind: 'school' },
  { name: 'Nairobi Academy', kind: 'school' },
  { name: 'The Aga Khan Hospital', kind: 'hospital' },
  { name: 'Nairobi Hospital', kind: 'hospital' },
  { name: 'Sarit Centre', kind: 'mall' },
  { name: 'Westgate Mall', kind: 'mall' },
  { name: 'The Hub Karen', kind: 'mall' },
  { name: 'Expressway on-ramp', kind: 'transport' },
  { name: 'SGR commuter station', kind: 'transport' },
  { name: 'Karura Forest', kind: 'park' },
  { name: 'Nairobi Arboretum', kind: 'park' },
  { name: 'Uhuru Gardens', kind: 'park' },
]

function buildListings(): Listing[] {
  const rnd = mulberry(20260413)
  const out: Listing[] = []
  let n = 0

  for (const area of AREAS) {
    const count = area.name === 'Muthaiga' || area.name === 'Diani' ? 3 : 5
    for (let i = 0; i < count; i++) {
      n++
      const types = TYPE_BY_AREA[area.name]
      const type = types[Math.floor(rnd() * types.length)]
      const isLand = type === 'land'
      const deal: Listing['deal'] = isLand ? 'buy' : rnd() < 0.42 ? 'rent' : 'buy'

      // Bedroom count and floor area are tied to the property type, so a
      // "1-bed villa" or a 320 m² one-bedroom never gets generated.
      const BED_RANGE: Record<ListingType, [number, number]> = {
        studio: [0, 0],
        apartment: [1, 4],
        townhouse: [2, 4],
        house: [3, 5],
        villa: [4, 6],
        land: [0, 0],
      }
      const [bedMin, bedMax] = BED_RANGE[type]
      const beds = isLand ? 0 : bedMin + Math.floor(rnd() * (bedMax - bedMin + 1))
      const baths = isLand
        ? 0
        : type === 'studio'
          ? 1
          : Math.max(1, Math.min(beds, beds - 1 + (rnd() < 0.55 ? 2 : 1)))

      const AREA_MODEL: Record<ListingType, [number, number, number]> = {
        // [base, per bedroom, random spread]
        studio: [32, 0, 22],
        apartment: [48, 32, 34],
        townhouse: [84, 42, 46],
        house: [110, 48, 70],
        villa: [150, 56, 110],
        land: [0, 0, 0],
      }
      const [aBase, aPerBed, aSpread] = AREA_MODEL[type]
      const area_m2 = isLand ? 0 : aBase + beds * aPerBed + Math.floor(rnd() * aSpread)

      const plot =
        isLand || type === 'villa' || type === 'house'
          ? Math.round((0.12 + rnd() * (area.tier > 1.5 ? 0.9 : 0.35)) * 100) / 100
          : undefined

      // Price model: area-tier × size, with a different base for rent vs. buy.
      const base = isLand
        ? (plot ?? 0.25) * 48_000_000 * area.tier
        : deal === 'buy'
          ? area_m2 * 135_000 * area.tier
          : area_m2 * 760 * area.tier
      const price = Math.round((base * (0.86 + rnd() * 0.3)) / (deal === 'rent' ? 500 : 50_000)) *
        (deal === 'rent' ? 500 : 50_000)

      const ageDays = Math.floor(rnd() * 95)
      const listedAt = new Date(Date.now() - ageDays * 86_400_000).toISOString()
      const reduced = rnd() < 0.16
      const status: Listing['status'] = reduced
        ? 'reduced'
        : ageDays < 8
          ? 'new'
          : rnd() < 0.08
            ? 'under-offer'
            : 'available'

      const shuffle = <T,>(arr: T[], take: number) =>
        [...arr].sort(() => rnd() - 0.5).slice(0, take)

      const street = area.streets[Math.floor(rnd() * area.streets.length)]
      const adj = ADJECTIVES[Math.floor(rnd() * ADJECTIVES.length)]
      const title = isLand
        ? `${plot}-acre plot on ${street}`
        : type === 'studio'
          ? `${adj} studio in ${area.name}`
          : `${adj} ${beds}-bed ${TYPE_LABEL[type].toLowerCase()} in ${area.name}`

      const agentId = area.agents[Math.floor(rnd() * area.agents.length)]
      const featureCount = isLand ? 3 : 5 + Math.floor(rnd() * 4)
      const features = isLand
        ? ['Ready title deed', 'Perimeter wall', 'Mains water & power at boundary']
        : shuffle(FEATURE_POOL, featureCount)
      const amenities = isLand ? [] : shuffle(AMENITY_POOL, 4 + Math.floor(rnd() * 5))

      const description = isLand
        ? `A clean, well-positioned ${plot}-acre parcel off ${street} in ${area.name}. Title is ready and held by a single registered owner, the boundary is walled on three sides, and mains water and power run to the gate. Suitable for a single residence or a small cluster development, subject to county approvals.`
        : `${title.replace(/^[A-Z]/, (c) => c)} — set on ${street}, ${area.name}. ${area.blurb} The ${TYPE_LABEL[
            type
          ].toLowerCase()} runs to ${area_m2} m² of internal space${
            plot ? ` on roughly ${plot} of an acre` : ''
          }, with ${beds || 'open-plan'} ${beds ? (beds === 1 ? 'bedroom' : 'bedrooms') : 'living'} and ${baths} ${
            baths === 1 ? 'bathroom' : 'bathrooms'
          }. ${
            deal === 'rent'
              ? 'Available on a twelve-month lease, with service charge included in the quoted figure.'
              : 'Offered with vacant possession and a clean, verified title.'
          }`

      const lat = area.lat + (rnd() - 0.5) * 0.022
      const lng = area.lng + (rnd() - 0.5) * 0.026

      const basePrice = price
      const priceHistory = [
        { date: new Date(Date.now() - (ageDays + 240) * 86_400_000).toISOString(), price: Math.round(basePrice * 0.88) },
        { date: new Date(Date.now() - (ageDays + 120) * 86_400_000).toISOString(), price: Math.round(basePrice * 0.95) },
        { date: listedAt, price: reduced ? Math.round(basePrice * 1.09) : basePrice },
      ]
      if (reduced) priceHistory.push({ date: new Date().toISOString(), price: basePrice })

      out.push({
        id: `L${String(n).padStart(3, '0')}`,
        slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${n}`,
        title,
        deal,
        type,
        status,
        price,
        previousPrice: reduced ? Math.round(basePrice * 1.09) : undefined,
        beds,
        baths,
        area: area_m2,
        plot,
        parking: isLand ? 0 : Math.max(1, Math.round(beds / 2)),
        yearBuilt: isLand ? 0 : 2005 + Math.floor(rnd() * 20),
        address: `${10 + Math.floor(rnd() * 180)} ${street}`,
        neighborhood: area.name,
        city: area.city,
        lat,
        lng,
        images: isLand ? [EXTERIORS[n % EXTERIORS.length]] : gallery(n, 6),
        description,
        features,
        amenities,
        agentId,
        listedAt,
        views: 120 + Math.floor(rnd() * 3400),
        saves: 4 + Math.floor(rnd() * 180),
        score: 62 + Math.floor(rnd() * 38),
        serviceCharge:
          type === 'apartment' || type === 'studio' ? 4_000 + Math.floor(rnd() * 16) * 1_000 : undefined,
        furnished: !isLand && rnd() < 0.3,
        petFriendly: !isLand && rnd() < 0.55,
        tour3d: rnd() < 0.4,
        nearby: shuffle(NEARBY_POOL, 4).map((p) => ({
          ...p,
          distance: Math.round((0.3 + rnd() * 6) * 10) / 10,
        })),
        priceHistory,
      })
    }
  }

  return out
}

export const LISTINGS: Listing[] = buildListings()

export const NEIGHBORHOODS: Neighborhood[] = AREAS.map((a, i) => {
  const mine = LISTINGS.filter((l) => l.neighborhood === a.name)
  const buys = mine.filter((l) => l.deal === 'buy').map((l) => l.price)
  const rents = mine.filter((l) => l.deal === 'rent').map((l) => l.price)
  const median = (xs: number[], fallback: number) =>
    xs.length ? [...xs].sort((x, y) => x - y)[Math.floor(xs.length / 2)] : fallback
  return {
    id: a.name.toLowerCase().replace(/\s+/g, '-'),
    name: a.name,
    city: a.city,
    image: EXTERIORS[(i * 3 + 1) % EXTERIORS.length],
    listings: mine.length,
    medianBuy: median(buys, Math.round(22_000_000 * a.tier)),
    medianRent: median(rents, Math.round(95_000 * a.tier)),
    blurb: a.blurb,
    vibe: a.vibe,
    scores: a.scores,
  }
})

export const AREA_NAMES = AREAS.map((a) => a.name)

export function getListing(id: string) {
  return LISTINGS.find((l) => l.id === id || l.slug === id)
}

export function getAgent(id: string) {
  return AGENTS.find((a) => a.id === id)
}

export function agentListings(agentId: string) {
  return LISTINGS.filter((l) => l.agentId === agentId)
}

/** Listings in the same area and price band, excluding the one you're on. */
export function similarListings(listing: Listing, take = 4) {
  return LISTINGS.filter(
    (l) =>
      l.id !== listing.id &&
      l.deal === listing.deal &&
      (l.neighborhood === listing.neighborhood || l.type === listing.type) &&
      l.price > listing.price * 0.65 &&
      l.price < listing.price * 1.45,
  )
    .sort(
      (a, b) =>
        Math.abs(a.price - listing.price) - Math.abs(b.price - listing.price) ||
        b.score - a.score,
    )
    .slice(0, take)
}

export const DEMO_SAVED_SEARCHES: SavedSearch[] = [
  {
    id: 's1',
    name: '3-bed in Lavington under 38M',
    query: '?deal=buy&q=Lavington&beds=3&max=38000000',
    createdAt: new Date(Date.now() - 18 * 86_400_000).toISOString(),
    alerts: true,
    newMatches: 4,
  },
  {
    id: 's2',
    name: 'Westlands rentals, pet friendly',
    query: '?deal=rent&q=Westlands&petFriendly=1',
    createdAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
    alerts: true,
    newMatches: 2,
  },
  {
    id: 's3',
    name: 'First home — Syokimau & Ruiru',
    query: '?deal=buy&max=12000000&q=Syokimau',
    createdAt: new Date(Date.now() - 41 * 86_400_000).toISOString(),
    alerts: false,
    newMatches: 0,
  },
]

export const DEMO_TOURS: Tour[] = [
  {
    id: 't1',
    listingId: LISTINGS[2].id,
    date: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    time: '10:30',
    mode: 'in-person',
    status: 'confirmed',
    note: 'Meet the caretaker at the gate — ask for Joseph.',
  },
  {
    id: 't2',
    listingId: LISTINGS[11].id,
    date: new Date(Date.now() + 5 * 86_400_000).toISOString(),
    time: '14:00',
    mode: 'video',
    status: 'pending',
  },
  {
    id: 't3',
    listingId: LISTINGS[23].id,
    date: new Date(Date.now() - 4 * 86_400_000).toISOString(),
    time: '09:00',
    mode: 'in-person',
    status: 'completed',
  },
]

export const TESTIMONIALS = [
  {
    name: 'Mercy & Victor Odhiambo',
    role: 'Bought in Kileleshwa',
    avatar: AVATARS[6],
    quote:
      'We had been looking for eight months on other sites and kept seeing the same three flats relisted. Here we filtered to what we could actually afford and booked four viewings in one evening.',
  },
  {
    name: 'Tom Wekesa',
    role: 'Renting in Westlands',
    avatar: AVATARS[3],
    quote:
      'The map view is what sold me. Being able to see which blocks were genuinely walking distance from the office saved me two weekends of driving around.',
  },
  {
    name: 'Fatuma Said',
    role: 'Sold in Nyali',
    avatar: AVATARS[2],
    quote:
      'Listed on a Tuesday, eleven enquiries by Friday, under offer in under three weeks. The agent matching actually put me with someone who knew the street.',
  },
]
