import { useState } from 'react'
import { ChevronDown, Lightbulb } from 'lucide-react'

/** Expandable "How to understand this chart" info box for student-friendly explanations. */
export default function ExplainerBox({ title = 'How to understand this chart', children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3 rounded-xl border border-border bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-300"
      >
        <span className="flex items-center gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-brand-400" />
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 text-sm leading-relaxed text-slate-400">{children}</div>}
    </div>
  )
}
