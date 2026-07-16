import Sparkline from '../charts/Sparkline'
import InfoTooltip from '../common/InfoTooltip'

const STATUS_COLORS = {
  Bullish: 'text-bullish', Overbought: 'text-bearish', Oversold: 'text-bullish',
  Bearish: 'text-bearish', Neutral: 'text-sideways', Positive: 'text-bullish', Negative: 'text-bearish',
}

/** Small card used in the technical-indicator grid: value + status + sparkline. */
export default function IndicatorCard({ name, value, status, explanation, sparklineData, color = '#818cf8' }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          {name}
          {explanation && <InfoTooltip term={name}>{explanation}</InfoTooltip>}
        </p>
        {status && <span className={`text-[11px] font-semibold ${STATUS_COLORS[status] || 'text-slate-400'}`}>{status}</span>}
      </div>
      <p className="mt-1.5 text-lg font-bold text-white">{value}</p>
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-2 -ml-1">
          <Sparkline data={sparklineData} color={color} />
        </div>
      )}
    </div>
  )
}
