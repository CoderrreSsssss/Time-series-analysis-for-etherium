import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

const ICONS = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle }
const COLORS = {
  success: 'border-bullish/30 text-bullish',
  error: 'border-bearish/30 text-bearish',
  info: 'border-brand-400/30 text-brand-300',
  warning: 'border-sideways/30 text-sideways',
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useAppContext()
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant] || Info
        return (
          <div
            key={toast.id}
            role="status"
            className={`card flex items-start gap-2.5 border p-3 shadow-2xl animate-fadeUp ${COLORS[toast.variant] || COLORS.info}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm text-slate-200">{toast.message}</p>
            <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification" className="text-slate-500 hover:text-slate-300">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
