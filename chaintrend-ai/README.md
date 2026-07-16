# ChainTrend AI

**Multi-Chain Crypto Intelligence and Forecasting** — a university-level frontend for a *Multi-Chain
Cryptocurrency Trend Analysis and Price Forecasting System*.

This repository contains a **complete, production-quality frontend only**. It uses realistic, deterministic
mock data everywhere a trained machine-learning model will eventually be needed, and it is architected so
that the real model backend can be plugged in later **without redesigning any page**.

> ⚠️ **Educational Disclaimer**: This platform is an educational university project. Predictions, signals,
> and analytics are generated for academic demonstration and must not be considered financial or investment
> advice.

---

## 1. Project Overview

ChainTrend AI analyses and compares:

- **Ethereum (ETH)** — ERC-20 ecosystem
- **BNB (BNB)** — BNB Smart Chain, BEP-20 ecosystem
- **TRON (TRX)** — TRC-20 ecosystem
- **Bitcoin (BTC)** — market benchmark

It ships with 14 fully-built pages covering time-series analysis, price forecasting, model performance,
trend classification, technical analysis, multi-chain comparison, USDT cross-chain analysis, risk analysis,
a searchable/exportable data explorer, and a documented methodology.

## 2. Features

- Premium, dark-first, futuristic dashboard UI (Binance / TradingView / Linear / Vercel inspired, original design)
- 4 years of deterministic, seeded mock OHLCV data per coin (no giant hard-coded arrays — generated on the fly)
- Full technical-indicator engine: SMA, EMA, RSI, MACD, Bollinger Bands, ATR, volatility, drawdown, Sharpe/Sortino, VaR
- Mock AI prediction engine driven by real momentum/indicator math (not pure randomness)
- Candlestick charts (Lightweight Charts), line/area/composed charts and bar/pie/radar/scatter charts (Recharts)
- Reusable component library: cards, tables, tabs, dropdowns, modals, tooltips, skeletons, toasts, badges, meters
- Collapsible desktop sidebar + mobile drawer navigation, dark/light theme toggle
- CSV export, client-side search/sort/pagination on every data table
- A single **API service layer** (`src/services/api.js`) so swapping mock data for a real FastAPI backend
  touches one file, not the UI
- Fully responsive from 320px mobile to 1440px+ desktop
- Vercel-ready (SPA rewrites configured) and GitHub-ready (`.gitignore`, clean history)

## 3. Technology Stack

- React 18 + Vite
- JavaScript (no TypeScript)
- Tailwind CSS
- React Router v7
- Recharts (line / area / bar / pie / radar / scatter / composed charts)
- Lightweight Charts (candlesticks)
- Framer Motion (landing-page animation)
- Lucide React (icons)
- Axios (wired into the service layer, ready for the real backend)
- Context API (no Redux)
- date-fns

## 4. Folder Structure

```text
chaintrend-ai/
├── public/
│   ├── favicon.svg
│   └── placeholder-logo.svg
├── src/
│   ├── components/
│   │   ├── charts/         # ChartCard, PriceChart, CandlestickChart, Sparkline, Pie/Bar/Radar/Scatter…
│   │   ├── common/         # MetricCard, TrendBadge, ConfidenceMeter, RiskMeter, Modal, Dropdown, Tabs…
│   │   ├── dashboard/       # IndicatorCard, ConfusionMatrix
│   │   ├── landing/         # HeroPreviewCard
│   │   ├── layout/          # Sidebar, TopNav, MobileNav, PageHeader, Footer, AppShell
│   │   └── tables/          # DataTable
│   ├── config/
│   │   └── projectConfig.js   # <-- EDIT THIS for student/university/coin/nav config
│   ├── context/
│   │   ├── AppContext.jsx     # selected coin/range, theme mode, toasts, sidebar state
│   │   └── ThemeContext.jsx   # dark/light mode
│   ├── data/
│   │   ├── coinData.js
│   │   ├── networkData.js
│   │   ├── modelData.js
│   │   └── mockDataGenerator.js  # seeded OHLCV generator + indicator enrichment
│   ├── hooks/                # useMarketData, usePrediction, useTheme, useCoin, useToast
│   ├── pages/                 # one file per route, 14 pages + 404
│   ├── services/
│   │   └── api.js             # <-- THE swap point for a real backend
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── exportCsv.js
│   │   ├── indicators.js      # SMA/EMA/RSI/MACD/Bollinger/ATR/Sharpe/Sortino/VaR
│   │   └── predictionMock.js  # "Mock prediction logic – replace with trained model API later"
│   ├── App.jsx                 # lazy-loaded routes
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

## 5. Installation

```bash
npm install
```

## 6. Local Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173` with hot-module reload.

## 7. Production Build

```bash
npm run build
npm run preview
```

`npm run build` outputs static files to `dist/`. `npm run preview` serves that build locally so you can
verify it before deploying.

## 8. GitHub Upload Instructions

```bash
git init
git add .
git commit -m "Initial ChainTrend AI frontend"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## 9. Vercel Deployment Instructions

1. Push the project to GitHub (see above).
2. Open [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Confirm the framework preset is **Vite** (auto-detected).
5. Add the environment variables from `.env.example` (see below).
6. Click **Deploy**.

`vercel.json` already contains the SPA rewrite rule so refreshing on a nested route like
`/dashboard` or `/risk-analysis` will not show a 404 in production.

## 10. Environment Variables

Copy `.env.example` to `.env` for local overrides:

```text
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_DATA=true
```

- `VITE_API_BASE_URL` — base URL of the future FastAPI / ML backend.
- `VITE_USE_MOCK_DATA` — keep `true` until the real backend is deployed and reachable. When `false`,
  `src/services/api.js` will call the real endpoints via Axios instead of the mock generators.

On Vercel, add both variables under **Project Settings → Environment Variables**.

## 11. Replacing Mock Data With the Future Model API

All UI components call functions from **`src/services/api.js`** — never the mock generators directly. To go
live:

1. Implement your FastAPI backend with endpoints matching the functions in `api.js`
   (`/market/overview`, `/market/history`, `/predict`, `/indicators`, `/models/metrics`, `/chains/metrics`, `/risk`).
2. Set `VITE_USE_MOCK_DATA=false` in your `.env` (or Vercel environment variables).
3. Inside `src/services/api.js`, each function already has an `if (USE_MOCK) { ... } else { await httpClient.get(...) }`
   branch — just confirm your response payloads match the documented shape below.
4. Use `mapPredictionResponse()` (bottom of `api.js`) to normalise your `/predict` response into the shape
   the UI expects — no component code needs to change.

### Expected `/predict` response shape

```json
{
  "coin": "ETH",
  "current_price": 3200.5,
  "next_day_price": 3268.4,
  "expected_return": 2.12,
  "trend": "Bullish",
  "confidence": 0.74,
  "forecast": [
    { "date": "2026-07-14", "price": 3268.4, "lower": 3195.2, "upper": 3334.8 }
  ],
  "metrics": {
    "mae": 82.4,
    "rmse": 106.7,
    "mape": 3.2,
    "r2": 0.91,
    "directional_accuracy": 0.64
  }
}
```

## 12. Planned Machine-Learning Integration

See the in-app **Methodology** page (`/methodology`) for the full 15-step pipeline, including data
cleaning, feature engineering, sliding time windows, chronological splitting, and the planned model
architecture:

- Naive Baseline · Linear Regression · Random Forest · XGBoost · ARIMA · LSTM · **Hybrid Ensemble** (selected)

## 13. Supported Coins and Networks

| Coin | Network | Token Standard |
|------|---------|-----------------|
| ETH  | Ethereum | ERC-20 |
| BNB  | BNB Smart Chain | BEP-20 |
| TRX  | TRON | TRC-20 |
| BTC  | Bitcoin | Benchmark (native) |

## 14. Disclaimer

This platform is an educational university project. Predictions, signals, and analytics are generated for
academic demonstration and must not be considered financial or investment advice.

## 15. Screenshots

_Add screenshots of your deployed dashboard here before submission, e.g.:_

```markdown
![Landing Page](./docs/screenshots/landing.png)
![Dashboard](./docs/screenshots/dashboard.png)
![Model Performance](./docs/screenshots/model-performance.png)
```

## 16. Future Improvements

- Connect the real FastAPI / ML backend described above
- Add authentication (the sidebar "Logout" button is currently a placeholder)
- Add WebSocket-based live price updates
- Add user-configurable watchlists and alerts
- Expand blockchain-network metrics with live on-chain data

---

## Editing Student / University Details

All academic placeholders live in **one file**: `src/config/projectConfig.js` → the `academic` object.
Update `studentName`, `university`, `course`, `mentor`, and `session` there — every page (About, Footer,
etc.) reads from this single source.

## Verification Checklist

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts the dev server
- [ ] `npm run build` completes without errors
- [ ] `npm run preview` serves the production build
- [ ] All 14 routes + `/` load without console errors: `/dashboard`, `/time-series`, `/forecast`,
      `/actual-vs-predicted`, `/trend-analysis`, `/technical-analysis`, `/model-performance`,
      `/chain-comparison`, `/cross-chain-usdt`, `/risk-analysis`, `/data-explorer`, `/methodology`, `/about`
- [ ] Visiting a nested route directly (e.g. `/risk-analysis`) does not 404 after deployment
- [ ] Coin selector, time-range selector, chart-type toggles, and all dropdowns are interactive
- [ ] CSV export on the Data Explorer page downloads a file
- [ ] Dark/light theme toggle works and persists on reload
- [ ] Mobile drawer opens/closes correctly under 768px width
- [ ] All charts resize correctly when the window is resized

---

Built as a university AI/ML capstone project. Not financial advice.
