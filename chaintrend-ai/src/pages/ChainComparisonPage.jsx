import { useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import ChartCard from '../components/charts/ChartCard'
import ComparisonBarChart from '../components/charts/ComparisonBarChart'
import DataTable from '../components/tables/DataTable'
import NetworkBadge from '../components/common/NetworkBadge'
import { ChartSkeleton } from '../components/common/LoadingSkeleton'
import { getChainMetrics } from '../services/api'
import { formatCurrency, formatCompactNumber } from '../utils/formatters'

export default function ChainComparisonPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getChainMetrics().then(setData)
  }, [])

  if (!data) {
    return (
      <div>
        <PageHeader title="Multi-Chain Comparison" description="Loading network metrics…" />
        <ChartSkeleton height={420} />
      </div>
    )
  }

  const { networks } = data
  const colors = { Ethereum: '#818cf8', 'BNB Smart Chain': '#f0b90b', TRON: '#ef4444' }

  const columns = [
    { key: 'name', label: 'Network', sortable: true, render: (r) => <NetworkBadge network={r.name} standard={r.tokenStandard} /> },
    { key: 'nativeCoin', label: 'Native Coin' },
    { key: 'dailyTransactions', label: 'Daily Transactions', sortable: true, render: (r) => formatCompactNumber(r.dailyTransactions) },
    { key: 'activeAddresses', label: 'Active Addresses', sortable: true, render: (r) => formatCompactNumber(r.activeAddresses) },
    { key: 'avgFeeUsd', label: 'Avg Fee', sortable: true, render: (r) => formatCurrency(r.avgFeeUsd) },
    { key: 'blockTimeSeconds', label: 'Block Time', sortable: true, render: (r) => `${r.blockTimeSeconds}s` },
    { key: 'stablecoinActivityUsd', label: 'Stablecoin Activity', sortable: true, render: (r) => formatCurrency(r.stablecoinActivityUsd, { compact: true }) },
    { key: 'networkUtilisation', label: 'Utilisation', sortable: true, render: (r) => `${r.networkUtilisation}%` },
    { key: 'defiActivityUsd', label: 'DeFi Activity', sortable: true, render: (r) => formatCurrency(r.defiActivityUsd, { compact: true }) },
    { key: 'overallScore', label: 'Overall Score', sortable: true, render: (r) => <span className="font-bold text-brand-300">{r.overallScore}</span> },
  ]

  const txBars = networks.map((n) => ({ name: n.name, transactions: n.dailyTransactions }))
  const feeBars = networks.map((n) => ({ name: n.name, fee: n.avgFeeUsd }))
  const addrBars = networks.map((n) => ({ name: n.name, addresses: n.activeAddresses }))
  const stableBars = networks.map((n) => ({ name: n.name, stablecoin: n.stablecoinActivityUsd }))
  const speedBars = networks.map((n) => ({ name: n.name, speed: n.blockTimeSeconds }))
  const utilBars = networks.map((n) => ({ name: n.name, utilisation: n.networkUtilisation }))

  return (
    <div>
      <PageHeader title="Multi-Chain Comparison" description="Ethereum vs BNB Smart Chain vs TRON — network-level activity metrics" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {networks.map((n) => (
          <div key={n.id} className="card p-5">
            <div className="flex items-center justify-between">
              <NetworkBadge network={n.name} standard={n.tokenStandard} />
              <span className="text-lg font-bold" style={{ color: colors[n.name] }}>{n.overallScore}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500">Native Coin</p>
            <p className="text-sm font-semibold text-slate-200">{n.nativeCoin}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-slate-500">Daily Tx</p><p className="font-semibold text-slate-200">{formatCompactNumber(n.dailyTransactions)}</p></div>
              <div><p className="text-slate-500">Avg Fee</p><p className="font-semibold text-slate-200">{formatCurrency(n.avgFeeUsd)}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 card p-5">
        <h2 className="mb-4 text-base font-semibold text-white">Network Comparison Table</h2>
        <DataTable columns={columns} rows={networks} pageSize={10} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Transaction Activity" description="Daily transaction count by network">
          <ComparisonBarChart data={txBars} bars={[{ key: 'transactions', name: 'Daily Transactions', color: '#818cf8' }]} />
        </ChartCard>
        <ChartCard title="Average Fees" description="Average transaction fee (USD)">
          <ComparisonBarChart data={feeBars} bars={[{ key: 'fee', name: 'Avg Fee (USD)', color: '#f59e0b' }]} />
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Active Addresses" description="Unique active addresses per day">
          <ComparisonBarChart data={addrBars} bars={[{ key: 'addresses', name: 'Active Addresses', color: '#38bdf8' }]} />
        </ChartCard>
        <ChartCard title="Stablecoin Transfer Activity" description="USD value of stablecoin transfers per day">
          <ComparisonBarChart data={stableBars} bars={[{ key: 'stablecoin', name: 'Stablecoin Volume (USD)', color: '#22c55e' }]} />
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Network Speed" description="Average block time (seconds) — lower is faster">
          <ComparisonBarChart data={speedBars} bars={[{ key: 'speed', name: 'Block Time (s)', color: '#f43f5e' }]} />
        </ChartCard>
        <ChartCard title="Network Utilisation" description="Percentage of network capacity currently in use">
          <ComparisonBarChart data={utilBars} bars={[{ key: 'utilisation', name: 'Utilisation %', color: '#c084fc' }]} />
        </ChartCard>
      </div>

      <div className="mt-6 card flex items-start gap-3 p-5">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
        <div>
          <p className="text-sm font-semibold text-white">Network Recommendation</p>
          <p className="mt-1.5 text-sm text-slate-400">
            TRON may be preferred for lower-cost, high-throughput stablecoin transfers, while Ethereum provides
            a broader and more mature smart-contract ecosystem. BNB Smart Chain offers a balance of low fees
            and strong DeFi + retail transaction activity.
          </p>
          <p className="mt-2 text-xs text-slate-500">This is general educational analysis, not financial advice.</p>
        </div>
      </div>
    </div>
  )
}
