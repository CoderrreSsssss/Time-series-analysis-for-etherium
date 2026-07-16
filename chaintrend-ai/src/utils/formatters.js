import { format, parseISO } from 'date-fns'

/** Format a number as a USD currency string, adapting decimals to magnitude. */
export function formatCurrency(value, { compact = false } = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const abs = Math.abs(value)

  if (compact && abs >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value)
  }

  const decimals = abs >= 100 ? 2 : abs >= 1 ? 3 : 6
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/** Format a large number in compact form, e.g. 1.2B, 340M */
export function formatCompactNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
}

/** Format a decimal as a percentage string with a leading sign. */
export function formatPercent(value, { signed = true, decimals = 2 } = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const sign = signed && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/** Format an ISO date string into a short human-readable date. */
export function formatDate(dateStr, pattern = 'MMM d, yyyy') {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, pattern)
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr) {
  return formatDate(dateStr, 'MMM d')
}

export function formatDateTime(dateStr) {
  return formatDate(dateStr, "MMM d, yyyy 'at' h:mm a")
}

/** Returns a tailwind-friendly semantic color for a trend label. */
export function trendColor(trend) {
  if (!trend) return 'text-slate-400'
  const t = trend.toLowerCase()
  if (t === 'bullish') return 'text-bullish'
  if (t === 'bearish') return 'text-bearish'
  return 'text-sideways'
}

export function trendBgColor(trend) {
  if (!trend) return 'bg-slate-500/10 border-slate-500/20'
  const t = trend.toLowerCase()
  if (t === 'bullish') return 'bg-bullish-soft border-bullish/30'
  if (t === 'bearish') return 'bg-bearish-soft border-bearish/30'
  return 'bg-sideways-soft border-sideways/30'
}

/** Color helper for a numeric value: green if positive, red if negative. */
export function changeColor(value) {
  if (value > 0) return 'text-bullish'
  if (value < 0) return 'text-bearish'
  return 'text-slate-400'
}
