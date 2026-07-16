import { useEffect, useMemo, useState } from 'react'
import {
  DollarSign, Activity, BarChart3, Wallet, TrendingUp, CalendarRange, Gauge, Percent,
  LineChart as LineChartIcon, AreaChart as AreaChartIcon, CandlestickChart as CandlestickIcon, GitCompareArrows,
  Smile, Meh, Frown,
} from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import CoinSelector from '../components/common/CoinSelector'
import TimeRangeSelector from '../components/common/TimeRangeSelector'
import MetricCard from '../components/common/MetricCard'
import ChartCard from '../components/charts/ChartCard'
import PriceChart from '../components/charts/PriceChart'
import CandlestickChart from '../components/charts/CandlestickChart'
import ConfidenceMeter from '../components/common/ConfidenceMeter'
import RiskMeter from '../components/common/RiskMeter'
import TrendBadge from '../components/common/TrendBadge'
import IndicatorCard from '../components/dashboard/IndicatorCard'
import DataTable from '../components/tables/DataTable'
import Disclaimer from '../components/common/Disclaimer'
import { ChartSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton'
import { useCoin } from '../hooks/useCoin'
import { useHistoricalData } from '../hooks/useMarketData'
import { usePrediction } from '../hooks/usePrediction'
import { useAppContext } from '../context/AppContext'
import { useToast } from '../hooks/useToast'
import { projectConfig } from '../config/projectConfig'
import { formatCurrency, formatPercent, formatDate, changeColor } from '../utils/formatters'
import { getRecentPredictionsTable } from '../utils/predictionMock'
import { getRiskMetrics } from '../services/api'

const RANGE_DAYS = Object.fromEntries(projectConfig.timeRanges.map((r) => [r.id, r.days]))

export default function DashboardPage() {
  const { coin, coinId, setCoinId } = useCoin()
  const { selectedRange, setSelectedRange } = useAppContext()
  const toast = useToast()

  const [chartMode, setChartMode] = useState('area')
  const [showMA, setShowMA] = useState(true)
  const [showVolume, setShowVolume] = useState(true)
  const [refreshTick, setRefreshTick] = useState(0)

  const { data: history, loading } = useHistoricalData(coinId, RANGE_DAYS[selectedRange])
  const { data: prediction, loading: predictionLoading } = usePrediction(coinId)

  const [risk, setRisk] = useState(null)
  useEffect(() => {
    getRiskMetrics(coinId).then(setRisk)
  }, [coinId, refreshTick])

  const last = history?.[history.length - 1]
  const prev = history?.[history.length - 2]
  const change24h = last && prev ? ((last.close - prev.close) / prev.close) * 100 : 0

  const chartData = useMemo(() => {
    if (!history) return []
    return history.map((c) => ({ ...c, predicted: c.close * (1 + (c.dailyReturn || 0) / 400) }))
  }, [history])

  const predictionsTable = useMemo(() => getRecentPredictionsTable(coin, 20), [coin])

  function handleRefresh() {
    setRefreshTick((t) => t + 1)
    toast.success('Dashboard data refreshed')
  }

  const chartModes = [
    { id: 'area', label: 'Area', icon: AreaChartIcon },
    { id: 'line', label: 'Line', icon: LineChartIcon },
    { id: 'candlestick', label: 'Candles', icon: CandlestickIcon },
    { id: 'actual-vs-predicted', label: 'Actual vs Predicted', icon: GitCompareArrows },
  ]

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'coin', label: 'Coin' },
    { key: 'actualPrice', label: 'Actual Price', sortable: true, render: (r) => formatCurrency(r.actualPrice) },
    { key: 'predictedPrice', label: 'Predicted Price', sortable: true, render: (r) => formatCurrency(r.predictedPrice) },
    { key: 'errorPct', label: 'Error', sortable: true, render: (r) => <span className={changeColor(-Math.abs(r.errorPct))}>{formatPercent(r.errorPct)}</span> },
    { key: 'predictedTrend', label: 'Predicted Trend', render: (r) => <TrendBadge trend={r.predictedTrend} size="sm" /> },
    { key: 'actualTrend', label: 'Actual Trend', render: (r) => <TrendBadge trend={r.actualTrend} size="sm" /> },
    { key: 'confidence', label: 'Confidence', sortable: true, render: (r) => `${Math.round(r.confidence * 100)}%` },
    { key: 'result', label: 'Result', render: (r) => (
      <span className={`badge ${r.result === 'Correct' ? 'border-bullish/30 bg-bullish-soft text-bullish' : 'border-bearish/30 bg-bearish-soft text-bearish'}`}>
        {r.result}
      </span>
    ) },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard Overview"
        description={`Real-time-style analytics and mock forecasts for ${coin.name} (${coin.symbol})`}
        showRefresh
        refreshing={false}
        onRefresh={handleRefresh}
        actions={<CoinSelector value={coinId} onChange={setCoinId} />}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading || !last ? (
          Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Current Price" value={formatCurrency(last.close)} change={change24h} icon={DollarSign} />
            <MetricCard label="24-Hour Change" value={formatPercent(change24h)} icon={Activity} accent="brand" />
            <MetricCard label="Market Capitalisation" value={formatCurrency(last.close * 100_000_000, { compact: true })} icon={Wallet} />
            <MetricCard label="Trading Volume" value={formatCurrency(last.volume, { compact: true })} icon={BarChart3} />
            <MetricCard
              label="Predicted Next-Day Price"
              value={predictionLoading ? '…' : formatCurrency(prediction?.nextDayPrice)}
              change={prediction?.expectedReturn}
              icon={TrendingUp}
              tooltip="The model's forecast for tomorrow's closing price, based on recent momentum and technical indicators."
              accent="brand"
            />
            <MetricCard
              label="Predicted 7-Day Return"
              value={predictionLoading ? '…' : formatPercent(prediction?.sevenDayReturn)}
              icon={CalendarRange}
              tooltip="Expected cumulative percentage return over the next 7 trading days."
            />
            <MetricCard
              label="Predicted Trend"
              value={predictionLoading ? '…' : prediction?.trend}
              icon={Gauge}
              tooltip="Bullish, bearish, or sideways classification for the next forecast horizon."
            />
            <MetricCard
              label="Model Confidence"
              value={predictionLoading ? '…' : `${Math.round((prediction?.confidence || 0) * 100)}%`}
              icon={Percent}
              tooltip="How confident the model is in this prediction, based on signal strength and historical accuracy."
            />
          </>
        )}
      </div>

      {/* Main chart + trend panel */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {loading || !chartData.length ? (
            <ChartSkeleton height={420} />
          ) : (
            <ChartCard
              title={`${coin.name} Price Chart`}
              description="Historical price with predicted overlay, moving averages, and confidence interval"
              height={380}
              actions={
                <>
                  <TimeRangeSelector value={selectedRange} onChange={setSelectedRange} />
                  <div className="flex gap-1 rounded-xl border border-border bg-white/[0.02] p-1">
                    {chartModes.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setChartMode(m.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          chartMode === m.id ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                        }`}
                        aria-pressed={chartMode === m.id}
                      >
                        <m.icon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              }
              footer={
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-3 text-xs text-slate-400">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={showMA} onChange={(e) => setShowMA(e.target.checked)} className="accent-brand-500" />
                    Moving Averages (SMA 20 / 50)
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={showVolume} onChange={(e) => setShowVolume(e.target.checked)} className="accent-brand-500" />
                    Show Volume
                  </label>
                </div>
              }
            >
              {chartMode === 'candlestick' ? (
                <CandlestickChart data={chartData} showVolume={showVolume} height={340} />
              ) : (
                <PriceChart data={chartData} mode={chartMode} showMovingAverages={showMA} color={coin.color} />
              )}
            </ChartCard>
          )}
        </div>

        {/* Trend prediction panel */}
        <div className="card p-5">
          <p className="label-caps">AI Trend Prediction</p>
          {predictionLoading || !prediction ? (
            <div className="mt-4 space-y-3">
              <CardSkeleton />
            </div>
          ) : (
            <>
              <div className="mt-3 flex items-center gap-3">
                <TrendBadge trend={prediction.trend} />
                <span className="text-sm text-slate-400">{prediction.horizon} Horizon</span>
              </div>
              <div className="mt-4">
                <ConfidenceMeter value={prediction.confidence} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="label-caps">Expected Move</p>
                  <p className={`mt-1 font-semibold ${changeColor(prediction.expectedReturn)}`}>{formatPercent(prediction.expectedReturn)}</p>
                </div>
                <div>
                  <p className="label-caps">Model Version</p>
                  <p className="mt-1 font-semibold text-slate-300">{prediction.modelVersion}</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-border bg-white/[0.02] p-3">
                <p className="text-xs leading-relaxed text-slate-400">{prediction.explanation}</p>
              </div>
            </>
          )}

          <div className="mt-5 border-t border-border pt-4">
            <p className="label-caps mb-2">Market Sentiment</p>
            <SentimentBar />
          </div>

          <div className="mt-5 border-t border-border pt-4">
            {risk && <RiskMeter level={risk.riskLevel} />}
          </div>
        </div>
      </div>

      {/* Technical indicator grid */}
      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-white">Technical Indicators</h2>
        {loading || !last ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <IndicatorCard name="RSI (14)" value={last.rsi14?.toFixed(1)} status={last.rsi14 > 70 ? 'Overbought' : last.rsi14 < 30 ? 'Oversold' : 'Neutral'} explanation="Relative Strength Index measures momentum on a 0-100 scale. Above 70 suggests overbought, below 30 suggests oversold." sparklineData={history.slice(-30).map((c) => c.rsi14 || 0)} />
            <IndicatorCard name="MACD" value={last.macd?.toFixed(2)} status={last.macd > last.macdSignal ? 'Bullish' : 'Bearish'} explanation="MACD tracks the relationship between two moving averages to reveal momentum shifts." sparklineData={history.slice(-30).map((c) => c.macd || 0)} />
            <IndicatorCard name="SMA 20" value={formatCurrency(last.sma20, { compact: true })} explanation="Simple Moving Average over the last 20 days — a short-term trend reference." sparklineData={history.slice(-30).map((c) => c.sma20 || 0)} />
            <IndicatorCard name="SMA 50" value={formatCurrency(last.sma50, { compact: true })} explanation="Simple Moving Average over the last 50 days — a medium-term trend reference." sparklineData={history.slice(-30).map((c) => c.sma50 || 0)} />
            <IndicatorCard name="EMA 12" value={formatCurrency(last.ema12, { compact: true })} explanation="Exponential Moving Average weighting recent prices more heavily over 12 days." sparklineData={history.slice(-30).map((c) => c.ema12 || 0)} />
            <IndicatorCard name="EMA 26" value={formatCurrency(last.ema26, { compact: true })} explanation="Exponential Moving Average weighting recent prices more heavily over 26 days." sparklineData={history.slice(-30).map((c) => c.ema26 || 0)} />
            <IndicatorCard name="Bollinger Position" value={bollingerPosition(last)} status={bollingerStatus(last)} explanation="Shows where price sits relative to the upper/lower Bollinger Bands, indicating relative volatility extremes." />
            <IndicatorCard name="ATR (14)" value={formatCurrency(last.atr14, { compact: true })} explanation="Average True Range measures typical daily price movement — higher values mean higher volatility." sparklineData={history.slice(-30).map((c) => c.atr14 || 0)} />
            <IndicatorCard name="Volatility (20D)" value={`${last.volatility20?.toFixed(1)}%`} status={last.volatility20 > 65 ? 'Bearish' : last.volatility20 < 35 ? 'Bullish' : 'Neutral'} explanation="Annualised rolling volatility over the last 20 trading days." sparklineData={history.slice(-30).map((c) => c.volatility20 || 0)} />
            <IndicatorCard name="Volume Momentum" value={volumeMomentum(history)} status={volumeMomentumStatus(history)} explanation="Compares recent trading volume against its 20-day average to gauge participation strength." />
          </div>
        )}
      </div>

      {/* Recent predictions table */}
      <div className="mt-6 card p-5">
        <h2 className="mb-4 text-base font-semibold text-white">Recent Predictions</h2>
        <DataTable columns={columns} rows={predictionsTable} loading={loading} pageSize={8} />
      </div>

      <div className="mt-6">
        <Disclaimer />
      </div>
    </div>
  )
}

function bollingerPosition(candle) {
  if (!candle.bbUpper || !candle.bbLower) return '—'
  const pct = ((candle.close - candle.bbLower) / (candle.bbUpper - candle.bbLower)) * 100
  return `${pct.toFixed(0)}%`
}
function bollingerStatus(candle) {
  if (!candle.bbUpper || !candle.bbLower) return 'Neutral'
  const pct = (candle.close - candle.bbLower) / (candle.bbUpper - candle.bbLower)
  if (pct > 0.85) return 'Overbought'
  if (pct < 0.15) return 'Oversold'
  return 'Neutral'
}
function volumeMomentum(history) {
  const recent = history.slice(-5)
  const avg20 = history.slice(-20).reduce((s, c) => s + c.volume, 0) / 20
  const avgRecent = recent.reduce((s, c) => s + c.volume, 0) / recent.length
  return `${(((avgRecent - avg20) / avg20) * 100).toFixed(1)}%`
}
function volumeMomentumStatus(history) {
  const recent = history.slice(-5)
  const avg20 = history.slice(-20).reduce((s, c) => s + c.volume, 0) / 20
  const avgRecent = recent.reduce((s, c) => s + c.volume, 0) / recent.length
  return avgRecent > avg20 ? 'Bullish' : 'Bearish'
}

function SentimentBar() {
  // Deterministic mock sentiment split — replace with a real sentiment API later.
  const positive = 54
  const neutral = 31
  const negative = 15
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        <div className="bg-bullish" style={{ width: `${positive}%` }} />
        <div className="bg-sideways" style={{ width: `${neutral}%` }} />
        <div className="bg-bearish" style={{ width: `${negative}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1"><Smile className="h-3 w-3 text-bullish" /> {positive}%</span>
        <span className="flex items-center gap-1"><Meh className="h-3 w-3 text-sideways" /> {neutral}%</span>
        <span className="flex items-center gap-1"><Frown className="h-3 w-3 text-bearish" /> {negative}%</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">Sentiment score: 0.62 — moderately positive social and news sentiment.</p>
    </div>
  )
}
