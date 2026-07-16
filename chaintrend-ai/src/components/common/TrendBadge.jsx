import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { trendBgColor, trendColor } from '../../utils/formatters'

export default function TrendBadge({ trend = 'Sideways', size = 'md' }) {
  const Icon = trend === 'Bullish' ? TrendingUp : trend === 'Bearish' ? TrendingDown : Minus
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
  return (
    <span className={`badge ${padding} ${trendBgColor(trend)} ${trendColor(trend)}`}>
      <Icon className="h-3.5 w-3.5" />
      {trend}
    </span>
  )
}
