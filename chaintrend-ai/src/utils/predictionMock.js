import { addDays, formatISO } from 'date-fns'
import { getFullHistory } from '../data/mockDataGenerator'

/**
 * ============================================================================
 * Mock prediction logic – replace with trained model API later.
 * ============================================================================
 * This function derives a "prediction" from recent momentum and technical
 * values already present in the mock history (RSI, MACD, moving averages)
 * instead of pure randomness, so the numbers move in a believable way.
 *
 * When the FastAPI model backend is ready, delete the body of this function
 * and call `services/api.js -> getPrediction(coin, horizon)` instead. The
 * shape returned here matches the documented future API response so no
 * component code needs to change.
 * ============================================================================
 */
export function generateMockPrediction(coin) {
  const history = getFullHistory(coin)
  const last = history[history.length - 1]
  const recent = history.slice(-30)

  const smaSpread = (last.sma20 - last.sma50) / last.sma50
  const macdSignalGap = last.macd - last.macdSignal
  const rsiSignal = (last.rsi14 - 50) / 50
  const momentum = recent.reduce((sum, c) => sum + c.dailyReturn, 0) / recent.length

  // Composite momentum score drives both direction and magnitude.
  const score = smaSpread * 0.4 + macdSignalGap / last.close * 8 + rsiSignal * 0.25 + momentum * 0.05

  let trend = 'Sideways'
  if (score > 0.015) trend = 'Bullish'
  else if (score < -0.015) trend = 'Bearish'

  const confidence = Math.min(0.95, Math.max(0.5, 0.6 + Math.abs(score) * 6))
  const expectedReturn = score * 100 // percent

  const nextDayPrice = last.close * (1 + expectedReturn / 100 / 3)
  const sevenDayReturn = expectedReturn * 1.8

  const forecast = []
  let cursor = last.close
  for (let i = 1; i <= 7; i++) {
    const dailyDrift = (expectedReturn / 100 / 7) * (1 + Math.sin(i) * 0.15)
    cursor = cursor * (1 + dailyDrift)
    const uncertainty = 0.006 * i
    forecast.push({
      date: formatISO(addDays(new Date(last.date), i), { representation: 'date' }),
      price: Number(cursor.toFixed(coin.basePrice < 1 ? 6 : 2)),
      lower: Number((cursor * (1 - uncertainty)).toFixed(coin.basePrice < 1 ? 6 : 2)),
      upper: Number((cursor * (1 + uncertainty)).toFixed(coin.basePrice < 1 ? 6 : 2)),
      changePct: Number((((cursor - last.close) / last.close) * 100).toFixed(2)),
    })
  }

  const explanationParts = []
  explanationParts.push(
    smaSpread > 0 ? 'the 20-day average is trading above the 50-day average' : 'the 20-day average is trading below the 50-day average'
  )
  explanationParts.push(last.rsi14 > 60 ? 'RSI is approaching overbought territory' : last.rsi14 < 40 ? 'RSI is approaching oversold territory' : 'RSI is neutral')
  explanationParts.push(macdSignalGap > 0 ? 'MACD momentum is positive' : 'MACD momentum is negative')
  const explanation = `Momentum indicators show that ${explanationParts.join(', ')}, and volume has been ${
    momentum > 0 ? 'supportive of upward movement' : 'relatively muted'
  }. The model predicts a ${trend.toLowerCase()} bias over the next 7 days.`

  return {
    coin: coin.id,
    currentPrice: last.close,
    nextDayPrice: Number(nextDayPrice.toFixed(coin.basePrice < 1 ? 6 : 2)),
    expectedReturn: Number(expectedReturn.toFixed(2)),
    sevenDayReturn: Number(sevenDayReturn.toFixed(2)),
    trend,
    confidence: Number(confidence.toFixed(2)),
    horizon: '7-Day',
    modelVersion: 'v0.9.1-mock',
    explanation,
    forecast,
    priceInterval: {
      lower: Number((nextDayPrice * 0.985).toFixed(coin.basePrice < 1 ? 6 : 2)),
      upper: Number((nextDayPrice * 1.015).toFixed(coin.basePrice < 1 ? 6 : 2)),
    },
    probabilities: buildTrendProbabilities(trend, confidence),
  }
}

function buildTrendProbabilities(trend, confidence) {
  const remaining = 1 - confidence
  if (trend === 'Bullish') {
    return { bullish: confidence, sideways: remaining * 0.6, bearish: remaining * 0.4 }
  }
  if (trend === 'Bearish') {
    return { bullish: remaining * 0.4, sideways: remaining * 0.6, bearish: confidence }
  }
  return { bullish: remaining * 0.5, sideways: confidence, bearish: remaining * 0.5 }
}

/** Trend history timeline for the last N days (mock, derived from momentum). */
export function getTrendTimeline(coin, days = 30) {
  const history = getFullHistory(coin).slice(-days)
  return history.map((c) => {
    const spread = c.sma20 && c.sma50 ? (c.sma20 - c.sma50) / c.sma50 : 0
    let trend = 'Sideways'
    if (spread > 0.01) trend = 'Bullish'
    else if (spread < -0.01) trend = 'Bearish'
    return { date: c.date, trend, close: c.close }
  })
}

/**
 * Builds a mock "recent predictions vs actuals" table by comparing each
 * day's close price against a simulated prior-day prediction derived from
 * that day's own momentum features (kept intentionally simple).
 */
export function getRecentPredictionsTable(coin, days = 20) {
  const history = getFullHistory(coin).slice(-(days + 1))
  const rows = []
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1]
    const curr = history[i]
    const spread = prev.sma20 && prev.sma50 ? (prev.sma20 - prev.sma50) / prev.sma50 : 0
    const rsiSignal = prev.rsi14 ? (prev.rsi14 - 50) / 50 : 0
    const predictedChangePct = spread * 40 + rsiSignal * 1.5
    const predictedPrice = prev.close * (1 + predictedChangePct / 100)
    const predictedTrend = predictedChangePct > 0.3 ? 'Bullish' : predictedChangePct < -0.3 ? 'Bearish' : 'Sideways'
    const actualChangePct = ((curr.close - prev.close) / prev.close) * 100
    const actualTrend = actualChangePct > 0.3 ? 'Bullish' : actualChangePct < -0.3 ? 'Bearish' : 'Sideways'
    const error = predictedPrice - curr.close
    const errorPct = (error / curr.close) * 100
    const confidence = Math.min(0.95, Math.max(0.5, 0.6 + Math.abs(predictedChangePct) / 10))

    rows.push({
      id: curr.date,
      date: curr.date,
      coin: coin.id,
      actualPrice: curr.close,
      predictedPrice: Number(predictedPrice.toFixed(coin.basePrice < 1 ? 6 : 2)),
      error: Number(error.toFixed(2)),
      errorPct: Number(errorPct.toFixed(2)),
      predictedTrend,
      actualTrend,
      confidence: Number(confidence.toFixed(2)),
      result: predictedTrend === actualTrend ? 'Correct' : 'Incorrect',
    })
  }
  return rows.reverse()
}
