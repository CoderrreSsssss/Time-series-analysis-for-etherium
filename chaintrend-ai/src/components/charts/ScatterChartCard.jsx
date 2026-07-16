import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, ReferenceLine } from 'recharts'

/** data: [{ x, y }] — used for residual / error scatter plots */
export default function ScatterChartCard({ data, xLabel = 'Actual', yLabel = 'Predicted', color = '#818cf8' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
        <XAxis type="number" dataKey="x" name={xLabel} stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis type="number" dataKey="y" name={yLabel} stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 11, fill: '#64748b' }} />
        <ZAxis range={[40, 41]} />
        <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="rgba(148,163,184,0.3)" strokeDasharray="4 4" />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ background: '#111726', border: '1px solid rgba(148,163,184,0.24)', borderRadius: 8, fontSize: 12 }}
        />
        <Scatter data={data} fill={color} fillOpacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
