import { useEffect, useState } from 'react'
import { getMarketOverview, getHistoricalData } from '../services/api'

/** Fetches (mock) market summaries for all coins. */
export function useMarketOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    getMarketOverview()
      .then((res) => { if (active) setData(res) })
      .catch((err) => { if (active) setError(err) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return { data, loading, error }
}

/** Fetches (mock) historical OHLCV data for a coin + range in days. */
export function useHistoricalData(coinId, rangeDays) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    getHistoricalData(coinId, rangeDays)
      .then((res) => { if (active) setData(res) })
      .catch((err) => { if (active) setError(err) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [coinId, rangeDays])

  return { data, loading, error }
}
