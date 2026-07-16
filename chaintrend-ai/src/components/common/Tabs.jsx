/** Tabs: items=[{id,label,icon}], activeId, onChange */
export default function Tabs({ items, activeId, onChange, className = '' }) {
  return (
    <div role="tablist" className={`flex flex-wrap gap-1 rounded-xl border border-border bg-white/[0.02] p-1 ${className}`}>
      {items.map((item) => {
        const active = item.id === activeId
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
