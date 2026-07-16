import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/** Accessible dropdown/select. options: [{ value, label }] */
export default function Dropdown({ label, options, value, onChange, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="input flex items-center justify-between gap-2 text-left"
      >
        <span className="truncate">
          {label && <span className="mr-1 text-slate-500">{label}:</span>}
          {selected?.label ?? 'Select'}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-40 mt-1.5 max-h-64 w-full min-w-max overflow-auto rounded-lg border border-border-strong bg-bg-elevated p-1 shadow-card"
        >
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/[0.06]"
              >
                {opt.label}
                {opt.value === value && <Check className="h-3.5 w-3.5 text-brand-400" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
