import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import CoinSelector from '../components/common/CoinSelector'
import ChartCard from '../components/charts/ChartCard'
import PriceChart from '../components/charts/PriceChart'
import ComparisonBarChart from '../components/charts/ComparisonBarChart'
import RiskMeter from '../components/common/RiskMeter'
import InfoTooltip from '../components/common/InfoTooltip'
import DataTable from '../components/tables/DataTable'
import { ChartSkeleton } from '../components/common/LoadingSkeleton'
import { useCoin } from '../hooks/useCoin'
import { getRiskMetrics } from '../services/api'
import { coins } from '../data/coinData'
import { formatPercent } from '../utils/formatters'
import { modelExplanations } from '../data/modelData'

export default function RiskAnalysisPage() {
  const { coin, coinId, setCoinId } = useCoin()
  const [risk, setRisk] = useState(null)
  const [allRisk, setAllRisk] = useState(null)

  useEffect(() => {
    getRiskMetrics(coinId).then(setRisk)
  }, [coinId])

  useEffect(() => {
    Promise.all(coins.map((c) => getRiskMetrics(c.id).then((r) => ({ ...r, symbol: c.symbol })))).then(setAllRisk)
  }, [])

  const returnDistribution = useMemo(() => {
    if (!risk) return []
    const buckets = Array.from({ length: 20 }, (_, i) => ({ bucket: i, count: 0, label: '' }))
    const min = Math.min(...risk.returnDistribution)
    const max = Math.max(...risk.returnDistribution)
    const width = (max - min) / 20 || 1
    risk.returnDistribution.forEach((r) => {
      const idx = Math.min(19, Math.floor((r - min) / width))
      buckets[idx].count += 1
      buckets[idx].label = (min + idx * width).toFixed(1)
    })
    return buckets.map((b) => ({ name: `${b.label}%`, count: b.count }))
  }, [risk])

  if (!risk) {
    return (
      <div>
        <PageHeader title="Risk Analysis" description="Loading risk metrics…" />
        <ChartSkeleton height={420} />
      </div>
    )
  }

  const comparisonColumns = [
    { key: 'symbol', label: 'Coin', sortable: true },
    { key: 'volatility', label: 'Volatility (Annualised)', sortable: true, render: (r) => `${r.volatility.toFixed(1)}%` },
    { key: 'maxDrawdown', label: 'Max Drawdown', sortable: true, render: (r) => formatPercent(r.maxDrawdown) },
    { key: 'sharpeRatio', label: 'Sharpe Ratio', sortable: true, render: (r) => r.sharpeRatio.toFixed(2) },
    { key: 'sortinoRatio', label: 'Sortino Ratio', sortable: true, render: (r) => r.sortinoRatio.toFixed(2) },
    { key: 'valueAtRisk95', label: 'VaR (95%)', sortable: true, render: (r) => formatPercent(r.valueAtRisk95) },
    { key: 'riskLevel', label: 'Risk Level' },
  ]

  return (
    <div>
      <PageHeader
        title="Risk Analysis"
        description={`Volatility and downside-risk profile for ${coin.name} (${coin.symbol})`}
        actions={<CoinSelector value={coinId} onChange={setCoinId} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Volatility (Annualised)" value={`${risk.volatility.toFixed(1)}%`} />
        <StatCard label="Maximum Drawdown" value={formatPercent(risk.maxDrawdown)} tooltip={modelExplanations.confidenceInterval} />
        <StatCard label="Sharpe Ratio" value={risk.sharpeRatio.toFixed(2)} />
        <StatCard label="Sortino Ratio" value={risk.sortinoRatio.toFixed(2)} />
        <StatCard label="Value at Risk (95%)" value={formatPercent(risk.valueAtRisk95)} />
        <StatCard label="Liquidity Score" value={`${risk.liquidityScore}/100`} />
        <div className="card p-5 sm:col-span-2 lg:col-span-2">
          <p className="label-caps mb-3">Risk Classification</p>
          <RiskMeter level={risk.riskLevel} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Drawdown Graph" description="Percentage decline from the running peak price">
          <PriceChart data={risk.drawdownSeries.map((d) => ({ date: d.date, close: d.drawdown }))} mode="area" color="#f43f5e" unit="percent" />
        </ChartCard>
        <ChartCard title="Return Distribution" description="Histogram of daily returns over the last year">
          <ComparisonBarChart data={returnDistribution} bars={[{ key: 'count', name: 'Frequency', color: '#818cf8' }]} />
        </ChartCard>
      </div>

      <div className="mt-5">
        <ChartCard title="Volatility History" description="20-day rolling annualised volatility over the last year">
          <PriceChart data={risk.volatilityHistory.map((v) => ({ date: v.date, close: v.volatility }))} mode="area" color="#f59e0b" unit="percent" />
        </ChartCard>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="mb-4 text-base font-semibold text-white">Risk Comparison — ETH vs BNB vs TRX vs BTC</h2>
        <DataTable columns={comparisonColumns} rows={allRisk || []} loading={!allRisk} pageSize={10} />
      </div>

      <div className="mt-6 card p-5 text-sm leading-relaxed text-slate-400">
        <p className="mb-2 font-semibold text-slate-200">Understanding these metrics</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-slate-300">Volatility</strong> measures how much the price fluctuates — higher volatility means higher risk and higher potential reward.</li>
          <li><strong className="text-slate-300">Maximum Drawdown</strong> is the largest peak-to-trough decline, showing worst-case historical loss.</li>
          <li><strong className="text-slate-300">Sharpe Ratio</strong> measures risk-adjusted return; higher is generally better.</li>
          <li><strong className="text-slate-300">Sortino Ratio</strong> is similar to Sharpe but only penalises downside volatility.</li>
          <li><strong className="text-slate-300">Value at Risk (VaR)</strong> estimates the worst expected daily loss at a given confidence level.</li>
        </ul>
      </div>
    </div>
  )
}

function StatCard({ label, value, tooltip }) {
  return (
    <div className="card p-5">
      <p className="label-caps flex items-center gap-1">{label} {tooltip && <InfoTooltip term={label}>{tooltip}</InfoTooltip>}</p>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  )
}
