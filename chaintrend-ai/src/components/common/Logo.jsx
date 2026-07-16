import { Boxes } from 'lucide-react'
import { projectConfig } from '../../config/projectConfig'

/**
 * Text-based brand logo. Replace the <Boxes> icon + gradient box with an
 * <img src="/logo.png" /> later if you design a real logo — the rest of
 * the app references this component, not a raw image, so the swap is easy.
 */
export default function Logo({ size = 'md', showTagline = false }) {
  const dims = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex ${dims} items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 shadow-glow`}>
        <Boxes className="h-[55%] w-[55%] text-white" strokeWidth={2.25} />
      </div>
      <div className="leading-tight">
        <div className={`font-bold tracking-tight text-white ${textSize}`}>{projectConfig.brand.name}</div>
        {showTagline && <div className="text-[11px] text-slate-400">{projectConfig.brand.tagline}</div>}
      </div>
    </div>
  )
}
