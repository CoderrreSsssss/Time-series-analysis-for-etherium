import { useEffect, useState } from 'react'
import { getPrediction } from '../services/api'

/** Fetches the (mock) AI prediction for a given coin. */
export function usePrediction(coinId, horizon = '7d') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    getPrediction(coinId, horizon)
      .then((res) => { if (active) setData(res) })
      .catch((err) => { if (active) setError(err) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [coinId, horizon])

  return { data, loading, error }
}
