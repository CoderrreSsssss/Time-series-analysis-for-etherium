import { useMemo } from 'react'
import { Trophy, TrendingDown as TrendDownIcon } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import CoinSelector from '../components/common/CoinSelector'
import ChartCard from '../components/charts/ChartCard'
import PriceChart from '../components/charts/PriceChart'
import ScatterChartCard from '../components/charts/ScatterChartCard'
import DataTable from '../components/tables/DataTable'
import InfoTooltip from '../components/common/InfoTooltip'
import { useCoin } from '../hooks/useCoin'
import { getRecentPredictionsTable } from '../utils/predictionMock'
import { formatCurrency, formatPercent, formatDate, changeColor } from '../utils/formatters'
import { modelExplanations } from '../data/modelData'

export default function ActualPredictedPage() {
  const { coin, coinId, setCoinId } = useCoin()
  const predictions = useMemo(() => getRecentPredictionsTable(coin, 60), [coin])

  const chartData = useMemo(
    () => [...predictions].reverse().map((p) => ({ date: p.date, close: p.actualPrice, predicted: p.predictedPrice })),
    [predictions]
  )
  const errorSeries = useMemo(() => [...predictions].reverse().map((p) => ({ date: p.date, close: p.errorPct })), [predictions])
  const scatterData = useMemo(() => predictions.map((p) => ({ x: p.actualPrice, y: p.predictedPrice })), [predictions])

  const metrics = useMemo(() => computeMetrics(predictions), [predictions])
  const best = useMemo(() => [...predictions].sort((a, b) => Math.abs(a.errorPct) - Math.abs(b.errorPct)).slice(0, 3), [predictions])
  const worst = useMemo(() => [...predictions].sort((a, b) => Math.abs(b.errorPct) - Math.abs(a.errorPct)).slice(0, 3), [predictions])

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'actualPrice', label: 'Actual', sortable: true, render: (r) => formatCurrency(r.actualPrice) },
    { key: 'predictedPrice', label: 'Predicted', sortable: true, render: (r) => formatCurrency(r.predictedPrice) },
    { key: 'errorPct', label: 'Error %', sortable: true, render: (r) => <span className={changeColor(-Math.abs(r.errorPct))}>{formatPercent(r.errorPct)}</span> },
    { key: 'result', label: 'Directional Result', render: (r) => (
      <span className={`badge ${r.result === 'Correct' ? 'border-bullish/30 bg-bullish-soft text-bullish' : 'border-bearish/30 bg-bearish-soft text-bearish'}`}>{r.result}</span>
    ) },
  ]

  return (
    <div>
      <PageHeader
        title="Actual vs Predicted"
        description={`Model accuracy diagnostics for ${coin.name} (${coin.symbol}) over the last 60 trading days`}
        actions={<CoinSelector value={coinId} onChange={setCoinId} />}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Actual vs Predicted Price" description="Model forecast overlaid on realised price" height={360}>
            <PriceChart data={chartData} mode="actual-vs-predicted" color={coin.color} />
          </ChartCard>
        </div>
        <ChartCard title="Prediction Error (%)" description="Signed percentage error per day" height={360}>
          <PriceChart data={errorSeries} mode="line" color="#f43f5e" unit="percent" />
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Residual Scatter" description="Predicted price vs actual price — points near the diagonal are more accurate" height={320}>
          <ScatterChartCard data={scatterData} xLabel="Actual" yLabel="Predicted" color={coin.color} />
        </ChartCard>
        <div className="card p-5">
          <p className="label-caps mb-4">Directional Accuracy</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-white">{metrics.directionalAccuracy}%</p>
            <p className="mb-1 text-sm text-slate-500">of trend calls were correct</p>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${metrics.directionalAccuracy}%` }} />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Directional accuracy shows how often the model correctly predicted the direction of price movement (up vs down), regardless of the exact magnitude.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricTile label="MAE" value={`$${metrics.mae}`} tooltip={modelExplanations.mae} />
        <MetricTile label="RMSE" value={`$${metrics.rmse}`} tooltip={modelExplanations.rmse} />
        <MetricTile label="MAPE" value={`${metrics.mape}%`} tooltip={modelExplanations.mape} />
        <MetricTile label="R²" value={metrics.r2} tooltip={modelExplanations.r2} />
        <MetricTile label="Directional Acc." value={`${metrics.directionalAccuracy}%`} tooltip={modelExplanations.directionalAccuracy} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-white"><Trophy className="h-4 w-4 text-bullish" /> Best Predictions</p>
          <ul className="space-y-2 text-sm">
            {best.map((p) => (
              <li key={p.id} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                <span className="text-slate-400">{formatDate(p.date)}</span>
                <span className={changeColor(-Math.abs(p.errorPct))}>{formatPercent(p.errorPct)} error</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-white"><TrendDownIcon className="h-4 w-4 text-bearish" /> Worst Predictions</p>
          <ul className="space-y-2 text-sm">
            {worst.map((p) => (
              <li key={p.id} className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
                <span className="text-slate-400">{formatDate(p.date)}</span>
                <span className="text-bearish">{formatPercent(p.errorPct)} error</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="mb-4 text-base font-semibold text-white">Recent Prediction Comparison</h2>
        <DataTable columns={columns} rows={predictions} pageSize={10} />
      </div>
    </div>
  )
}

function MetricTile({ label, value, tooltip }) {
  return (
    <div className="card p-4">
      <p className="label-caps flex items-center gap-1">
        {label} <InfoTooltip term={label}>{tooltip}</InfoTooltip>
      </p>
      <p className="mt-1.5 text-lg font-bold text-white">{value}</p>
    </div>
  )
}

function computeMetrics(rows) {
  const n = rows.length
  const mae = rows.reduce((s, r) => s + Math.abs(r.error), 0) / n
  const rmse = Math.sqrt(rows.reduce((s, r) => s + r.error ** 2, 0) / n)
  const mape = rows.reduce((s, r) => s + Math.abs(r.errorPct), 0) / n
  const meanActual = rows.reduce((s, r) => s + r.actualPrice, 0) / n
  const ssTot = rows.reduce((s, r) => s + (r.actualPrice - meanActual) ** 2, 0)
  const ssRes = rows.reduce((s, r) => s + r.error ** 2, 0)
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot
  const correct = rows.filter((r) => r.result === 'Correct').length
  return {
    mae: mae.toFixed(2),
    rmse: rmse.toFixed(2),
    mape: mape.toFixed(2),
    r2: r2.toFixed(2),
    directionalAccuracy: Math.round((correct / n) * 100),
  }
}
