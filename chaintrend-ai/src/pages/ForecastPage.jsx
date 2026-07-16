import { useMemo, useState } from 'react'
import { Info, CalendarDays } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import CoinSelector from '../components/common/CoinSelector'
import Tabs from '../components/common/Tabs'
import ChartCard from '../components/charts/ChartCard'
import PriceChart from '../components/charts/PriceChart'
import TrendBadge from '../components/common/TrendBadge'
import ConfidenceMeter from '../components/common/ConfidenceMeter'
import Disclaimer from '../components/common/Disclaimer'
import { ChartSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton'
import { useCoin } from '../hooks/useCoin'
import { usePrediction } from '../hooks/usePrediction'
import { useHistoricalData } from '../hooks/useMarketData'
import { formatCurrency, formatPercent, formatDate, changeColor } from '../utils/formatters'

const HORIZONS = [
  { id: '1d', label: 'Day 1' },
  { id: '7d', label: '7-Day' },
  { id: '30d', label: '30-Day (placeholder)' },
]

export default function ForecastPage() {
  const { coin, coinId, setCoinId } = useCoin()
  const [horizon, setHorizon] = useState('7d')
  const { data: prediction, loading } = usePrediction(coinId)
  const { data: history, loading: historyLoading } = useHistoricalData(coinId, 60)

  const combinedChart = useMemo(() => {
    if (!history || !prediction) return []
    const historical = history.map((c) => ({ date: c.date, close: c.close, predicted: null, lower: null, upper: null }))
    const future = prediction.forecast.map((f) => ({ date: f.date, close: null, predicted: f.price, lower: f.lower, upper: f.upper }))
    return [...historical, ...future]
  }, [history, prediction])

  const isThirtyDay = horizon === '30d'

  return (
    <div>
      <PageHeader
        title="Price Forecasting"
        description={`Forward-looking price predictions for ${coin.name} (${coin.symbol})`}
        actions={
          <>
            <CoinSelector value={coinId} onChange={setCoinId} />
            <Tabs items={HORIZONS} activeId={horizon} onChange={setHorizon} />
          </>
        }
      />

      <div className="card mb-6 flex items-start gap-3 border-sideways/20 bg-sideways-soft/30 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sideways" />
        <p className="text-xs text-slate-400">
          This prediction is generated using mock frontend data. It will be replaced by the trained
          machine-learning model API described in the project README.
        </p>
      </div>

      {isThirtyDay ? (
        <div className="card flex flex-col items-center justify-center gap-3 p-16 text-center">
          <CalendarDays className="h-8 w-8 text-slate-500" />
          <p className="text-sm font-semibold text-slate-200">30-Day Forecast — Coming with the trained model</p>
          <p className="max-w-md text-sm text-slate-500">
            Longer-horizon forecasting requires the full LSTM / hybrid ensemble model described in the
            Methodology page. This placeholder will call the same <code className="text-brand-300">getPrediction(coin, '30d')</code> function once the backend is live.
          </p>
        </div>
      ) : (
        <>
          {loading || historyLoading ? (
            <ChartSkeleton height={380} />
          ) : (
            <ChartCard title={`${coin.symbol} Forecast Chart`} description="Historical price transitions into the predicted future segment, shown with a confidence interval" height={380}>
              <PriceChart data={combinedChart} mode="actual-vs-predicted" showConfidenceInterval color={coin.color} />
            </ChartCard>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading || !prediction ? (
              Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <SummaryStat label="Expected Return" value={formatPercent(horizon === '1d' ? prediction.expectedReturn : prediction.sevenDayReturn)} color={changeColor(prediction.expectedReturn)} />
                <SummaryStat label="Predicted Minimum" value={formatCurrency(Math.min(...prediction.forecast.map((f) => f.lower)))} />
                <SummaryStat label="Predicted Maximum" value={formatCurrency(Math.max(...prediction.forecast.map((f) => f.upper)))} />
                <SummaryStat label="Confidence Score" value={`${Math.round(prediction.confidence * 100)}%`} />
              </>
            )}
          </div>

          {!loading && prediction && (
            <div className="mt-6 card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <TrendBadge trend={prediction.trend} />
                  <p className="text-sm text-slate-400">Forecast Summary</p>
                </div>
                <div className="w-48"><ConfidenceMeter value={prediction.confidence} label="Confidence" /></div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{prediction.explanation}</p>
            </div>
          )}

          <h2 className="mb-3 mt-8 text-base font-semibold text-white">7-Day Forecast Breakdown</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {loading || !prediction
              ? Array.from({ length: 7 }).map((_, i) => <CardSkeleton key={i} />)
              : prediction.forecast.map((f, i) => (
                  <div key={f.date} className="card p-4">
                    <p className="label-caps">Day {i + 1}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(f.date, 'MMM d')}</p>
                    <p className="mt-2 text-sm font-bold text-white">{formatCurrency(f.price, { compact: true })}</p>
                    <p className={`mt-1 text-xs font-semibold ${changeColor(f.changePct)}`}>{formatPercent(f.changePct)}</p>
                    <div className="mt-2">
                      <TrendBadge trend={f.changePct > 0.2 ? 'Bullish' : f.changePct < -0.2 ? 'Bearish' : 'Sideways'} size="sm" />
                    </div>
                  </div>
                ))}
          </div>
        </>
      )}

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  )
}

function SummaryStat({ label, value, color = 'text-white' }) {
  return (
    <div className="card p-5">
      <p className="label-caps">{label}</p>
      <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
