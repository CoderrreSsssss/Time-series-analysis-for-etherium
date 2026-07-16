import { useMemo } from 'react'
import { Info } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import CoinSelector from '../components/common/CoinSelector'
import ChartCard from '../components/charts/ChartCard'
import CandlestickChart from '../components/charts/CandlestickChart'
import PriceChart from '../components/charts/PriceChart'
import ExplainerBox from '../components/common/ExplainerBox'
import IndicatorCard from '../components/dashboard/IndicatorCard'
import { ChartSkeleton } from '../components/common/LoadingSkeleton'
import { useCoin } from '../hooks/useCoin'
import { useHistoricalData } from '../hooks/useMarketData'
import { formatCurrency } from '../utils/formatters'

export default function TechnicalAnalysisPage() {
  const { coin, coinId, setCoinId } = useCoin()
  const { data: history, loading } = useHistoricalData(coinId, 180)

  const supportResistance = useMemo(() => {
    if (!history) return { support: 0, resistance: 0 }
    const closes = history.slice(-60).map((c) => c.close)
    return { support: Math.min(...closes), resistance: Math.max(...closes) }
  }, [history])

  const technicalScore = useMemo(() => {
    if (!history) return 50
    const last = history[history.length - 1]
    let score = 50
    if (last.rsi14 > 50) score += 10
    if (last.macd > last.macdSignal) score += 15
    if (last.sma20 > last.sma50) score += 15
    if (last.close > last.bbMiddle) score += 10
    return Math.min(100, Math.max(0, score))
  }, [history])

  const signal = technicalScore >= 65 ? 'Buy' : technicalScore <= 35 ? 'Sell' : 'Hold'
  const signalColor = signal === 'Buy' ? 'text-bullish' : signal === 'Sell' ? 'text-bearish' : 'text-sideways'

  if (loading || !history) {
    return (
      <div>
        <PageHeader title="Technical Analysis" description="Loading indicator data…" />
        <ChartSkeleton height={420} />
      </div>
    )
  }

  const last = history[history.length - 1]
  const bbChart = history.map((c) => ({ date: c.date, close: c.close, upper: c.bbUpper, lower: c.bbLower }))
  const rsiChart = history.map((c) => ({ date: c.date, close: c.rsi14 }))
  const macdChart = history.map((c) => ({ date: c.date, close: c.macd }))
  const atrChart = history.map((c) => ({ date: c.date, close: c.atr14 }))

  return (
    <div>
      <PageHeader
        title="Technical Analysis"
        description={`Indicator-driven technical view for ${coin.name} (${coin.symbol})`}
        actions={<CoinSelector value={coinId} onChange={setCoinId} />}
      />

      <ChartCard title={`${coin.symbol} Candlestick Chart`} description="OHLC candles with trading volume" height={380}>
        <CandlestickChart data={history.slice(-90)} showVolume height={340} />
      </ChartCard>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="RSI (14)" description="Relative Strength Index — momentum oscillator, 0-100">
          <PriceChart data={rsiChart} mode="line" color="#38bdf8" unit="number" />
        </ChartCard>
        <ChartCard title="MACD" description="Moving Average Convergence Divergence">
          <PriceChart data={macdChart} mode="line" color="#c084fc" unit="number" />
        </ChartCard>
      </div>
      <ExplainerBox>
        RSI above 70 suggests the asset may be overbought; below 30 suggests it may be oversold. MACD crossing
        above its signal line is often read as bullish momentum, and crossing below as bearish momentum.
      </ExplainerBox>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Bollinger Bands" description="Price channel based on rolling volatility">
          <PriceChart data={bbChart} mode="line" showMovingAverages={false} color={coin.color} />
        </ChartCard>
        <ChartCard title="Average True Range (ATR)" description="Typical daily price range — a volatility gauge">
          <PriceChart data={atrChart} mode="area" color="#f59e0b" />
        </ChartCard>
      </div>
      <ExplainerBox>
        Bollinger Bands widen during volatile periods and narrow during calm periods; price touching the outer
        bands can signal a potential reversal or continuation. ATR simply reports how many dollars the price
        typically moves per day, independent of direction.
      </ExplainerBox>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <IndicatorCard name="Moving Averages" value={last.sma20 > last.sma50 ? 'Golden Cross' : 'Death Cross'} status={last.sma20 > last.sma50 ? 'Bullish' : 'Bearish'} explanation="A Golden Cross (SMA20 above SMA50) is bullish; a Death Cross (SMA20 below SMA50) is bearish." />
        <IndicatorCard name="Support Level" value={formatCurrency(supportResistance.support, { compact: true })} explanation="The lowest recent price level where buying pressure has historically emerged." />
        <IndicatorCard name="Resistance Level" value={formatCurrency(supportResistance.resistance, { compact: true })} explanation="The highest recent price level where selling pressure has historically emerged." />
        <IndicatorCard name="Momentum Summary" value={last.macd > last.macdSignal ? 'Positive' : 'Negative'} status={last.macd > last.macdSignal ? 'Positive' : 'Negative'} explanation="Combines RSI and MACD direction into a single momentum read." />
      </div>

      <div className="mt-6 card p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <p className="label-caps">Technical Score</p>
            <p className="mt-1 text-3xl font-bold text-white">{technicalScore}/100</p>
          </div>
          <div className="text-center">
            <p className="label-caps">Analytical Signal</p>
            <p className={`mt-1 text-3xl font-bold ${signalColor}`}>{signal}</p>
          </div>
          <div className="w-full max-w-xs">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-bearish via-sideways to-bullish" style={{ width: `${technicalScore}%` }} />
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-sideways/20 bg-sideways-soft/30 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sideways" />
          <p className="text-xs text-slate-400">
            This is an <strong className="text-slate-200">educational analytical signal</strong> derived from mock
            technical indicators — it is not financial advice and should not be used to make real trading decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
