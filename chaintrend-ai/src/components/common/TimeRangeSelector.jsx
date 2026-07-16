import { projectConfig } from '../../config/projectConfig'

export default function TimeRangeSelector({ value, onChange, className = '' }) {
  return (
    <div role="tablist" aria-label="Select time range" className={`flex gap-1 rounded-xl border border-border bg-white/[0.02] p-1 ${className}`}>
      {projectConfig.timeRanges.map((range) => {
        const active = range.id === value
        return (
          <button
            key={range.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(range.id)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              active ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
            }`}
          >
            {range.label}
          </button>
        )
      })}
    </div>
  )
}
