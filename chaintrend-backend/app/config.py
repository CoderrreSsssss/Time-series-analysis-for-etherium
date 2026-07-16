"""
Central backend configuration.
Mirrors the frontend's src/config/projectConfig.js so coin IDs / symbols
stay consistent across both sides of the stack.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Comma-separated list of frontend origins allowed to call this API.
# Add your deployed Vercel URL here in production (see README).
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

# Optional API keys for real blockchain-network metrics (see README section 6).
# Leave blank to fall back to clearly-labeled estimated network figures.
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY", "")
BSCSCAN_API_KEY = os.getenv("BSCSCAN_API_KEY", "")
TRONSCAN_API_KEY = os.getenv("TRONSCAN_API_KEY", "")

# Maps the frontend's coin IDs to CoinGecko's coin IDs.
COINGECKO_IDS = {
    "ETH": "ethereum",
    "BNB": "binancecoin",
    "TRX": "tron",
    "BTC": "bitcoin",
}

COIN_META = {
    "ETH": {"name": "Ethereum", "network": "Ethereum", "tokenStandard": "ERC-20"},
    "BNB": {"name": "BNB", "network": "BNB Smart Chain", "tokenStandard": "BEP-20"},
    "TRX": {"name": "TRON", "network": "TRON", "tokenStandard": "TRC-20"},
    "BTC": {"name": "Bitcoin", "network": "Bitcoin", "tokenStandard": "Native (benchmark)"},
}

SUPPORTED_COINS = list(COINGECKO_IDS.keys())

PORT = int(os.getenv("PORT", "8000"))
