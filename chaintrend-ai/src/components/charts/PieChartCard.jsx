import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

/** data: [{ name, value, color }] */
export default function PieChartCard({ data, innerRadius = 55 }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={innerRadius} outerRadius={90} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="rgba(0,0,0,0.2)" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: '#111726', border: '1px solid rgba(148,163,184,0.24)', borderRadius: 8, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
