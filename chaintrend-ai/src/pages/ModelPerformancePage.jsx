import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import Tabs from '../components/common/Tabs'
import ChartCard from '../components/charts/ChartCard'
import ComparisonBarChart from '../components/charts/ComparisonBarChart'
import PriceChart from '../components/charts/PriceChart'
import DataTable from '../components/tables/DataTable'
import InfoTooltip from '../components/common/InfoTooltip'
import ConfusionMatrix from '../components/dashboard/ConfusionMatrix'
import { ChartSkeleton } from '../components/common/LoadingSkeleton'
import { getModelMetrics } from '../services/api'
import { modelExplanations } from '../data/modelData'
import { projectConfig } from '../config/projectConfig'

const TABS = [
  { id: 'regression', label: 'Regression' },
  { id: 'classification', label: 'Classification' },
  { id: 'training', label: 'Training History' },
  { id: 'features', label: 'Feature Importance' },
  { id: 'info', label: 'Model Information' },
]

export default function ModelPerformancePage() {
  const [tab, setTab] = useState('regression')
  const [data, setData] = useState(null)

  useEffect(() => {
    getModelMetrics().then(setData)
  }, [])

  if (!data) {
    return (
      <div>
        <PageHeader title="Model Performance" description="Loading model evaluation metrics…" />
        <ChartSkeleton height={420} />
      </div>
    )
  }

  const rmseBars = data.regression.map((m) => ({ name: m.model, rmse: m.rmse }))
  const maeBars = data.regression.map((m) => ({ name: m.model, mae: m.mae }))
  const daBars = data.regression.map((m) => ({ name: m.model, da: Math.round(m.directionalAccuracy * 100) }))
  const selected = data.regression.find((m) => m.status === 'selected')

  const columns = [
    { key: 'model', label: 'Model', sortable: true, render: (r) => (
      <span className="flex items-center gap-1.5">
        {r.status === 'selected' && <Star className="h-3.5 w-3.5 text-sideways" fill="currentColor" />}
        {r.model}
      </span>
    ) },
    { key: 'mae', label: 'MAE', sortable: true },
    { key: 'rmse', label: 'RMSE', sortable: true },
    { key: 'mape', label: 'MAPE', sortable: true, render: (r) => `${r.mape}%` },
    { key: 'r2', label: 'R²', sortable: true },
    { key: 'directionalAccuracy', label: 'Dir. Accuracy', sortable: true, render: (r) => `${Math.round(r.directionalAccuracy * 100)}%` },
    { key: 'trainingTime', label: 'Training Time' },
    { key: 'modelSize', label: 'Model Size' },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`badge ${r.status === 'selected' ? 'border-brand-400/30 bg-brand-500/10 text-brand-300' : 'border-border text-slate-400'}`}>
        {r.status === 'selected' ? 'Selected' : r.status}
      </span>
    ) },
  ]

  return (
    <div>
      <PageHeader
        title="Model Performance"
        description="Comparison of every candidate model evaluated for this project"
        actions={<Tabs items={TABS} activeId={tab} onChange={setTab} />}
      />

      {selected && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <ScoreCard label="MAE" value={selected.mae} tooltip={modelExplanations.mae} />
          <ScoreCard label="RMSE" value={selected.rmse} tooltip={modelExplanations.rmse} />
          <ScoreCard label="MAPE" value={`${selected.mape}%`} tooltip={modelExplanations.mape} />
          <ScoreCard label="R²" value={selected.r2} tooltip={modelExplanations.r2} />
          <ScoreCard label="Dir. Accuracy" value={`${Math.round(selected.directionalAccuracy * 100)}%`} tooltip={modelExplanations.directionalAccuracy} />
          <ScoreCard label="Model Size" value={selected.modelSize} />
        </div>
      )}

      {tab === 'regression' && (
        <>
          <div className="card mb-6 p-5">
            <h2 className="mb-4 text-base font-semibold text-white">Model Comparison Table</h2>
            <DataTable columns={columns} rows={data.regression} pageSize={10} />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard title="RMSE Comparison" description="Lower is better">
              <ComparisonBarChart data={rmseBars} bars={[{ key: 'rmse', name: 'RMSE', color: '#f43f5e' }]} horizontal />
            </ChartCard>
            <ChartCard title="MAE Comparison" description="Lower is better">
              <ComparisonBarChart data={maeBars} bars={[{ key: 'mae', name: 'MAE', color: '#f59e0b' }]} horizontal />
            </ChartCard>
          </div>
          <div className="mt-5">
            <ChartCard title="Directional Accuracy Comparison" description="Percentage of correct up/down calls — higher is better">
              <ComparisonBarChart data={daBars} bars={[{ key: 'da', name: 'Directional Accuracy %', color: '#22c55e' }]} />
            </ChartCard>
          </div>
        </>
      )}

      {tab === 'classification' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="card p-5">
            <p className="mb-4 text-sm font-semibold text-white">Confusion Matrix</p>
            <ConfusionMatrix data={data.classification.confusionMatrix} />
          </div>
          <div className="card p-5">
            <p className="mb-4 text-sm font-semibold text-white">Classification Report</p>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-slate-500">
                  <th className="pb-2">Class</th><th>Precision</th><th>Recall</th><th>F1</th><th>Support</th>
                </tr>
              </thead>
              <tbody>
                {data.classification.report.map((r) => (
                  <tr key={r.label} className="border-t border-border/60 text-slate-300">
                    <td className="py-2">{r.label}</td><td>{r.precision}</td><td>{r.recall}</td><td>{r.f1}</td><td>{r.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ScoreCard label="Precision" value={data.classification.precision} tooltip={modelExplanations.precision} />
              <ScoreCard label="Recall" value={data.classification.recall} tooltip={modelExplanations.recall} />
              <ScoreCard label="F1 Score" value={data.classification.f1Score} tooltip={modelExplanations.f1} />
              <ScoreCard label="Balanced Accuracy" value={data.classification.balancedAccuracy} />
            </div>
          </div>
        </div>
      )}

      {tab === 'training' && (
        <ChartCard title="Training vs Validation Loss" description="Loss curve across training epochs for the Hybrid Ensemble model" height={380}>
          <PriceChart
            data={data.trainingHistory.map((h) => ({ date: `Epoch ${h.epoch}`, close: h.trainLoss, predicted: h.valLoss }))}
            mode="actual-vs-predicted"
            unit="number"
            color="#818cf8"
          />
        </ChartCard>
      )}

      {tab === 'features' && (
        <ChartCard title="Feature Importance" description="Relative contribution of each engineered feature to the model's predictions" height={420}>
          <ComparisonBarChart data={data.featureImportance.map((f) => ({ name: f.feature, importance: Number((f.importance * 100).toFixed(1)) }))} bars={[{ key: 'importance', name: 'Importance %', color: '#c084fc' }]} horizontal />
        </ChartCard>
      )}

      {tab === 'info' && (
        <div className="card p-6">
          <h2 className="mb-4 text-base font-semibold text-white">Model Metadata</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetaRow label="Active Model" value={projectConfig.modelMeta.activeModel} />
            <MetaRow label="Model Version" value={projectConfig.modelMeta.version} />
            <MetaRow label="Last Trained" value={projectConfig.modelMeta.lastTrained} />
            <MetaRow label="Training Data Period" value={projectConfig.modelMeta.trainingPeriod} />
            <MetaRow label="Testing Data Period" value={projectConfig.modelMeta.testingPeriod} />
            <MetaRow label="Status" value={projectConfig.modelMeta.status === 'live' ? 'Live' : 'Mock Prediction Mode'} />
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreCard({ label, value, tooltip }) {
  return (
    <div className="card p-4">
      <p className="label-caps flex items-center gap-1">{label} {tooltip && <InfoTooltip term={label}>{tooltip}</InfoTooltip>}</p>
      <p className="mt-1.5 text-lg font-bold text-white">{value}</p>
    </div>
  )
}

function MetaRow({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-white/[0.02] p-4">
      <p className="label-caps">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-200">{value}</p>
    </div>
  )
}
