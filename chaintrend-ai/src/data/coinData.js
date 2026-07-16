import { projectConfig } from '../config/projectConfig'
import { getMarketSnapshot } from './mockDataGenerator'

export const coins = projectConfig.coins

export function getCoinById(id) {
  return coins.find((c) => c.id === id) || coins[0]
}

/** Combines static coin config with the generated market snapshot. */
export function getCoinSummary(id) {
  const coin = getCoinById(id)
  const snapshot = getMarketSnapshot(coin)
  return { ...coin, ...snapshot }
}

export function getAllCoinSummaries() {
  return coins.map((c) => getCoinSummary(c.id))
}
