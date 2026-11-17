import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** KSh 24.5M / KSh 180K / KSh 4,200 — compact where it helps, exact where it matters. */
export function formatPrice(value: number, opts: { compact?: boolean } = {}) {
  const { compact = true } = opts
  if (compact) {
    if (value >= 1_000_000) {
      const m = value / 1_000_000
      return `KSh ${m % 1 === 0 ? m : m.toFixed(1)}M`
    }
    if (value >= 100_000) return `KSh ${Math.round(value / 1000)}K`
  }
  return `KSh ${value.toLocaleString('en-KE')}`
}

export function formatPriceLabel(value: number, deal: 'buy' | 'rent') {
  return deal === 'rent' ? `${formatPrice(value)}/mo` : formatPrice(value)
}

export function formatNumber(value: number) {
  return value.toLocaleString('en-KE')
}

export function formatArea(sqm: number) {
  return `${formatNumber(sqm)} m²`
}

/** "3 days ago" / "today" — relative time without a date library. */
export function timeAgo(iso: string) {
  const then = new Date(iso).getTime()
  const days = Math.floor((Date.now() - then) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? '' : 's'} ago`
  return `${Math.floor(days / 365)} year${days < 730 ? '' : 's'} ago`
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`
}

/** Monthly payment for an amortising loan. */
export function monthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12
  const n = years * 12
  if (principal <= 0 || n <= 0) return 0
  if (r === 0) return principal / n
  return (principal * r) / (1 - Math.pow(1 + r, -n))
}

/** Read JSON from localStorage without throwing in private-mode browsers. */
export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or blocked storage — the UI works without persistence */
  }
}
