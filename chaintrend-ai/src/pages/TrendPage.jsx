import { useMemo } from 'react'
import PageHeader from '../components/layout/PageHeader'
import CoinSelector from '../components/common/CoinSelector'
import ChartCard from '../components/charts/ChartCard'
import ComparisonBarChart from '../components/charts/ComparisonBarChart'
import TrendBadge from '../components/common/TrendBadge'
import ConfidenceMeter from '../components/common/ConfidenceMeter'
import InfoTooltip from '../components/common/InfoTooltip'
import { ChartSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton'
import { useCoin } from '../hooks/useCoin'
import { usePrediction } from '../hooks/usePrediction'
import { getTrendTimeline } from '../utils/predictionMock'
import { classificationMetrics, modelExplanations } from '../data/modelData'
import { formatDate } from '../utils/formatters'
import ConfusionMatrix from '../components/dashboard/ConfusionMatrix'

export default function TrendPage() {
  const { coin, coinId, setCoinId } = useCoin()
  const { data: prediction, loading } = usePrediction(coinId)
  const timeline = useMemo(() => getTrendTimeline(coin, 30), [coin])

  const probData = prediction
    ? [
        { name: 'Bullish', value: Math.round(prediction.probabilities.bullish * 100), color: '#22c55e' },
        { name: 'Sideways', value: Math.round(prediction.probabilities.sideways * 100), color: '#f59e0b' },
        { name: 'Bearish', value: Math.round(prediction.probabilities.bearish * 100), color: '#f43f5e' },
      ]
    : []

  return (
    <div>
      <PageHeader
        title="Trend Classification"
        description={`Bullish / Bearish / Sideways classification for ${coin.name} (${coin.symbol})`}
        actions={<CoinSelector value={coinId} onChange={setCoinId} />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <p className="label-caps">Current Predicted Trend</p>
          {loading || !prediction ? (
            <CardSkeleton />
          ) : (
            <>
              <div className="mt-3"><TrendBadge trend={prediction.trend} /></div>
              <div className="mt-4"><ConfidenceMeter value={prediction.confidence} /></div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">{prediction.explanation}</p>
            </>
          )}
        </div>

        <ChartCard title="Trend Probability Distribution" description="Model-estimated probability across all three classes" height={260} footer={null}>
          {loading ? <ChartSkeleton height={260} /> : <ComparisonBarChart data={probData} bars={[{ key: 'value', name: 'Probability %', color: '#818cf8' }]} highlightIndex={probData.findIndex((p) => p.name === prediction?.trend)} />}
        </ChartCard>

        <div className="card p-5">
          <p className="label-caps mb-3">Probability Card</p>
          {probData.map((p) => (
            <div key={p.name} className="mb-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{p.name}</span>
                <span className="font-semibold text-slate-200">{p.value}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full" style={{ width: `${p.value}%`, backgroundColor: p.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <ChartCard title="Trend History Timeline" description="How the classified trend changed over the last 30 days" height={280}>
          <TrendTimelineChart timeline={timeline} />
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <p className="mb-4 text-sm font-semibold text-white">Confusion Matrix</p>
          <ConfusionMatrix data={classificationMetrics.confusionMatrix} />
        </div>
        <div className="card p-5">
          <p className="mb-4 text-sm font-semibold text-white">Classification Metrics</p>
          <div className="grid grid-cols-2 gap-3">
            <MetricTile label="Precision" value={classificationMetrics.precision} tooltip={modelExplanations.precision} />
            <MetricTile label="Recall" value={classificationMetrics.recall} tooltip={modelExplanations.recall} />
            <MetricTile label="F1 Score" value={classificationMetrics.f1Score} tooltip={modelExplanations.f1} />
            <MetricTile label="Balanced Accuracy" value={classificationMetrics.balancedAccuracy} />
          </div>
          <p className="mt-4 text-sm font-semibold text-white">Classification Report</p>
          <table className="mt-2 w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500">
                <th className="py-1.5">Class</th><th>Precision</th><th>Recall</th><th>F1</th><th>Support</th>
              </tr>
            </thead>
            <tbody>
              {classificationMetrics.report.map((r) => (
                <tr key={r.label} className="border-t border-border/60 text-slate-300">
                  <td className="py-1.5">{r.label}</td><td>{r.precision}</td><td>{r.recall}</td><td>{r.f1}</td><td>{r.support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricTile({ label, value, tooltip }) {
  return (
    <div className="rounded-lg border border-border bg-white/[0.02] p-3">
      <p className="label-caps flex items-center gap-1">{label} {tooltip && <InfoTooltip term={label}>{tooltip}</InfoTooltip>}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  )
}

function TrendTimelineChart({ timeline }) {
  return (
    <div className="flex h-full items-end gap-1">
      {timeline.map((t) => {
        const color = t.trend === 'Bullish' ? 'bg-bullish' : t.trend === 'Bearish' ? 'bg-bearish' : 'bg-sideways'
        return (
          <div key={t.date} className="group relative flex-1">
            <div className={`w-full rounded-t ${color}`} style={{ height: 60 }} title={`${formatDate(t.date)} — ${t.trend}`} />
            <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-bg-elevated px-2 py-1 text-[10px] text-slate-300 group-hover:block">
              {formatDate(t.date, 'MMM d')} · {t.trend}
            </div>
          </div>
        )
      })}
    </div>
  )
}
