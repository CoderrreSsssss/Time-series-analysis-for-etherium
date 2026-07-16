const LEVELS = { Low: { pct: 25, color: 'bg-bullish', text: 'text-bullish' }, Moderate: { pct: 60, color: 'bg-sideways', text: 'text-sideways' }, High: { pct: 90, color: 'bg-bearish', text: 'text-bearish' } }

export default function RiskMeter({ level = 'Moderate' }) {
  const cfg = LEVELS[level] || LEVELS.Moderate
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="label-caps">Risk Level</span>
        <span className={`font-semibold ${cfg.text}`}>{level}</span>
      </div>
      <div className="mt-1.5 flex h-2 w-full gap-1">
        {['Low', 'Moderate', 'High'].map((seg) => (
          <div
            key={seg}
            className={`h-full flex-1 rounded-full transition-colors ${
              LEVELS[seg].pct <= cfg.pct ? cfg.color : 'bg-white/[0.06]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
