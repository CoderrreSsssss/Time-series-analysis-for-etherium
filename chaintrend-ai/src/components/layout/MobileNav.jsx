import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { projectConfig } from '../../config/projectConfig'
import { useAppContext } from '../../context/AppContext'
import Logo from '../common/Logo'

export default function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useAppContext()
  if (!mobileNavOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[150] lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
      <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] animate-fadeUp bg-bg-surface border-r border-border p-4 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <Logo size="sm" />
          <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="btn-ghost h-8 w-8 !p-0 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          <ul className="space-y-1">
            {projectConfig.navigation.map((item) => {
              const Icon = Icons[item.icon] || Icons.Circle
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30' : 'text-slate-400 border border-transparent hover:bg-white/[0.05] hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </div>,
    document.body
  )
}
