import { ResponsiveContainer, LineChart, Line } from 'recharts'

/** Minimal inline sparkline for indicator cards. data: array of numbers or {value}. */
export default function Sparkline({ data, color = '#818cf8', height = 36 }) {
  const points = data.map((v, i) => ({ i, value: typeof v === 'number' ? v : v?.value ?? 0 }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={points}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.75} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
