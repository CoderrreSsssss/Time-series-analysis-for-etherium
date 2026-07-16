import { projectConfig } from '../config/projectConfig'

/**
 * Mock blockchain-network metrics used on the Multi-Chain Comparison page.
 * Values are illustrative and deterministic — replace with a live
 * block-explorer / analytics API integration in the future.
 */
export const networkMetrics = {
  ethereum: {
    network: 'Ethereum',
    nativeCoin: 'ETH',
    tokenStandard: 'ERC-20',
    dailyTransactions: 1_180_000,
    activeAddresses: 452_000,
    avgFeeUsd: 2.85,
    blockTimeSeconds: 12,
    stablecoinActivityUsd: 9_400_000_000,
    networkUtilisation: 78,
    defiActivityUsd: 54_000_000_000,
    overallScore: 88,
  },
  bsc: {
    network: 'BNB Smart Chain',
    nativeCoin: 'BNB',
    tokenStandard: 'BEP-20',
    dailyTransactions: 3_650_000,
    activeAddresses: 1_120_000,
    avgFeeUsd: 0.18,
    blockTimeSeconds: 3,
    stablecoinActivityUsd: 4_100_000_000,
    networkUtilisation: 63,
    defiActivityUsd: 6_200_000_000,
    overallScore: 79,
  },
  tron: {
    network: 'TRON',
    nativeCoin: 'TRX',
    tokenStandard: 'TRC-20',
    dailyTransactions: 6_900_000,
    activeAddresses: 2_450_000,
    avgFeeUsd: 0.02,
    blockTimeSeconds: 3,
    stablecoinActivityUsd: 18_700_000_000,
    networkUtilisation: 71,
    defiActivityUsd: 1_800_000_000,
    overallScore: 82,
  },
}

export function getAllNetworkMetrics() {
  return projectConfig.networks.map((n) => ({ ...n, ...networkMetrics[n.id] }))
}

/** Mock USDT cross-chain comparison (ERC-20 vs TRC-20 vs BEP-20). */
export const usdtCrossChain = {
  'USDT-ERC20': {
    label: 'USDT (ERC-20)',
    network: 'Ethereum',
    volume24hUsd: 12_800_000_000,
    transferCount24h: 410_000,
    avgFeeUsd: 3.1,
    avgTransferSizeUsd: 31_200,
    activeWallets: 285_000,
    confirmationSeconds: 180,
    whaleTransactionCount: 640,
    preferenceShare: 34,
    color: '#818cf8',
  },
  'USDT-TRC20': {
    label: 'USDT (TRC-20)',
    network: 'TRON',
    volume24hUsd: 24_500_000_000,
    transferCount24h: 2_150_000,
    avgFeeUsd: 0.01,
    avgTransferSizeUsd: 11_400,
    activeWallets: 940_000,
    confirmationSeconds: 3,
    whaleTransactionCount: 1180,
    preferenceShare: 51,
    color: '#ef4444',
  },
  'USDT-BEP20': {
    label: 'USDT (BEP-20)',
    network: 'BNB Smart Chain',
    volume24hUsd: 3_900_000_000,
    transferCount24h: 560_000,
    avgFeeUsd: 0.15,
    avgTransferSizeUsd: 6_950,
    activeWallets: 310_000,
    confirmationSeconds: 3,
    whaleTransactionCount: 210,
    preferenceShare: 15,
    color: '#f0b90b',
  },
}

export function getAllUsdtChains() {
  return Object.entries(usdtCrossChain).map(([id, v]) => ({ id, ...v }))
}

/**
 * Very simple recommendation utility — kept isolated so it can later be
 * replaced by a real API call without touching the page component.
 * Mock recommendation logic – replace with trained model / live API later.
 */
export function recommendUsdtNetwork({ amount = 100, priority = 'lowest_cost' }) {
  const chains = getAllUsdtChains()

  const scored = chains.map((chain) => {
    let score = 0
    if (priority === 'lowest_cost') {
      score = 100 - chain.avgFeeUsd * 10
    } else if (priority === 'speed') {
      score = 100 - chain.confirmationSeconds
    } else if (priority === 'network_activity') {
      score = chain.preferenceShare
    }
    // Large transfers slightly favour higher-liquidity / whale-friendly chains
    if (amount > 50_000) score += chain.whaleTransactionCount / 100
    return { ...chain, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0]
}
