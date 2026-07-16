import { useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import CoinSelector from '../components/common/CoinSelector'
import Dropdown from '../components/common/Dropdown'
import ChartCard from '../components/charts/ChartCard'
import PriceChart from '../components/charts/PriceChart'
import ComparisonBarChart from '../components/charts/ComparisonBarChart'
import ExplainerBox from '../components/common/ExplainerBox'
import { ChartSkeleton } from '../components/common/LoadingSkeleton'
import { useCoin } from '../hooks/useCoin'
import { useHistoricalData } from '../hooks/useMarketData'
import { coins } from '../data/coinData'
import { getRecentHistory } from '../data/mockDataGenerator'

const PERIODS = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
  { value: 365, label: '1 Year' },
  { value: 1095, label: '3 Years' },
  { value: 1460, label: '5 Years (max mock history)' },
]

export default function TimeSeriesPage() {
  const { coin, coinId, setCoinId } = useCoin()
  const [period, setPeriod] = useState(90)
  const { data: history, loading } = useHistoricalData(coinId, period)

  const monthlyPerformance = useMemo(() => {
    if (!history) return []
    const byMonth = {}
    history.forEach((c) => {
      const key = c.date.slice(0, 7)
      if (!byMonth[key]) byMonth[key] = { start: c.close, end: c.close }
      byMonth[key].end = c.close
    })
    return Object.entries(byMonth).map(([month, v]) => ({
      name: month.slice(2),
      returnPct: Number((((v.end - v.start) / v.start) * 100).toFixed(2)),
    })).slice(-12)
  }, [history])

  const correlationData = useMemo(() => {
    const others = coins.filter((c) => c.id !== coinId)
    return others.map((other) => {
      const a = getRecentHistory(coin, 180).map((c) => c.dailyReturn || 0)
      const b = getRecentHistory(other, 180).map((c) => c.dailyReturn || 0)
      return { name: other.symbol, correlation: Number(pearsonCorrelation(a, b).toFixed(2)) }
    })
  }, [coin, coinId])

  if (loading || !history) {
    return (
      <div>
        <PageHeader title="Time-Series Analysis" description="Loading historical data…" />
        <ChartSkeleton height={420} />
      </div>
    )
  }

  const returns = history.map((c) => ({ date: c.date, close: c.dailyReturn }))
  const rollingMean = history.map((c) => ({ date: c.date, close: c.sma20 }))
  const rollingVol = history.map((c) => ({ date: c.date, close: c.volatility20 }))
  const drawdownSeries = buildDrawdown(history)

  return (
    <div>
      <PageHeader
        title="Time-Series Analysis"
        description={`Historical statistical analysis for ${coin.name} (${coin.symbol})`}
        actions={
          <>
            <CoinSelector value={coinId} onChange={setCoinId} />
            <Dropdown label="Period" value={period} onChange={setPeriod} options={PERIODS.map((p) => ({ value: p.value, label: p.label }))} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Historical Price" description="Daily closing price over the selected period">
          <PriceChart data={history} mode="area" color={coin.color} />
        </ChartCard>

        <ChartCard title="Open, High, Low, Close" description="Candlestick-style OHLC view">
          <PriceChart data={history.map((c) => ({ ...c, close: c.high }))} mode="line" color="#f59e0b" />
        </ChartCard>
      </div>
      <ExplainerBox>
        The historical price chart shows daily closing prices. The OHLC view highlights the daily high as a
        proxy for intraday range — useful for spotting volatile trading sessions.
      </ExplainerBox>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Daily Returns (%)" description="Day-over-day percentage change in closing price">
          <PriceChart data={returns} mode="line" color="#38bdf8" unit="percent" />
        </ChartCard>
        <ChartCard title="Rolling Mean (20-Day)" description="Smoothed price trend using a 20-day moving average">
          <PriceChart data={rollingMean} mode="line" color="#c084fc" />
        </ChartCard>
      </div>
      <ExplainerBox>
        Daily returns measure how much the price moved from one day to the next — spikes indicate high-impact
        trading days. Rolling mean smooths short-term noise to reveal the underlying trend direction.
      </ExplainerBox>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Rolling Volatility (20-Day)" description="Annualised standard deviation of daily returns">
          <PriceChart data={rollingVol} mode="area" color="#f43f5e" unit="percent" />
        </ChartCard>
        <ChartCard title="Volume" description="Daily trading volume">
          <PriceChart data={history.map((c) => ({ date: c.date, close: c.volume }))} mode="area" color="#22c55e" unit="number" />
        </ChartCard>
      </div>
      <ExplainerBox>
        Rolling volatility measures how strongly the price has fluctuated during the selected time window —
        higher values mean a riskier, choppier market. Volume shows how much trading activity backed each
        price move; large moves on high volume are generally considered more significant.
      </ExplainerBox>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Drawdown" description="Percentage decline from the running peak price">
          <PriceChart data={drawdownSeries} mode="area" color="#f43f5e" unit="percent" />
        </ChartCard>
        <ChartCard title="Monthly Performance" description="Percentage return by calendar month">
          <ComparisonBarChart data={monthlyPerformance} bars={[{ key: 'returnPct', name: 'Monthly Return %', color: '#818cf8' }]} />
        </ChartCard>
      </div>
      <ExplainerBox>
        Drawdown shows how far the price has fallen from its most recent peak, in percentage terms — a key
        risk indicator. Monthly performance breaks total returns into calendar months to reveal seasonal
        patterns.
      </ExplainerBox>

      <div className="mt-6">
        <ChartCard title={`${coin.symbol} Correlation with Other Assets`} description="Pearson correlation of daily returns over the last 180 days" height={260}>
          <ComparisonBarChart data={correlationData} bars={[{ key: 'correlation', name: 'Correlation', color: '#38bdf8' }]} />
        </ChartCard>
        <ExplainerBox title="How to understand correlation">
          A correlation near +1 means two assets tend to move together; near -1 means they move oppositely;
          near 0 means little relationship. This helps evaluate diversification benefits across chains.
        </ExplainerBox>
      </div>

      <div className="mt-6 card flex items-start gap-3 p-4">
        <Activity className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
        <p className="text-xs text-slate-500">
          All charts on this page use the same deterministic mock historical dataset used throughout the app,
          so numbers stay consistent across pages during this demo.
        </p>
      </div>
    </div>
  )
}

function buildDrawdown(history) {
  let peak = history[0].close
  return history.map((c) => {
    peak = Math.max(peak, c.close)
    return { date: c.date, close: ((c.close - peak) / peak) * 100 }
  })
}

function pearsonCorrelation(a, b) {
  const n = Math.min(a.length, b.length)
  const meanA = a.slice(0, n).reduce((s, v) => s + v, 0) / n
  const meanB = b.slice(0, n).reduce((s, v) => s + v, 0) / n
  let num = 0, denomA = 0, denomB = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA
    const db = b[i] - meanB
    num += da * db
    denomA += da * da
    denomB += db * db
  }
  const denom = Math.sqrt(denomA * denomB)
  return denom === 0 ? 0 : num / denom
}
