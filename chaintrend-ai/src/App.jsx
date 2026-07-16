import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import { ChartSkeleton } from './components/common/LoadingSkeleton'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TimeSeriesPage = lazy(() => import('./pages/TimeSeriesPage'))
const ForecastPage = lazy(() => import('./pages/ForecastPage'))
const ActualPredictedPage = lazy(() => import('./pages/ActualPredictedPage'))
const TrendPage = lazy(() => import('./pages/TrendPage'))
const TechnicalAnalysisPage = lazy(() => import('./pages/TechnicalAnalysisPage'))
const ModelPerformancePage = lazy(() => import('./pages/ModelPerformancePage'))
const ChainComparisonPage = lazy(() => import('./pages/ChainComparisonPage'))
const CrossChainUsdtPage = lazy(() => import('./pages/CrossChainUsdtPage'))
const RiskAnalysisPage = lazy(() => import('./pages/RiskAnalysisPage'))
const DataExplorerPage = lazy(() => import('./pages/DataExplorerPage'))
const MethodologyPage = lazy(() => import('./pages/MethodologyPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageFallback() {
  return (
    <div className="p-6">
      <ChartSkeleton height={420} />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/time-series" element={<TimeSeriesPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/actual-vs-predicted" element={<ActualPredictedPage />} />
          <Route path="/trend-analysis" element={<TrendPage />} />
          <Route path="/technical-analysis" element={<TechnicalAnalysisPage />} />
          <Route path="/model-performance" element={<ModelPerformancePage />} />
          <Route path="/chain-comparison" element={<ChainComparisonPage />} />
          <Route path="/cross-chain-usdt" element={<CrossChainUsdtPage />} />
          <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
          <Route path="/data-explorer" element={<DataExplorerPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
