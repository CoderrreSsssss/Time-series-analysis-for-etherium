import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts'

/** data: [{ metric, value }] for a single-series radar (e.g. probability distribution, indicator overview) */
export default function RadarChartCard({ data, dataKey = 'value', name = 'Score', color = '#818cf8' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="rgba(148,163,184,0.15)" />
        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <PolarRadiusAxis tick={{ fontSize: 10, fill: '#64748b' }} />
        <Radar dataKey={dataKey} name={name} stroke={color} fill={color} fillOpacity={0.35} />
        <Tooltip contentStyle={{ background: '#111726', border: '1px solid rgba(148,163,184,0.24)', borderRadius: 8, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
