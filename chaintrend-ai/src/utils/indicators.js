/**
 * Technical indicator utilities.
 * These are plain, well-commented implementations so a student can read
 * and modify them easily. They operate on arrays of OHLCV candles:
 * { date, open, high, low, close, volume }
 */

export function simpleMovingAverage(values, period) {
  const result = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(null)
      continue
    }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += values[j]
    result.push(sum / period)
  }
  return result
}

export function exponentialMovingAverage(values, period) {
  const result = []
  const k = 2 / (period + 1)
  let emaPrev = null
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(null)
      continue
    }
    if (emaPrev === null) {
      const seed = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
      emaPrev = seed
    } else {
      emaPrev = values[i] * k + emaPrev * (1 - k)
    }
    result.push(emaPrev)
  }
  return result
}

/** Relative Strength Index (Wilder's smoothing), 0-100 scale. */
export function relativeStrengthIndex(values, period = 14) {
  const result = new Array(values.length).fill(null)
  if (values.length < period + 1) return result

  let gainSum = 0
  let lossSum = 0
  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1]
    if (change >= 0) gainSum += change
    else lossSum -= change
  }
  let avgGain = gainSum / period
  let avgLoss = lossSum / period
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)

  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? -change : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }
  return result
}

/** MACD: returns { macdLine, signalLine, histogram } arrays. */
export function macd(values, fast = 12, slow = 26, signal = 9) {
  const emaFast = exponentialMovingAverage(values, fast)
  const emaSlow = exponentialMovingAverage(values, slow)
  const macdLine = values.map((_, i) =>
    emaFast[i] !== null && emaSlow[i] !== null ? emaFast[i] - emaSlow[i] : null
  )
  const macdForSignal = macdLine.map((v) => (v === null ? 0 : v))
  const signalRaw = exponentialMovingAverage(macdForSignal, signal)
  const signalLine = macdLine.map((v, i) => (v === null ? null : signalRaw[i]))
  const histogram = macdLine.map((v, i) => (v === null || signalLine[i] === null ? null : v - signalLine[i]))
  return { macdLine, signalLine, histogram }
}

/** Bollinger Bands: returns { upper, middle, lower }. */
export function bollingerBands(values, period = 20, stdDevMultiplier = 2) {
  const middle = simpleMovingAverage(values, period)
  const upper = []
  const lower = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      upper.push(null)
      lower.push(null)
      continue
    }
    const slice = values.slice(i - period + 1, i + 1)
    const mean = middle[i]
    const variance = slice.reduce((sum, v) => sum + (v - mean) ** 2, 0) / period
    const stdDev = Math.sqrt(variance)
    upper.push(mean + stdDevMultiplier * stdDev)
    lower.push(mean - stdDevMultiplier * stdDev)
  }
  return { upper, middle, lower }
}

/** Average True Range — measures volatility from high/low/close. */
export function averageTrueRange(candles, period = 14) {
  const trueRanges = candles.map((c, i) => {
    if (i === 0) return c.high - c.low
    const prevClose = candles[i - 1].close
    return Math.max(c.high - c.low, Math.abs(c.high - prevClose), Math.abs(c.low - prevClose))
  })
  return exponentialMovingAverage(trueRanges, period)
}

/** Daily percentage returns from closing prices. */
export function dailyReturns(values) {
  return values.map((v, i) => (i === 0 ? 0 : ((v - values[i - 1]) / values[i - 1]) * 100))
}

/** Rolling standard deviation of returns (annualised volatility %). */
export function rollingVolatility(returns, period = 20) {
  const result = []
  for (let i = 0; i < returns.length; i++) {
    if (i < period - 1) {
      result.push(null)
      continue
    }
    const slice = returns.slice(i - period + 1, i + 1)
    const mean = slice.reduce((a, b) => a + b, 0) / period
    const variance = slice.reduce((sum, v) => sum + (v - mean) ** 2, 0) / period
    result.push(Math.sqrt(variance) * Math.sqrt(365))
  }
  return result
}

/** Maximum drawdown (%) across a price series, plus a series of running drawdowns. */
export function maxDrawdown(values) {
  let peak = values[0]
  let maxDD = 0
  const series = values.map((v) => {
    peak = Math.max(peak, v)
    const dd = ((v - peak) / peak) * 100
    maxDD = Math.min(maxDD, dd)
    return dd
  })
  return { maxDrawdown: maxDD, series }
}

/** Sharpe ratio approximation using daily returns (risk-free rate assumed 0). */
export function sharpeRatio(returns) {
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((sum, v) => sum + (v - mean) ** 2, 0) / returns.length
  const stdDev = Math.sqrt(variance)
  if (stdDev === 0) return 0
  return (mean / stdDev) * Math.sqrt(365)
}

/** Sortino ratio — like Sharpe but only penalises downside volatility. */
export function sortinoRatio(returns) {
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const downside = returns.filter((v) => v < 0)
  const downsideVariance = downside.reduce((sum, v) => sum + v ** 2, 0) / (downside.length || 1)
  const downsideDev = Math.sqrt(downsideVariance)
  if (downsideDev === 0) return 0
  return (mean / downsideDev) * Math.sqrt(365)
}

/** Historical Value-at-Risk at a given confidence level (default 95%). */
export function valueAtRisk(returns, confidence = 0.95) {
  const sorted = [...returns].sort((a, b) => a - b)
  const index = Math.floor((1 - confidence) * sorted.length)
  return sorted[Math.max(0, index)]
}
