import axios from 'axios'
import { projectConfig } from '../config/projectConfig'
import { getAllCoinSummaries, getCoinById } from '../data/coinData'
import { getFullHistory } from '../data/mockDataGenerator'
import { generateMockPrediction } from '../utils/predictionMock'
import { getAllNetworkMetrics, getAllUsdtChains } from '../data/networkData'
import { regressionMetrics, classificationMetrics, featureImportance, getTrainingHistory } from '../data/modelData'
import {
  maxDrawdown,
  sharpeRatio,
  sortinoRatio,
  valueAtRisk,
  rollingVolatility,
} from '../utils/indicators'

/**
 * ============================================================================
 * API SERVICE LAYER
 * ============================================================================
 * Every UI component in this project calls the functions below instead of
 * reaching into mock data directly. That means switching from mock data to
 * a real FastAPI machine-learning backend later only requires editing THIS
 * FILE — no page or component code needs to change.
 *
 * How to go live later:
 *   1. Set VITE_USE_MOCK_DATA=false in your .env file.
 *   2. Implement the backend endpoints (see README.md for the expected
 *      request/response shapes).
 *   3. Replace the body of each function below with an axios call to
 *      `${projectConfig.api.baseUrl}/...`, using `mapPredictionResponse`
 *      (bottom of this file) to normalise the response shape for the UI.
 * ============================================================================
 */

const httpClient = axios.create({
  baseURL: projectConfig.api.baseUrl,
  timeout: 10000,
})

const USE_MOCK = projectConfig.api.useMockData

// Small artificial delay so loading skeletons are visible during the demo.
const simulateLatency = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))

/** GET /market/overview — summary cards for all coins. */
export async function getMarketOverview() {
  if (USE_MOCK) {
    await simulateLatency()
    return getAllCoinSummaries()
  }
  const { data } = await httpClient.get('/market/overview')
  return data
}

/** GET /market/history?coin=ETH&range=1Y */
export async function getHistoricalData(coinId, rangeDays = 365) {
  if (USE_MOCK) {
    await simulateLatency()
    const coin = getCoinById(coinId)
    const full = getFullHistory(coin)
    return full.slice(Math.max(0, full.length - rangeDays))
  }
  const { data } = await httpClient.get('/market/history', { params: { coin: coinId, days: rangeDays } })
  return data
}

/** GET /predict?coin=ETH&horizon=7d */
export async function getPrediction(coinId, horizon = '7d') {
  if (USE_MOCK) {
    await simulateLatency(500)
    const coin = getCoinById(coinId)
    return generateMockPrediction(coin)
  }
  const { data } = await httpClient.get('/predict', { params: { coin: coinId, horizon } })
  return mapPredictionResponse(data)
}

/** GET /indicators?coin=ETH — returns the enriched OHLCV+indicator series. */
export async function getTechnicalIndicators(coinId) {
  if (USE_MOCK) {
    await simulateLatency()
    const coin = getCoinById(coinId)
    return getFullHistory(coin)
  }
  const { data } = await httpClient.get('/indicators', { params: { coin: coinId } })
  return data
}

/** GET /models/metrics — comparison table for all trained models. */
export async function getModelMetrics() {
  if (USE_MOCK) {
    await simulateLatency()
    return {
      regression: regressionMetrics,
      classification: classificationMetrics,
      featureImportance,
      trainingHistory: getTrainingHistory(),
    }
  }
  const { data } = await httpClient.get('/models/metrics')
  return data
}

/** GET /chains/metrics — blockchain network + cross-chain USDT metrics. */
export async function getChainMetrics() {
  if (USE_MOCK) {
    await simulateLatency()
    return {
      networks: getAllNetworkMetrics(),
      usdt: getAllUsdtChains(),
    }
  }
  const { data } = await httpClient.get('/chains/metrics')
  return data
}

/** GET /risk?coin=ETH — volatility, drawdown, VaR, Sharpe/Sortino. */
export async function getRiskMetrics(coinId) {
  if (USE_MOCK) {
    await simulateLatency()
    const coin = getCoinById(coinId)
    const history = getFullHistory(coin).slice(-365)
    const closes = history.map((c) => c.close)
    const returns = history.map((c) => c.dailyReturn)
    const { maxDrawdown: mdd, series } = maxDrawdown(closes)
    const volSeries = rollingVolatility(returns, 20)
    const currentVol = volSeries.filter(Boolean).pop() || 0

    let riskLevel = 'Moderate'
    if (currentVol > 65) riskLevel = 'High'
    else if (currentVol < 35) riskLevel = 'Low'

    return {
      coin: coinId,
      volatility: currentVol,
      maxDrawdown: mdd,
      drawdownSeries: history.map((c, i) => ({ date: c.date, drawdown: series[i] })),
      sharpeRatio: sharpeRatio(returns),
      sortinoRatio: sortinoRatio(returns),
      valueAtRisk95: valueAtRisk(returns, 0.95),
      riskLevel,
      liquidityScore: coin.id === 'BTC' || coin.id === 'ETH' ? 92 : coin.id === 'BNB' ? 84 : 78,
      returnDistribution: returns,
      volatilityHistory: history.map((c, i) => ({ date: c.date, volatility: volSeries[i] })),
    }
  }
  const { data } = await httpClient.get('/risk', { params: { coin: coinId } })
  return data
}

/**
 * Normalises a real future API prediction response (see README.md schema)
 * into the shape used throughout the UI. Mock data already matches this
 * shape, so this function only matters once the real backend is connected.
 */
export function mapPredictionResponse(apiResponse) {
  return {
    coin: apiResponse.coin,
    currentPrice: apiResponse.current_price,
    nextDayPrice: apiResponse.next_day_price,
    expectedReturn: apiResponse.expected_return,
    trend: apiResponse.trend,
    confidence: apiResponse.confidence,
    probabilities: apiResponse.probabilities || { bullish: 0.34, sideways: 0.33, bearish: 0.33 },
    forecast: (apiResponse.forecast || []).map((f) => ({
      date: f.date,
      price: f.price,
      lower: f.lower,
      upper: f.upper,
      changePct: apiResponse.current_price ? ((f.price - apiResponse.current_price) / apiResponse.current_price) * 100 : 0,
    })),
    priceInterval: {
      lower: apiResponse.forecast?.[0]?.lower,
      upper: apiResponse.forecast?.[0]?.upper,
    },
    metrics: apiResponse.metrics,
    horizon: '7-Day',
    modelVersion: projectConfig.modelMeta.version,
    explanation: apiResponse.explanation || '',
  }
}

export default {
  getMarketOverview,
  getHistoricalData,
  getPrediction,
  getTechnicalIndicators,
  getModelMetrics,
  getChainMetrics,
  getRiskMetrics,
  mapPredictionResponse,
}
