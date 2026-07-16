import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts'

/**
 * Generic bar chart for comparisons (model metrics, network activity, etc).
 * data: array of objects; bars: [{ key, name, color }]
 */
export default function ComparisonBarChart({ data, bars, xKey = 'name', horizontal = false, highlightIndex }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
        {horizontal ? (
          <>
            <XAxis type="number" stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis type="category" dataKey={xKey} stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 11, fill: '#64748b' }} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis stroke="rgba(148,163,184,0.4)" tick={{ fontSize: 11, fill: '#64748b' }} />
          </>
        )}
        <Tooltip
          contentStyle={{ background: '#111726', border: '1px solid rgba(148,163,184,0.24)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#e2e8f0' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        {bars.map((bar) => (
          <Bar key={bar.key} dataKey={bar.key} name={bar.name} fill={bar.color} radius={[4, 4, 4, 4]}>
            {highlightIndex !== undefined &&
              data.map((_, i) => <Cell key={i} fillOpacity={i === highlightIndex ? 1 : 0.55} />)}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
