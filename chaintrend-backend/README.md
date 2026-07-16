# ChainTrend AI — Backend

A real FastAPI backend that replaces the frontend's mock prediction engine
with **actual fetched market data** and **actually-trained scikit-learn
models** (Linear Regression, Random Forest, Gradient Boosting for price
regression; Random Forest for Bullish/Sideways/Bearish trend classification).

This is designed to be dropped in as a drop-in replacement for the frontend's
mock data — every endpoint here matches a function in the frontend's
`src/services/api.js`.

---

## 1. What's real here vs. what's still simplified

Be upfront about this with your teacher — it's good practice, not a weakness:

| Piece | Status |
|---|---|
| Historical price data | **Real** — fetched live from CoinGecko's free public API |
| Technical indicators (SMA, RSI, MACD, Bollinger, ATR, volatility, Sharpe/Sortino/VaR) | **Real** — standard formulas computed with pandas/numpy |
| Price regression (Linear Regression, Random Forest, Gradient Boosting) | **Real** — actually trained with scikit-learn on a chronological train/test split, evaluated with real MAE/RMSE/MAPE/R² |
| Trend classification (Bullish/Sideways/Bearish) | **Real** — a trained Random Forest classifier, evaluated with a real confusion matrix, precision/recall/F1 |
| ARIMA / LSTM | **Not yet implemented** — documented as planned future work (they need `statsmodels` / `tensorflow`, which are heavier dependencies not required to prove the core "real ML replacing mock" concept) |
| Blockchain-network metrics (daily transactions, active addresses, DeFi TVL) | **Estimated placeholders** unless you add free Etherscan/BscScan API keys (see §6) — full live versions need paid/rate-limited explorer APIs |
| Offline fallback | If CoinGecko is unreachable, a deterministic synthetic generator kicks in automatically so the API never crashes during a demo — every response includes a `"dataSource"` field telling you which one was used |

---

## 2. Local Setup

```bash
cd chaintrend-backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` if needed (defaults work fine locally).

## 3. Run it

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` — FastAPI auto-generates an interactive
Swagger UI where you can test every endpoint in the browser. This is genuinely
useful to show your teacher directly.

Quick manual test:
```bash
curl http://localhost:8000/health
curl "http://localhost:8000/predict?coin=ETH"
```

## 4. Connect it to the frontend

In the **frontend** project:

1. Copy `.env.example` to `.env`
2. Set:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_USE_MOCK_DATA=false
   ```
3. Restart the frontend dev server (`npm run dev`)

The frontend's `src/services/api.js` already has the `if (USE_MOCK) {...} else {...}`
branching wired up — nothing else needs to change. Every page will now show
real fetched prices and real trained-model predictions.

> If you see CORS errors in the browser console, check `ALLOWED_ORIGINS` in
> your backend `.env` includes the exact frontend URL (including port).

## 5. How the ML pipeline actually works

1. **Fetch** real daily OHLCV candles from CoinGecko (`app/data_fetch.py`)
2. **Compute indicators** — SMA/EMA/RSI/MACD/Bollinger/ATR (`app/indicators.py`)
3. **Build features** — every feature is *lagged by one day* (yesterday's
   indicators predict today's move) to avoid data leakage (`app/model.py`)
4. **Chronological split** — earliest 80% of rows for training, most recent
   20% for testing. Never shuffled.
5. **Train 3 real regressors** on the next-day **percentage return** (not
   raw price — tree models can't extrapolate past prices they've never
   seen, so predicting returns is standard practice and avoids that)
6. **Pick the best model** by lowest RMSE on the held-out test set
7. **Train a Random Forest classifier** on 7-day-forward trend labels
   (Bullish / Sideways / Bearish based on a ±1% return threshold)
8. **Serve predictions** by combining the best regressor + the classifier

## 6. Adding real blockchain-network data (optional, extra credit)

Right now `/chains/metrics` returns clearly-labeled estimated figures. To
make gas fees live:

1. Sign up for free API keys at [etherscan.io/apis](https://etherscan.io/apis)
   and [bscscan.com/apis](https://bscscan.com/apis)
2. Add them to `.env`:
   ```
   ETHERSCAN_API_KEY=your_key_here
   BSCSCAN_API_KEY=your_key_here
   ```
3. Restart the server — `avgFeeUsd` for Ethereum/BSC will switch from
   `"source": "estimated"` to `"source": "live_gas_oracle"` automatically.

Extending further (daily transaction counts, active addresses, DeFi TVL)
would mean adding calls to each explorer's `/api?module=stats` endpoints or
[DeFiLlama's free API](https://defillama.com/docs/api) inside `app/chains.py` —
structured the same way as the gas-price functions already there.

## 7. Deploying the backend (so Vercel can reach it)

Vercel only hosts the frontend (static files) — the backend needs its own
host. Free options that work well for a student project:

### Option A — Render (recommended, has a free tier)
1. Push this `chaintrend-backend` folder to its own GitHub repo (or a
   subfolder of your existing repo)
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `chaintrend-backend` (if it's a subfolder)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add your environment variables (`ALLOWED_ORIGINS`, API keys) in the Render dashboard
6. Deploy — Render gives you a URL like `https://chaintrend-api.onrender.com`

### Option B — Railway
Same idea: connect the GitHub repo, set the start command, add env vars,
deploy. [railway.app](https://railway.app)

### After deploying the backend:
1. Copy the live backend URL
2. In your **Vercel** project settings, update `VITE_API_BASE_URL` to that URL
   and `VITE_USE_MOCK_DATA` to `false`
3. In your **backend** host's environment variables, update `ALLOWED_ORIGINS`
   to include your live Vercel URL (e.g. `https://chaintrend-ai.vercel.app`)
4. Redeploy both

## 8. Known limitations to mention in your report/viva

- CoinGecko's free tier is rate-limited (~10-30 calls/minute) — the backend
  caches responses for 10 minutes per coin to stay well under that limit.
- Models retrain on each cache expiry rather than being persisted to disk —
  fine for a demo/small dataset, but a production system would train offline
  and serve a saved model file (`joblib`/`pickle`) instead.
- ARIMA and LSTM are documented as planned future work, not implemented.
- Trend-classification accuracy depends heavily on how much real price
  history is available and how volatile the coin has been recently — this
  is expected and worth discussing as a real ML limitation, not a bug.
