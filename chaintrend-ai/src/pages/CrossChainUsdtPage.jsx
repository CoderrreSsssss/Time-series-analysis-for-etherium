import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import ChartCard from '../components/charts/ChartCard'
import PieChartCard from '../components/charts/PieChartCard'
import ComparisonBarChart from '../components/charts/ComparisonBarChart'
import Dropdown from '../components/common/Dropdown'
import { ChartSkeleton } from '../components/common/LoadingSkeleton'
import { getChainMetrics } from '../services/api'
import { recommendUsdtNetwork } from '../data/networkData'
import { formatCurrency, formatCompactNumber } from '../utils/formatters'

const PRIORITIES = [
  { value: 'lowest_cost', label: 'Lowest Cost' },
  { value: 'speed', label: 'Speed' },
  { value: 'network_activity', label: 'Network Activity' },
]

export default function CrossChainUsdtPage() {
  const [data, setData] = useState(null)
  const [amount, setAmount] = useState(500)
  const [priority, setPriority] = useState('lowest_cost')
  const [destination, setDestination] = useState('exchange')

  useEffect(() => {
    getChainMetrics().then(setData)
  }, [])

  const recommendation = useMemo(() => recommendUsdtNetwork({ amount, priority }), [amount, priority])

  if (!data) {
    return (
      <div>
        <PageHeader title="Cross-Chain USDT Analysis" description="Loading cross-chain data…" />
        <ChartSkeleton height={420} />
      </div>
    )
  }

  const { usdt } = data
  const pieData = usdt.map((u) => ({ name: u.label, value: u.preferenceShare, color: u.color }))
  const volumeBars = usdt.map((u) => ({ name: u.label, volume: u.volume24hUsd }))
  const feeBars = usdt.map((u) => ({ name: u.label, fee: u.avgFeeUsd }))
  const countBars = usdt.map((u) => ({ name: u.label, count: u.transferCount24h }))

  return (
    <div>
      <PageHeader title="Cross-Chain USDT Analysis" description="Comparing USDT across ERC-20, TRC-20, and BEP-20" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {usdt.map((u) => (
          <div key={u.id} className="card p-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: u.color }} />
              <p className="text-sm font-semibold text-white">{u.label}</p>
            </div>
            <p className="mt-3 text-xs text-slate-500">24H Volume</p>
            <p className="text-lg font-bold text-white">{formatCurrency(u.volume24hUsd, { compact: true })}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-slate-500">Avg Fee</p><p className="font-semibold text-slate-200">{formatCurrency(u.avgFeeUsd)}</p></div>
              <div><p className="text-slate-500">Confirm Speed</p><p className="font-semibold text-slate-200">{u.confirmationSeconds}s</p></div>
              <div><p className="text-slate-500">Active Wallets</p><p className="font-semibold text-slate-200">{formatCompactNumber(u.activeWallets)}</p></div>
              <div><p className="text-slate-500">Whale Tx</p><p className="font-semibold text-slate-200">{u.whaleTransactionCount}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Network Usage Share" description="Preference share across all USDT cross-chain transfers">
          <PieChartCard data={pieData} />
        </ChartCard>
        <ChartCard title="24H Transfer Volume" description="Total USD transfer volume by network">
          <ComparisonBarChart data={volumeBars} bars={[{ key: 'volume', name: 'Volume (USD)', color: '#818cf8' }]} />
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Fee Comparison" description="Average transfer fee (USD)">
          <ComparisonBarChart data={feeBars} bars={[{ key: 'fee', name: 'Avg Fee (USD)', color: '#f59e0b' }]} />
        </ChartCard>
        <ChartCard title="Transaction Count" description="24-hour transfer count by network">
          <ComparisonBarChart data={countBars} bars={[{ key: 'count', name: 'Transfer Count', color: '#22c55e' }]} />
        </ChartCard>
      </div>

      <div className="mt-6 card p-6">
        <h2 className="mb-4 text-base font-semibold text-white">Get a Network Recommendation</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="usdt-amount" className="label-caps mb-1.5 block">Transfer Amount (USD)</label>
            <input
              id="usdt-amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="input"
            />
          </div>
          <div>
            <p className="label-caps mb-1.5">Priority</p>
            <Dropdown value={priority} onChange={setPriority} options={PRIORITIES} className="w-full" />
          </div>
          <div>
            <p className="label-caps mb-1.5">Token</p>
            <Dropdown value="USDT" onChange={() => {}} options={[{ value: 'USDT', label: 'USDT' }]} className="w-full" />
          </div>
          <div>
            <p className="label-caps mb-1.5">Destination Preference</p>
            <Dropdown
              value={destination}
              onChange={setDestination}
              options={[{ value: 'exchange', label: 'Centralised Exchange' }, { value: 'wallet', label: 'Self-Custody Wallet' }, { value: 'defi', label: 'DeFi Protocol' }]}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand-500/30 bg-brand-500/10 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
          <div>
            <p className="text-sm font-semibold text-white">
              Recommended network: <span style={{ color: recommendation.color }}>{recommendation.label}</span>
            </p>
            <p className="mt-1 text-sm text-slate-400">
              For a {formatCurrency(amount)} transfer optimised for {PRIORITIES.find((p) => p.value === priority)?.label.toLowerCase()},
              {' '}{recommendation.network} offers an average fee of {formatCurrency(recommendation.avgFeeUsd)} and a typical
              confirmation time of {recommendation.confirmationSeconds} seconds.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              This is a simple mock recommendation utility (see <code className="text-brand-300">recommendUsdtNetwork()</code> in
              <code className="text-brand-300"> src/data/networkData.js</code>) — replace it with a live API call later without changing this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
