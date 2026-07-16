import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import { projectConfig } from '../config/projectConfig'

const STEPS = [
  { title: 'Problem Definition', desc: 'Define the forecasting task: predict next-day and 7-day prices, and classify trend direction, for ETH, BNB, and TRX relative to BTC.' },
  { title: 'Dataset Selection', desc: 'Select daily OHLCV price data for each supported coin plus blockchain-network activity metrics.' },
  { title: 'Data Collection', desc: 'Historical prices and network metrics would be collected from public market-data and block-explorer APIs.' },
  { title: 'Data Cleaning', desc: 'Handle missing values, remove duplicate timestamps, and align all series to a common daily calendar.' },
  { title: 'Exploratory Data Analysis', desc: 'Visualise trends, seasonality, volatility clustering, and cross-asset correlations before modelling.' },
  { title: 'Technical Indicators', desc: 'Compute RSI, MACD, moving averages, Bollinger Bands, and ATR as model features.' },
  { title: 'Feature Engineering', desc: 'Build derived features such as momentum, volatility ratios, and cross-chain relative strength.' },
  { title: 'Sliding Time Windows', desc: 'Convert the series into supervised-learning samples using a fixed lookback window per prediction.' },
  { title: 'Price-Regression Targets', desc: 'Define next-day and 7-day future price as continuous regression targets.' },
  { title: 'Trend-Classification Targets', desc: 'Label each window as Bullish, Bearish, or Sideways based on forward returns.' },
  { title: 'Chronological Data Split', desc: 'Split data by time — never randomly — into training, validation, and testing sets.' },
  { title: 'Model Training', desc: 'Train baseline, classical ML, and deep-learning models, then combine the strongest into a hybrid ensemble.' },
  { title: 'Model Evaluation', desc: 'Evaluate using MAE, RMSE, MAPE, R², directional accuracy, precision, recall, and F1 score.' },
  { title: 'Model Deployment', desc: 'Serve the trained model behind a FastAPI backend that the existing frontend service layer will call directly.' },
  { title: 'Future Blockchain Integration', desc: 'Extend the pipeline with live on-chain data (gas fees, active addresses, DeFi TVL) for richer features.' },
]

export default function MethodologyPage() {
  return (
    <div>
      <PageHeader title="Methodology" description="How this project is designed, from raw data to a live forecasting dashboard" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {STEPS.map((step, i) => (
          <div key={step.title} className="card flex gap-4 p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10 text-sm font-bold text-brand-300">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{step.title}</p>
              <p className="mt-1 text-sm text-slate-400">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <h2 className="mb-4 text-base font-semibold text-white">Planned Model Architecture</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {projectConfig.models.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-white/[0.02] p-3 text-center">
              <p className="text-sm font-semibold text-slate-200">{m.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">{m.category}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 card flex items-start gap-3 border-bearish/20 bg-bearish-soft/20 p-5">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-bearish" />
        <div>
          <p className="text-sm font-semibold text-white">Warning: Data Leakage</p>
          <p className="mt-1.5 text-sm text-slate-400">
            Data leakage occurs when information from outside the training window (including the future)
            accidentally influences the model. Common causes include shuffling time-series data, computing
            indicators using future values, or scaling using statistics from the full dataset before splitting.
          </p>
        </div>
      </div>

      <div className="mt-6 card p-6">
        <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-white">
          <CheckCircle2 className="h-4 w-4 text-bullish" /> Why time-series data must not be randomly shuffled
        </h2>
        <p className="text-sm leading-relaxed text-slate-400">
          Unlike typical tabular datasets, price data has a strict temporal order — each day depends on the
          days before it. Randomly shuffling the data before splitting into train/test sets would let the
          model "see the future" during training (for example, training on tomorrow's price to predict
          today's), producing unrealistically high accuracy that collapses in real-world deployment. This
          project instead uses a strict chronological split: earlier data for training, later data for
          validation and testing — mirroring how the model would actually be used in production.
        </p>
      </div>
    </div>
  )
}
