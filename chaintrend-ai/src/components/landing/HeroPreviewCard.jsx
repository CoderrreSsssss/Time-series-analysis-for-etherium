import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import { getAllCoinSummaries } from '../../data/coinData'
import { formatCurrency, formatPercent, changeColor } from '../../utils/formatters'
import { getRecentHistory } from '../../data/mockDataGenerator'
import { getCoinById } from '../../data/coinData'
import ModelStatusBadge from '../common/ModelStatusBadge'

/** Animated market-preview card shown in the landing hero. */
export default function HeroPreviewCard() {
  const summaries = getAllCoinSummaries()
  const ethHistory = getRecentHistory(getCoinById('ETH'), 60).map((c) => ({ date: c.date, close: c.close }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="card glass relative w-full max-w-md p-5"
    >
      <div className="flex items-center justify-between">
        <p className="label-caps">Live Market Preview</p>
        <ModelStatusBadge />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {summaries.map((coin) => (
          <div key={coin.id} className="rounded-xl border border-border bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: coin.color }} />
              <span className="text-xs font-semibold text-slate-300">{coin.symbol}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-white">{formatCurrency(coin.price, { compact: coin.price > 1000 })}</p>
            <p className={`text-[11px] font-medium ${changeColor(coin.changePct24h)}`}>{formatPercent(coin.changePct24h)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-white/[0.02] p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <TrendingUp className="h-3.5 w-3.5 text-bullish" /> ETH · 60-Day Trend
          </p>
        </div>
        <div style={{ height: 70 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ethHistory}>
              <defs>
                <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="close" stroke="#818cf8" strokeWidth={2} fill="url(#heroFill)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
