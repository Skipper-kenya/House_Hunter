# HouseHunter

An all-in-one house hunting front end for the Kenyan market — browse, filter, map, shortlist,
compare, cost out and book viewings. React + TypeScript, no backend: the catalogue is generated
deterministically in `src/lib/data.ts` and user state persists to `localStorage`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

## Stack

| | |
|---|---|
| **React 19 + TypeScript** | strict mode, `@/*` path alias to `src/` |
| **Vite** | dev server and build |
| **Tailwind CSS v4** | design tokens declared in `src/index.css` via `@theme` |
| **Radix UI** | dialog, popover, select, slider, tabs, tooltip, dropdown, checkbox, switch, avatar |
| **Motion** | page, card and layout transitions |
| **Recharts** | price history, activity and magnitude charts |
| **lucide-react** | icon set |
| **sonner** | toasts |

## Routes

| Path | What's there |
|---|---|
| `/` | Hero search, featured homes, neighbourhood tiles, how-it-works, testimonials |
| `/search` | Grid / split / map views, faceted filters, sort, URL-synced state, save-a-search |
| `/listing/:id` | Gallery + lightbox, specs, amenities, location, price history, mortgage, similar homes |
| `/saved` | Shortlist, saved searches with alert toggles, recently viewed |
| `/compare` | Up to 4 homes side by side, best figure per row highlighted |
| `/neighbourhoods` | Area guides with median prices and liveability scores |
| `/agents`, `/agents/:id` | Agent directory and profiles with their live listings |
| `/dashboard` | Viewings, alerts, activity charts, agent messages |
| `/mortgage` | Repayment calculator, affordability (income → budget), lender comparison |
| `/list-your-property` | Four-step listing wizard with per-step validation |

## Design system

Everything themeable lives in `src/index.css`. Semantic variables (`--surface`, `--text`,
`--brand`, `--border`…) are redefined under `:root[data-theme='dark']`, so dark mode is a
**selected** set of values rather than an inverted light theme. The stored theme is applied by an
inline script in `index.html` before first paint, so there's no flash.

The brand ramps (`sand`, `forest`, `clay`) are declared in the `@theme` block and generate normal
Tailwind utilities (`bg-forest-700`, `text-clay-500`, `rounded-xl`, `shadow-lift`…).

### Chart colours

`src/components/charts.tsx` holds one fixed categorical order per theme. Both sets were checked
for lightness band, chroma floor, colour-vision-deficiency separation and surface contrast:

```
light  #0F8A69  #D97706  #4F46E5  #BE123C
dark   #10A079  #CA8008  #7C83F0  #E2496B
```

Hues are assigned in order and never cycled. Re-run the colour checks before substituting any of
them.

## Notable implementation details

- **Map** (`src/components/listing/MapPane.tsx`) is drawn from scratch — no map provider or API
  key. Listings are projected into canvas-percentage space with a minimum bounds pad, pins that
  would overlap collapse into a count, and clicking a cluster zooms and recentres so it splits.
  Pan by dragging, zoom by wheel or the controls.
- **Filters** are the URL. `paramsToFilters` / `filtersToParams` in `src/lib/filters.ts` make every
  search shareable and back-button-safe, and `/search` deliberately does not scroll-reset.
- **Neighbourhood counts** in the filter panel are computed with the neighbourhood facet itself
  removed, so the numbers don't collapse to zero as you tick boxes.
- **Generated data** uses a seeded PRNG, so the catalogue is identical on every reload. Bedroom
  counts and floor areas are tied to property type — no 320 m² one-bedrooms.
- **Images** come from the Pexels CDN. `SmartImage` shimmer-loads, fades in, and falls back to a
  themed tile if a URL fails, so a dead image never leaves a broken icon mid-layout.
- **Keyboard**: `⌘K` / `Ctrl+K` or `/` opens the command palette; arrows and Enter drive it. The
  gallery lightbox takes arrow keys. There's a skip-to-content link, and `prefers-reduced-motion`
  is respected globally.

## Replacing the mock data

`src/lib/data.ts` exports `LISTINGS`, `AGENTS` and `NEIGHBORHOODS` against the interfaces in
`src/lib/types.ts`. Swap those exports for API calls and nothing else needs to change —
`applyFilters` and every page consume the same shapes.
