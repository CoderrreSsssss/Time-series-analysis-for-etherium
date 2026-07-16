import { HelpCircle } from 'lucide-react'
import Tooltip from './Tooltip'

/** Small "?" icon that explains a technical term inline. Used everywhere for student-friendly explanations. */
export default function InfoTooltip({ term, children, side = 'top' }) {
  return (
    <Tooltip content={children} side={side}>
      <button
        type="button"
        aria-label={term ? `What is ${term}?` : 'More information'}
        className="inline-flex h-4 w-4 items-center justify-center text-slate-500 transition-colors hover:text-brand-400"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  )
}
