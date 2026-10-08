// Display formatting shared by every screen. Times render in the reader's local zone;
// the zone is carried in the `title` of <Timestamp>, not in the visible text (P-17).

import type { Metric } from '@/lib/types/dashboard'

const number = new Intl.NumberFormat('en-US')

export const formatCount = (n: number) => number.format(n)

export function formatPercent(ratio: number, digits = 0) {
  return `${(ratio * 100).toFixed(digits)}%`
}

/** Above a million shows M / B, below that the exact figure (dashboard rule). */
export function formatTokens(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2)} M`
  return number.format(Math.round(n))
}

export function formatUsd(n: number) {
  if (n === 0) return '$0.00'
  if (Math.abs(n) < 1) return `$${n.toFixed(n < 0.01 ? 4 : 3)}`
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

export function formatDuration(seconds: number) {
  const s = Math.round(seconds)
  if (s < 60) return `${s} sec`
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rest = s % 60
  if (h > 0) return `${h} hr ${m} min`
  return `${m} min ${rest} sec`
}

export function formatDurationShort(seconds: number) {
  const s = Math.round(seconds)
  if (s < 60) return `${s}s`
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}m ${String(s % 60).padStart(2, '0')}s`
}

const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
const moment = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })

export const formatMoment = (iso: string) => moment.format(new Date(iso))
export const formatDay = (iso: string) => dayMonth.format(new Date(iso))
export const formatTime = (iso: string) => time.format(new Date(iso))

/** "30 Sep, 12:01": how a run is named. The raw id is for tooltips and detail only. */
export const formatRunName = (iso: string) => `${dayMonth.format(new Date(iso))}, ${time.format(new Date(iso))}`

export function zoneLabel() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function formatRelative(iso: string, now = Date.now()) {
  const diff = now - new Date(iso).getTime()
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return `${days} ${days === 1 ? 'day' : 'days'} ago`
}

export const isObserved = (m: Metric | undefined | null): m is Metric & { value: number } => !!m && m.state === 'OBSERVED' && m.value !== null
