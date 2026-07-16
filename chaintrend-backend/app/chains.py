"""
Blockchain-network metrics (transactions, fees, active addresses, etc.)

Full real-time versions of these numbers (daily transaction counts, active
addresses, DeFi TVL) require paid/rate-limited explorer APIs (Etherscan,
BscScan, TronScan) or on-chain indexers. To keep this project runnable
without any paid subscriptions, this module:

  1. Fetches REAL, LIVE gas prices from Etherscan/BscScan's free gas-oracle
     endpoints when API keys are provided in .env (free tier, sign up at
     etherscan.io / bscscan.com).
  2. Falls back to clearly-labeled estimated figures (`"source": "estimated"`)
     for anything that would otherwise require a paid plan.

This is an honest, explainable middle ground for a university project —
extend `_fetch_live_gas_price()` and add TronScan/DeFiLlama calls once you
have API keys, without touching any other file.
"""
import requests
from .config import ETHERSCAN_API_KEY, BSCSCAN_API_KEY

ESTIMATED_NETWORK_METRICS = {
    "ethereum": {
        "id": "ethereum", "network": "Ethereum", "name": "Ethereum",
        "nativeCoin": "ETH", "tokenStandard": "ERC-20", "color": "#818cf8",
        "dailyTransactions": 1_180_000, "activeAddresses": 452_000, "avgFeeUsd": 2.85,
        "blockTimeSeconds": 12, "stablecoinActivityUsd": 9_400_000_000,
        "networkUtilisation": 78, "defiActivityUsd": 54_000_000_000, "overallScore": 88,
        "source": "estimated",
    },
    "bsc": {
        "id": "bsc", "network": "BNB Smart Chain", "name": "BNB Smart Chain",
        "nativeCoin": "BNB", "tokenStandard": "BEP-20", "color": "#f0b90b",
        "dailyTransactions": 3_650_000, "activeAddresses": 1_120_000, "avgFeeUsd": 0.18,
        "blockTimeSeconds": 3, "stablecoinActivityUsd": 4_100_000_000,
        "networkUtilisation": 63, "defiActivityUsd": 6_200_000_000, "overallScore": 79,
        "source": "estimated",
    },
    "tron": {
        "id": "tron", "network": "TRON", "name": "TRON",
        "nativeCoin": "TRX", "tokenStandard": "TRC-20", "color": "#ef4444",
        "dailyTransactions": 6_900_000, "activeAddresses": 2_450_000, "avgFeeUsd": 0.02,
        "blockTimeSeconds": 3, "stablecoinActivityUsd": 18_700_000_000,
        "networkUtilisation": 71, "defiActivityUsd": 1_800_000_000, "overallScore": 82,
        "source": "estimated",
    },
}


def get_network_metrics() -> list[dict]:
    metrics = {k: dict(v) for k, v in ESTIMATED_NETWORK_METRICS.items()}

    live_eth_gas = _fetch_etherscan_gas()
    if live_eth_gas is not None:
        metrics["ethereum"]["avgFeeUsd"] = live_eth_gas
        metrics["ethereum"]["source"] = "live_gas_oracle"

    live_bsc_gas = _fetch_bscscan_gas()
    if live_bsc_gas is not None:
        metrics["bsc"]["avgFeeUsd"] = live_bsc_gas
        metrics["bsc"]["source"] = "live_gas_oracle"

    return list(metrics.values())


def _fetch_etherscan_gas() -> float | None:
    if not ETHERSCAN_API_KEY:
        return None
    try:
        resp = requests.get(
            "https://api.etherscan.io/api",
            params={"module": "gastracker", "action": "gasoracle", "apikey": ETHERSCAN_API_KEY},
            timeout=8,
        )
        resp.raise_for_status()
        gwei = float(resp.json()["result"]["ProposeGasPrice"])
        # Rough gwei -> USD estimate for a standard 21000-gas transfer at a fixed ETH price.
        eth_price_usd = 3200
        return round((gwei * 1e-9) * 21000 * eth_price_usd, 2)
    except Exception:
        return None


def _fetch_bscscan_gas() -> float | None:
    if not BSCSCAN_API_KEY:
        return None
    try:
        resp = requests.get(
            "https://api.bscscan.com/api",
            params={"module": "gastracker", "action": "gasoracle", "apikey": BSCSCAN_API_KEY},
            timeout=8,
        )
        resp.raise_for_status()
        gwei = float(resp.json()["result"]["ProposeGasPrice"])
        bnb_price_usd = 590
        return round((gwei * 1e-9) * 21000 * bnb_price_usd, 4)
    except Exception:
        return None


USDT_CROSS_CHAIN_ESTIMATED = {
    "USDT-ERC20": {"label": "USDT (ERC-20)", "network": "Ethereum", "color": "#818cf8", "volume24hUsd": 12_800_000_000,
                   "transferCount24h": 410_000, "avgFeeUsd": 3.1, "avgTransferSizeUsd": 31_200,
                   "activeWallets": 285_000, "confirmationSeconds": 180, "whaleTransactionCount": 640,
                   "preferenceShare": 34},
    "USDT-TRC20": {"label": "USDT (TRC-20)", "network": "TRON", "color": "#ef4444", "volume24hUsd": 24_500_000_000,
                   "transferCount24h": 2_150_000, "avgFeeUsd": 0.01, "avgTransferSizeUsd": 11_400,
                   "activeWallets": 940_000, "confirmationSeconds": 3, "whaleTransactionCount": 1180,
                   "preferenceShare": 51},
    "USDT-BEP20": {"label": "USDT (BEP-20)", "network": "BNB Smart Chain", "color": "#f0b90b", "volume24hUsd": 3_900_000_000,
                   "transferCount24h": 560_000, "avgFeeUsd": 0.15, "avgTransferSizeUsd": 6_950,
                   "activeWallets": 310_000, "confirmationSeconds": 3, "whaleTransactionCount": 210,
                   "preferenceShare": 15},
}


def get_usdt_cross_chain() -> list[dict]:
    return [{"id": k, **v} for k, v in USDT_CROSS_CHAIN_ESTIMATED.items()]


def recommend_usdt_network(amount: float, priority: str) -> dict:
    chains = get_usdt_cross_chain()
    scored = []
    for chain in chains:
        if priority == "lowest_cost":
            score = 100 - chain["avgFeeUsd"] * 10
        elif priority == "speed":
            score = 100 - chain["confirmationSeconds"]
        else:
            score = chain["preferenceShare"]
        if amount > 50_000:
            score += chain["whaleTransactionCount"] / 100
        scored.append({**chain, "score": score})
    scored.sort(key=lambda c: c["score"], reverse=True)
    return scored[0]
