import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { DEMO_SAVED_SEARCHES, DEMO_TOURS, getListing } from './data'
import type { SavedSearch, Tour } from './types'
import { readStore, writeStore } from './utils'

const KEYS = {
  saved: 'hh.saved',
  compare: 'hh.compare',
  recent: 'hh.recent',
  tours: 'hh.tours',
  searches: 'hh.searches',
  theme: 'hh.theme',
}

export const COMPARE_LIMIT = 4

type Theme = 'light' | 'dark'

interface Store {
  theme: Theme
  toggleTheme: () => void

  saved: string[]
  isSaved: (id: string) => boolean
  toggleSaved: (id: string) => void

  compare: string[]
  inCompare: (id: string) => boolean
  toggleCompare: (id: string) => void
  clearCompare: () => void

  recent: string[]
  markViewed: (id: string) => void

  tours: Tour[]
  addTour: (t: Omit<Tour, 'id' | 'status'>) => void
  cancelTour: (id: string) => void

  searches: SavedSearch[]
  addSearch: (name: string, query: string) => void
  removeSearch: (id: string) => void
  toggleAlerts: (id: string) => void
}

const Ctx = createContext<Store | null>(null)

function prefersDark() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    readStore<Theme | null>(KEYS.theme, null) ?? (prefersDark() ? 'dark' : 'light'),
  )
  const [saved, setSaved] = useState<string[]>(() => readStore<string[]>(KEYS.saved, []))
  const [compare, setCompare] = useState<string[]>(() => readStore<string[]>(KEYS.compare, []))
  const [recent, setRecent] = useState<string[]>(() => readStore<string[]>(KEYS.recent, []))
  const [tours, setTours] = useState<Tour[]>(() => readStore<Tour[]>(KEYS.tours, DEMO_TOURS))
  const [searches, setSearches] = useState<SavedSearch[]>(() =>
    readStore<SavedSearch[]>(KEYS.searches, DEMO_SAVED_SEARCHES),
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeStore(KEYS.theme, theme)
  }, [theme])
  useEffect(() => writeStore(KEYS.saved, saved), [saved])
  useEffect(() => writeStore(KEYS.compare, compare), [compare])
  useEffect(() => writeStore(KEYS.recent, recent), [recent])
  useEffect(() => writeStore(KEYS.tours, tours), [tours])
  useEffect(() => writeStore(KEYS.searches, searches), [searches])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const has = prev.includes(id)
      const listing = getListing(id)
      if (has) {
        toast('Removed from saved', { description: listing?.title })
        return prev.filter((x) => x !== id)
      }
      toast.success('Saved to your shortlist', { description: listing?.title })
      return [id, ...prev]
    })
  }, [])

  const toggleCompare = useCallback((id: string) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= COMPARE_LIMIT) {
        toast.error(`You can compare up to ${COMPARE_LIMIT} homes`, {
          description: 'Remove one to add another.',
        })
        return prev
      }
      return [...prev, id]
    })
  }, [])

  const markViewed = useCallback((id: string) => {
    setRecent((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 12))
  }, [])

  const addTour = useCallback((t: Omit<Tour, 'id' | 'status'>) => {
    setTours((prev) => [{ ...t, id: `t${Date.now()}`, status: 'pending' }, ...prev])
  }, [])

  const cancelTour = useCallback((id: string) => {
    setTours((prev) => prev.filter((t) => t.id !== id))
    toast('Viewing cancelled')
  }, [])

  const addSearch = useCallback((name: string, query: string) => {
    setSearches((prev) => [
      { id: `s${Date.now()}`, name, query, createdAt: new Date().toISOString(), alerts: true, newMatches: 0 },
      ...prev,
    ])
    toast.success('Search saved', { description: 'We’ll alert you when new homes match.' })
  }, [])

  const removeSearch = useCallback((id: string) => {
    setSearches((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const toggleAlerts = useCallback((id: string) => {
    setSearches((prev) => prev.map((s) => (s.id === id ? { ...s, alerts: !s.alerts } : s)))
  }, [])

  const value = useMemo<Store>(
    () => ({
      theme,
      toggleTheme,
      saved,
      isSaved: (id) => saved.includes(id),
      toggleSaved,
      compare,
      inCompare: (id) => compare.includes(id),
      toggleCompare,
      clearCompare: () => setCompare([]),
      recent,
      markViewed,
      tours,
      addTour,
      cancelTour,
      searches,
      addSearch,
      removeSearch,
      toggleAlerts,
    }),
    [
      theme,
      toggleTheme,
      saved,
      toggleSaved,
      compare,
      toggleCompare,
      recent,
      markViewed,
      tours,
      addTour,
      cancelTour,
      searches,
      addSearch,
      removeSearch,
      toggleAlerts,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
