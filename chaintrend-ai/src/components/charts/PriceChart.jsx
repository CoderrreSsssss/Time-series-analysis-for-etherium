import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatDateShort, formatCurrency } from '../../utils/formatters'
import { PriceTooltip } from './ChartTooltipContent'

function formatPercentValue(v) {
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(2)}%`
}
function formatCompact(v) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(v)
}

/**
 * Multi-purpose price chart: supports line, area, and "actual vs predicted"
 * modes, plus optional moving averages and a shaded confidence interval for
 * the forecasted segment.
 *
 * data: array of { date, close, sma20?, sma50?, predicted?, lower?, upper? }
 */
export default function PriceChart({
  data,
  mode = 'area', // 'line' | 'area' | 'actual-vs-predicted'
  showMovingAverages = false,
  showConfidenceInterval = false,
  color = '#818cf8',
  unit = 'currency', // 'currency' | 'percent' | 'number'
}) {
  const valueFormatter =
    unit === 'percent' ? (v) => formatPercentValue(v) : unit === 'number' ? (v) => formatCompact(v) : (v) => formatCurrency(v)
  const axisFormatter =
    unit === 'percent' ? (v) => `${v.toFixed(1)}%` : unit === 'number' ? (v) => formatCompact(v) : (v) => formatCurrency(v, { compact: true })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          stroke="rgba(148,163,184,0.4)"
          tick={{ fontSize: 11, fill: '#64748b' }}
          minTickGap={40}
        />
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={axisFormatter}
          stroke="rgba(148,163,184,0.4)"
          tick={{ fontSize: 11, fill: '#64748b' }}
          width={70}
        />
        <Tooltip content={<PriceTooltip valueFormatter={valueFormatter} />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />

        {showConfidenceInterval && (
          <>
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#priceFill)" fillOpacity={0.5} name="Confidence Upper" legendType="none" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#05070d" fillOpacity={1} name="Confidence Lower" legendType="none" />
          </>
        )}

        {mode === 'area' && (
          <Area type="monotone" dataKey="close" name="Price" stroke={color} strokeWidth={2} fill="url(#priceFill)" dot={false} />
        )}
        {mode === 'line' && (
          <Line type="monotone" dataKey="close" name="Price" stroke={color} strokeWidth={2} dot={false} />
        )}
        {mode === 'actual-vs-predicted' && (
          <>
            <Line type="monotone" dataKey="close" name="Actual Price" stroke={color} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="predicted" name="Predicted Price" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" dot={false} />
          </>
        )}

        {showMovingAverages && (
          <>
            <Line type="monotone" dataKey="sma20" name="SMA 20" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="#c084fc" strokeWidth={1.5} dot={false} />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
