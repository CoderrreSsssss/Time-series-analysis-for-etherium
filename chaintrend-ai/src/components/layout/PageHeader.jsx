import { Menu, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { useAppContext } from '../../context/AppContext'
import ThemeToggle from '../common/ThemeToggle'
import ModelStatusBadge from '../common/ModelStatusBadge'

/**
 * Shared header for every internal (dashboard-style) page.
 * title/description are page-specific; actions is optional extra JSX
 * (e.g. coin selector) rendered on the right.
 */
export default function PageHeader({ title, description, actions, showRefresh = false, onRefresh, refreshing = false }) {
  const { setMobileNavOpen } = useAppContext()

  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="btn-ghost mt-0.5 h-9 w-9 !p-0 rounded-lg border border-border lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="section-heading">{title}</h1>
            <ModelStatusBadge />
          </div>
          {description && <p className="mt-1 max-w-2xl text-sm text-slate-400">{description}</p>}
          <p className="mt-1 text-xs text-slate-500">Data as of {format(new Date(), 'MMM d, yyyy · h:mm a')}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {showRefresh && (
          <button type="button" onClick={onRefresh} className="btn-secondary" aria-label="Refresh data">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        )}
        <ThemeToggle />
      </div>
    </div>
  )
}
