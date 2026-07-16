import { coins } from '../../data/coinData'

/** Segmented-button coin selector used across dashboard/analysis pages. */
export default function CoinSelector({ value, onChange, className = '' }) {
  return (
    <div role="tablist" aria-label="Select cryptocurrency" className={`flex flex-wrap gap-1 rounded-xl border border-border bg-white/[0.02] p-1 ${className}`}>
      {coins.map((coin) => {
        const active = coin.id === value
        return (
          <button
            key={coin.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(coin.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              active ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: coin.color }} />
            {coin.symbol}
          </button>
        )
      })}
    </div>
  )
}
