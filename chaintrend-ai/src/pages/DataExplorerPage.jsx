import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Dropdown from '../components/common/Dropdown'
import DataTable from '../components/tables/DataTable'
import EmptyState from '../components/common/EmptyState'
import { coins, getCoinById } from '../data/coinData'
import { getFullHistory } from '../data/mockDataGenerator'
import { getRecentPredictionsTable } from '../utils/predictionMock'
import { exportToCsv } from '../utils/exportCsv'
import { formatCurrency, formatDate } from '../utils/formatters'
import TrendBadge from '../components/common/TrendBadge'

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50]

export default function DataExplorerPage() {
  const [coinId, setCoinId] = useState('ETH')
  const [search, setSearch] = useState('')
  const [rangeDays, setRangeDays] = useState(180)
  const [pageSize, setPageSize] = useState(10)

  const coin = getCoinById(coinId)
  const history = useMemo(() => getFullHistory(coin).slice(-rangeDays), [coin, rangeDays])
  const predictionMap = useMemo(() => {
    const map = new Map()
    getRecentPredictionsTable(coin, rangeDays).forEach((p) => map.set(p.date, p))
    return map
  }, [coin, rangeDays])

  const rows = useMemo(() => {
    return history
      .map((c) => {
        const pred = predictionMap.get(c.date)
        return {
          id: c.date,
          date: c.date,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume,
          dailyReturn: Number((c.dailyReturn || 0).toFixed(2)),
          rsi: c.rsi14 ? Number(c.rsi14.toFixed(1)) : null,
          macd: c.macd ? Number(c.macd.toFixed(2)) : null,
          volatility: c.volatility20 ? Number(c.volatility20.toFixed(1)) : null,
          predictedPrice: pred ? pred.predictedPrice : null,
          predictedTrend: pred ? pred.predictedTrend : null,
        }
      })
      .filter((r) => (search ? r.date.includes(search) : true))
      .reverse()
  }, [history, predictionMap, search])

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    { key: 'open', label: 'Open', sortable: true, render: (r) => formatCurrency(r.open) },
    { key: 'high', label: 'High', sortable: true, render: (r) => formatCurrency(r.high) },
    { key: 'low', label: 'Low', sortable: true, render: (r) => formatCurrency(r.low) },
    { key: 'close', label: 'Close', sortable: true, render: (r) => formatCurrency(r.close) },
    { key: 'volume', label: 'Volume', sortable: true, render: (r) => formatCurrency(r.volume, { compact: true }) },
    { key: 'dailyReturn', label: 'Daily Return', sortable: true, render: (r) => `${r.dailyReturn}%` },
    { key: 'rsi', label: 'RSI', sortable: true, render: (r) => r.rsi ?? '—' },
    { key: 'macd', label: 'MACD', sortable: true, render: (r) => r.macd ?? '—' },
    { key: 'volatility', label: 'Volatility', sortable: true, render: (r) => (r.volatility ? `${r.volatility}%` : '—') },
    { key: 'predictedPrice', label: 'Predicted Price', sortable: true, render: (r) => (r.predictedPrice ? formatCurrency(r.predictedPrice) : '—') },
    { key: 'predictedTrend', label: 'Predicted Trend', render: (r) => (r.predictedTrend ? <TrendBadge trend={r.predictedTrend} size="sm" /> : '—') },
  ]

  function handleExport() {
    exportToCsv(`${coin.symbol}_historical_data.csv`, rows)
  }

  return (
    <div>
      <PageHeader
        title="Data Explorer"
        description="Browse, search, filter, and export the underlying historical dataset"
        actions={
          <button type="button" onClick={handleExport} className="btn-primary">
            <Download className="h-4 w-4" /> Download CSV
          </button>
        }
      />

      <div className="card mb-5 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Dropdown label="Coin" value={coinId} onChange={setCoinId} options={coins.map((c) => ({ value: c.id, label: `${c.name} (${c.symbol})` }))} />
          <Dropdown
            label="Date Range"
            value={rangeDays}
            onChange={setRangeDays}
            options={[{ value: 30, label: 'Last 30 Days' }, { value: 90, label: 'Last 90 Days' }, { value: 180, label: 'Last 180 Days' }, { value: 365, label: 'Last 1 Year' }]}
          />
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD)…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
              aria-label="Search by date"
            />
          </div>
          <Dropdown label="Rows per page" value={pageSize} onChange={setPageSize} options={ROWS_PER_PAGE_OPTIONS.map((n) => ({ value: n, label: String(n) }))} />
        </div>
      </div>

      <div className="card p-5">
        {rows.length === 0 ? (
          <EmptyState title="No matching rows" message="Try a different search term or date range." />
        ) : (
          <DataTable columns={columns} rows={rows} pageSize={pageSize} />
        )}
      </div>
    </div>
  )
}
