import { addDays, formatISO, subDays } from 'date-fns'
import {
  simpleMovingAverage,
  exponentialMovingAverage,
  relativeStrengthIndex,
  macd,
  bollingerBands,
  averageTrueRange,
  dailyReturns,
  rollingVolatility,
} from '../utils/indicators'

/**
 * ============================================================================
 * MOCK DATA GENERATOR
 * ============================================================================
 * Deterministic (seeded) pseudo-random OHLCV price generation.
 * This produces realistic-looking historical candles for each coin without
 * needing hundreds of hard-coded data points, and without a real API.
 *
 * IMPORTANT: This is FRONTEND MOCK DATA ONLY.
 * Replace the calls in `src/services/api.js` with real Axios requests once
 * the trained ML model backend is available. UI components should never
 * need to change because of that swap.
 * ============================================================================
 */

// --- Seeded PRNG (mulberry32) so charts look the same across reloads ------
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) || 1
}

const CANDLE_COUNT = 1460 // ~4 years of daily candles, covers the "All" range

/** Generates a deterministic OHLCV history for one coin. */
function generateOHLCV(coin) {
  const rng = mulberry32(seedFromString(coin.id))
  const candles = []
  let price = coin.basePrice * 0.35 // start lower so the series trends up over 4 years
  const today = new Date()
  const start = subDays(today, CANDLE_COUNT - 1)

  // A few slow-moving "regime" cycles so the chart has believable trends
  // instead of pure noise (bull run, correction, accumulation, etc).
  for (let i = 0; i < CANDLE_COUNT; i++) {
    const date = addDays(start, i)
    const cyclePhase = Math.sin(i / 140) * 0.55 + Math.sin(i / 47) * 0.25
    const drift = cyclePhase * coin.volatility * 0.6
    const noise = (rng() - 0.5) * coin.volatility
    const changePct = drift + noise

    const open = price
    const close = Math.max(open * (1 + changePct), open * 0.5)
    const high = Math.max(open, close) * (1 + rng() * coin.volatility * 0.4)
    const low = Math.min(open, close) * (1 - rng() * coin.volatility * 0.4)
    const volumeBase = coin.basePrice * 1_800_000
    const volume = volumeBase * (0.5 + rng()) * (1 + Math.abs(changePct) * 3)

    candles.push({
      date: formatISO(date, { representation: 'date' }),
      open: round(open, coin),
      high: round(high, coin),
      low: round(low, coin),
      close: round(close, coin),
      volume: Math.round(volume),
    })
    price = close
  }

  // Gently pull the final price toward the configured "current" base price
  // so summary cards look coherent with the rest of the mock ecosystem.
  const last = candles[candles.length - 1]
  const scale = coin.basePrice / last.close
  return candles.map((c) => ({
    ...c,
    open: round(c.open * scale, coin),
    high: round(c.high * scale, coin),
    low: round(c.low * scale, coin),
    close: round(c.close * scale, coin),
  }))
}

function round(value, coin) {
  const decimals = coin.basePrice < 1 ? 6 : coin.basePrice < 100 ? 4 : 2
  return Number(value.toFixed(decimals))
}

// Cache so we only generate each coin's series once per session.
const historyCache = new Map()

/** Returns the full ~4-year OHLCV history for a coin, with indicators attached. */
export function getFullHistory(coin) {
  if (historyCache.has(coin.id)) return historyCache.get(coin.id)

  const candles = generateOHLCV(coin)
  const closes = candles.map((c) => c.close)

  const sma20 = simpleMovingAverage(closes, 20)
  const sma50 = simpleMovingAverage(closes, 50)
  const ema12 = exponentialMovingAverage(closes, 12)
  const ema26 = exponentialMovingAverage(closes, 26)
  const rsi14 = relativeStrengthIndex(closes, 14)
  const { macdLine, signalLine, histogram } = macd(closes)
  const { upper, middle, lower } = bollingerBands(closes, 20)
  const atr14 = averageTrueRange(candles, 14)
  const returns = dailyReturns(closes)
  const vol20 = rollingVolatility(returns, 20)

  const enriched = candles.map((c, i) => ({
    ...c,
    sma20: sma20[i],
    sma50: sma50[i],
    ema12: ema12[i],
    ema26: ema26[i],
    rsi14: rsi14[i],
    macd: macdLine[i],
    macdSignal: signalLine[i],
    macdHistogram: histogram[i],
    bbUpper: upper[i],
    bbMiddle: middle[i],
    bbLower: lower[i],
    atr14: atr14[i],
    dailyReturn: returns[i],
    volatility20: vol20[i],
  }))

  historyCache.set(coin.id, enriched)
  return enriched
}

/** Slice the last N days from a coin's history. */
export function getRecentHistory(coin, days) {
  const full = getFullHistory(coin)
  return full.slice(Math.max(0, full.length - days))
}

/** Returns { current, change24h, changePct24h, marketCap, volume24h } */
export function getMarketSnapshot(coin) {
  const history = getFullHistory(coin)
  const last = history[history.length - 1]
  const prev = history[history.length - 2]
  const changePct = ((last.close - prev.close) / prev.close) * 100
  const circulatingSupply = coin.id === 'BTC' ? 19_700_000 : coin.id === 'ETH' ? 120_400_000 : coin.id === 'BNB' ? 147_000_000 : 86_500_000_000
  return {
    price: last.close,
    change24h: last.close - prev.close,
    changePct24h: changePct,
    marketCap: last.close * circulatingSupply,
    volume24h: last.volume,
    high24h: last.high,
    low24h: last.low,
  }
}

export default {
  getFullHistory,
  getRecentHistory,
  getMarketSnapshot,
}
