import { changeColor } from '../../utils/formatters'
import InfoTooltip from './InfoTooltip'

/**
 * Generic metric/summary card used throughout the dashboard.
 * value/subValue are pre-formatted strings so this component stays
 * decoupled from currency/percentage formatting rules.
 */
export default function MetricCard({ label, value, change, icon: Icon, tooltip, accent = 'default' }) {
  const accentClasses = {
    default: 'text-slate-300',
    brand: 'text-brand-300',
  }
  return (
    <div className="card card-hover p-5">
      <div className="flex items-center justify-between">
        <p className="label-caps flex items-center gap-1.5">
          {label}
          {tooltip && <InfoTooltip term={label}>{tooltip}</InfoTooltip>}
        </p>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
            <Icon className={`h-4 w-4 ${accentClasses[accent]}`} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</p>
      {change !== undefined && change !== null && (
        <p className={`mt-1 text-sm font-medium ${changeColor(change)}`}>
          {change > 0 ? '▲' : change < 0 ? '▼' : '—'} {Math.abs(change).toFixed(2)}%
        </p>
      )}
    </div>
  )
}
