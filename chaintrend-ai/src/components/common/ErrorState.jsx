import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorState({ title = 'Something went wrong', message = 'We could not load this data.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-bearish/30 bg-bearish-soft">
        <AlertTriangle className="h-6 w-6 text-bearish" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-2">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  )
}
