import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const INR_PAISE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
})

/** Money for display. Whole rupees unless the amount has real paise. */
export function money(value: string | number | null | undefined, exact = false) {
  const n = Number(value ?? 0)
  if (Number.isNaN(n)) return INR.format(0)
  return exact || n % 1 !== 0 ? INR_PAISE.format(n) : INR.format(n)
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  )
}

export function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function relativeDate(value: string | null | undefined) {
  if (!value) return '—'
  const diff = Date.now() - new Date(value).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

/** Pull a readable message out of a DRF error payload. */
export function apiError(error: any, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (typeof data === 'string') return data
  if (data.detail) return String(data.detail)
  const first = Object.entries(data)[0]
  if (!first) return fallback
  const [field, value] = first
  const text = Array.isArray(value) ? value[0] : value
  return field === 'non_field_errors' || field === 'cart' ? String(text) : `${field}: ${text}`
}

export function initialsOf(name: string) {
  return name
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
