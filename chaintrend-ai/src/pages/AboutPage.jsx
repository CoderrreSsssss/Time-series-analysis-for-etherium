import { GraduationCap, Layers, Cpu, ShieldAlert, Rocket, AlertCircle } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import NetworkBadge from '../components/common/NetworkBadge'
import { projectConfig } from '../config/projectConfig'

export default function AboutPage() {
  return (
    <div>
      <PageHeader title="About This Project" description={projectConfig.brand.tagline} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold text-white">Project Overview</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {projectConfig.brand.name} is a {projectConfig.academic.projectType.toLowerCase()} that analyses and
            forecasts prices across Ethereum, BNB, and TRON, using Bitcoin as a market benchmark. The current
            build focuses entirely on a production-quality frontend with realistic mock data, a clean API
            service layer, and a component architecture designed so a trained machine-learning backend can be
            plugged in later without any UI redesign.
          </p>

          <h3 className="mt-6 text-sm font-semibold text-white">Main Objectives</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-400">
            <li>Build an end-to-end multi-chain analytics dashboard.</li>
            <li>Demonstrate time-series analysis, regression, and trend classification concepts.</li>
            <li>Compare blockchain-network activity across Ethereum, BNB Smart Chain, and TRON.</li>
            <li>Design a clean, swappable data layer ready for a real ML/FastAPI backend.</li>
          </ul>

          <h3 className="mt-6 text-sm font-semibold text-white">Limitations</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-400">
            <li>Price data is fetched live from CoinGecko's public API, with an automatic fallback to deterministic synthetic data if the free API is rate-limited or unreachable.</li>
            <li>Regression (Linear Regression, Random Forest, Gradient Boosting) and trend-classification (Random Forest) models are trained live on real historical data with a chronological train/test split.</li>
            <li>ARIMA and LSTM are not yet implemented — they are documented as planned future work in the Methodology page.</li>
            <li>Blockchain-network metrics (gas fees, transaction counts) are estimated placeholders unless live explorer API keys are configured.</li>
            <li>This project is for academic demonstration only and is not investment advice.</li>
          </ul>
<h3 className="mt-6 text-sm font-semibold text-white">Future Scope</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-400">
            <li>Add ARIMA and LSTM models to the regression comparison for a true hybrid ensemble.</li>
            <li>Persist trained models to disk instead of retraining on each request.</li>
            <li>Add live on-chain data (gas fees, DeFi TVL) using Etherscan/BscScan/TronScan API keys for richer blockchain-network features.</li>
          </ul>

        <div className="space-y-5">
          <div className="card p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-white"><GraduationCap className="h-4 w-4 text-brand-400" /> Academic Details</p>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Student Name" value={projectConfig.academic.studentName} />
              <Row label="University" value={projectConfig.academic.university} />
              <Row label="Course" value={projectConfig.academic.course} />
              <Row label="Mentor" value={projectConfig.academic.mentor} />
              <Row label="Academic Session" value={projectConfig.academic.session} />
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              Edit these values in <code className="text-brand-300">src/config/projectConfig.js</code>.
            </p>
          </div>

          <div className="card p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-white"><Layers className="h-4 w-4 text-brand-400" /> Supported Assets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {projectConfig.coins.map((c) => (
                <NetworkBadge key={c.id} network={c.name} standard={c.tokenStandard} />
              ))}
            </div>
          </div>

          <div className="card p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-white"><Cpu className="h-4 w-4 text-brand-400" /> Technology Stack</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['React 18', 'Vite', 'Tailwind CSS', 'React Router', 'Recharts', 'Lightweight Charts', 'Framer Motion', 'Lucide React', 'Axios', 'Context API', 'date-fns'].map((t) => (
                <span key={t} className="badge border-border text-slate-400">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 card flex items-start gap-3 p-5">
        <Rocket className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
        <div>
          <p className="text-sm font-semibold text-white">Planned ML Architecture</p>
          <p className="mt-1.5 text-sm text-slate-400">
            A hybrid ensemble combining gradient-boosted trees (XGBoost) for tabular technical features with
            an LSTM network for sequential price patterns, blended with a classical ARIMA baseline for
            comparison. See the Methodology page for the full pipeline.
          </p>
        </div>
      </div>

      <div className="mt-6 card flex items-start gap-3 border-sideways/20 bg-sideways-soft/20 p-5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-sideways" />
        <div>
          <p className="text-sm font-semibold text-white">Educational Disclaimer</p>
          <p className="mt-1.5 text-sm text-slate-400">{projectConfig.disclaimer}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
        <ShieldAlert className="h-3.5 w-3.5" /> Built for educational purposes as part of a {projectConfig.academic.projectType.toLowerCase()}.
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="label-caps">{label}</dt>
      <dd className="mt-0.5 text-slate-200">{value}</dd>
    </div>
  )
}
