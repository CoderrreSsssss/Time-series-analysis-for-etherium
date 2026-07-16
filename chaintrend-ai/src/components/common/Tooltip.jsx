import { useState } from 'react'

/** Simple hover/focus tooltip wrapper for any child element. */
export default function Tooltip({ content, children, side = 'top' }) {
  const [open, setOpen] = useState(false)
  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`absolute z-50 w-56 rounded-lg border border-border-strong bg-bg-elevated p-2.5 text-xs leading-relaxed text-slate-300 shadow-card ${sideClasses[side]}`}
        >
          {content}
        </span>
      )}
    </span>
  )
}
