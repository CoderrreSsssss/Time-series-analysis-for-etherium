import { ShieldAlert } from 'lucide-react'
import { projectConfig } from '../../config/projectConfig'

export default function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <p className="flex items-start gap-2 text-xs text-slate-500">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sideways" />
        {projectConfig.disclaimer}
      </p>
    )
  }
  return (
    <div className="card flex items-start gap-3 border-sideways/20 bg-sideways-soft/40 p-4">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-sideways" />
      <div>
        <p className="text-sm font-semibold text-slate-100">Educational Project Disclaimer</p>
        <p className="mt-1 text-sm text-slate-400">{projectConfig.disclaimer}</p>
      </div>
    </div>
  )
}
