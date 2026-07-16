import { formatCurrency, formatDate } from '../../utils/formatters'

/** Shared custom tooltip for Recharts price charts. valueFormatter allows reuse for %/number series. */
export function PriceTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload || !payload.length) return null
  const fmt = valueFormatter || ((v) => formatCurrency(v))
  return (
    <div className="rounded-lg border border-border-strong bg-bg-elevated p-3 text-xs shadow-card">
      <p className="mb-1.5 font-semibold text-slate-300">{formatDate(label)}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-slate-200">
            {typeof p.value === 'number' ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}
