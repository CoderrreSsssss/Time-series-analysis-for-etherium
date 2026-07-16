import { Inbox } from 'lucide-react'

export default function EmptyState({ title = 'No data found', message = 'Try adjusting your filters or search.', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white/[0.03]">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  )
}
