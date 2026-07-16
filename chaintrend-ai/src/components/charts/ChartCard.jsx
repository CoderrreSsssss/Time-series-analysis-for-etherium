/** Generic card wrapper for any chart: title, description, header actions, and a fixed-height body. */
export default function ChartCard({ title, description, actions, children, height = 340, footer }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <div style={{ height }} className="w-full">
        {children}
      </div>
      {footer}
    </div>
  )
}
