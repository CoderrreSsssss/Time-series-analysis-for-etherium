import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, LineChart, TrendingUp, Waypoints, Network, BrainCircuit, ShieldAlert,
  Database, Sparkles, Layers, Cpu, GaugeCircle, LayoutDashboard, GraduationCap, ArrowUpRight,
} from 'lucide-react'
import TopNav from '../components/layout/TopNav'
import Footer from '../components/layout/Footer'
import Disclaimer from '../components/common/Disclaimer'
import NetworkBadge from '../components/common/NetworkBadge'
import HeroPreviewCard from '../components/landing/HeroPreviewCard'
import { projectConfig } from '../config/projectConfig'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const features = [
  { icon: LineChart, title: 'Time-Series Analysis', desc: 'Rolling averages, volatility, drawdowns, and seasonal patterns across 4 years of daily price history.' },
  { icon: TrendingUp, title: 'Price Regression', desc: 'Next-day and 7-day price forecasts with confidence intervals, ready to be powered by a trained regression model.' },
  { icon: Waypoints, title: 'Trend Classification', desc: 'Bullish, bearish, or sideways classification with probability breakdowns and a full classification report.' },
  { icon: Network, title: 'Multi-Chain Comparison', desc: 'Compare Ethereum, BNB Smart Chain, and TRON on transactions, fees, active addresses, and DeFi activity.' },
  { icon: BrainCircuit, title: 'Model Explainability', desc: 'Feature importance, training curves, and confusion matrices make every prediction easy to interpret.' },
  { icon: ShieldAlert, title: 'Risk Analysis', desc: 'Volatility, Value-at-Risk, Sharpe/Sortino ratios, and drawdown analysis for each supported asset.' },
]

const workflow = [
  { label: 'Historical Data', icon: Database },
  { label: 'Data Cleaning', icon: Sparkles },
  { label: 'Feature Engineering', icon: Layers },
  { label: 'Model Training', icon: Cpu },
  { label: 'Price Forecast', icon: TrendingUp },
  { label: 'Trend Classification', icon: Waypoints },
  { label: 'Interactive Dashboard', icon: LayoutDashboard },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <TopNav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-radial-glow">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:pt-24">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge border-brand-500/30 bg-brand-500/10 text-brand-300">
                <GraduationCap className="h-3.5 w-3.5" /> University AI/ML Project
              </span>
              <span className="badge border-sideways/30 bg-sideways-soft text-sideways">
                <Sparkles className="h-3.5 w-3.5" /> Mock Prediction Mode
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Multi-Chain Crypto Intelligence <span className="text-brand-400">and Forecasting</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              {projectConfig.brand.name} analyses and compares Ethereum, BNB, and TRON against Bitcoin as a
              market benchmark — combining time-series analysis, price regression, trend classification, and
              blockchain-network analytics in a single dashboard.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/dashboard" className="btn-primary text-sm">
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/time-series" className="btn-secondary text-sm">
                Explore Analysis
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              {projectConfig.networks.map((n) => (
                <NetworkBadge key={n.id} network={n.name} standard={n.tokenStandard} />
              ))}
              <NetworkBadge network="Bitcoin" standard="Benchmark" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="flex justify-center lg:justify-end"
          >
            <HeroPreviewCard />
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-border bg-bg-surface/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="max-w-2xl">
            <p className="label-caps text-brand-400">Platform Capabilities</p>
            <h2 className="section-heading mt-2">Everything a modern forecasting system needs</h2>
            <p className="mt-3 text-slate-400">
              Every module below is fully wired into the interface with realistic mock data today, and designed
              to plug directly into a trained machine-learning backend later.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
                className="card card-hover p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10">
                  <f.icon className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="max-w-2xl">
            <p className="label-caps text-brand-400">System Workflow</p>
            <h2 className="section-heading mt-2">From raw blockchain data to a live forecast</h2>
          </motion.div>

          <div className="mt-10 flex flex-wrap items-stretch gap-3">
            {workflow.map((step, i) => (
              <motion.div
                key={step.label}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="card flex min-w-[150px] flex-col items-center gap-2 px-4 py-5 text-center">
                  <step.icon className="h-5 w-5 text-brand-400" />
                  <span className="text-xs font-semibold text-slate-300">{step.label}</span>
                </div>
                {i < workflow.length - 1 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-600 sm:block" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORTED NETWORKS */}
      <section className="border-t border-border bg-bg-surface/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="max-w-2xl">
            <p className="label-caps text-brand-400">Supported Networks</p>
            <h2 className="section-heading mt-2">Three smart-contract networks, one benchmark</h2>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Ethereum', coin: 'ETH', standard: 'ERC-20', color: '#818cf8' },
              { name: 'BNB Smart Chain', coin: 'BNB', standard: 'BEP-20', color: '#f0b90b' },
              { name: 'TRON', coin: 'TRX', standard: 'TRC-20', color: '#ef4444' },
              { name: 'Bitcoin', coin: 'BTC', standard: 'Benchmark', color: '#f59e0b' },
            ].map((n) => (
              <div key={n.name} className="card p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${n.color}22` }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: n.color }} />
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{n.name}</p>
                <p className="text-xs text-slate-500">{n.coin} · {n.standard}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="border-t border-border py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp}>
            <p className="label-caps text-brand-400">Project Methodology</p>
            <h2 className="section-heading mt-2">Built like a real research pipeline</h2>
            <p className="mt-3 text-slate-400">
              The planned model pipeline follows a rigorous, leakage-free process: chronological data
              splitting, sliding time windows, technical-indicator feature engineering, and a hybrid
              ensemble combining classical ML with an LSTM network.
            </p>
            <Link to="/methodology" className="btn-secondary mt-6 inline-flex text-sm">
              View Full Methodology <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="card p-6">
            <div className="flex items-center gap-2">
              <GaugeCircle className="h-5 w-5 text-brand-400" />
              <p className="text-sm font-semibold text-white">Planned Model Architecture</p>
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {projectConfig.models.map((m) => (
                <li key={m.id} className="flex items-center justify-between border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-slate-300">{m.name}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-500">{m.category}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-border bg-gradient-to-b from-brand-900/20 to-transparent py-20">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
        >
          <h2 className="section-heading">Ready to explore the dashboard?</h2>
          <p className="mt-3 text-slate-400">
            Dive into live charts, mock predictions, technical indicators, and cross-chain comparisons — all
            built on a clean architecture ready for a real ML backend.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard" className="btn-primary text-sm">
              Open Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/about" className="btn-secondary text-sm">
              About This Project
            </Link>
          </div>
          <div className="mt-8">
            <Disclaimer compact />
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
