import { Fragment } from 'react'

/** Reusable confusion-matrix heatmap grid. data: { labels: string[], matrix: number[][] } */
export default function ConfusionMatrix({ data }) {
  const max = Math.max(...data.matrix.flat())
  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: `80px repeat(${data.labels.length}, 1fr)` }}>
        <div />
        {data.labels.map((l) => (
          <div key={l} className="p-1.5 text-center text-[11px] font-semibold text-slate-400">{l}</div>
        ))}
        {data.matrix.map((row, i) => (
          <Fragment key={i}>
            <div className="flex items-center p-1.5 text-[11px] font-semibold text-slate-400">{data.labels[i]}</div>
            {row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className="m-0.5 flex aspect-square items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: `rgba(99,102,241,${0.15 + (val / max) * 0.65})` }}
              >
                {val}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Rows = actual class, columns = predicted class. Diagonal cells are correct classifications.</p>
    </div>
  )
}
