export default function ConfidenceMeter({ value = 0.7, label = 'Model Confidence' }) {
  const pct = Math.round(value * 100)
  const color = pct >= 75 ? 'bg-bullish' : pct >= 55 ? 'bg-sideways' : 'bg-bearish'
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="label-caps">{label}</span>
        <span className="font-semibold text-slate-200">{pct}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
