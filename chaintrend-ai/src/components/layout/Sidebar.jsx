import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react'
import { projectConfig } from '../../config/projectConfig'
import { useAppContext } from '../../context/AppContext'
import Logo from '../common/Logo'
import Tooltip from '../common/Tooltip'

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppContext()

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-bg-surface/60 backdrop-blur-xl transition-all duration-300 lg:flex ${
        sidebarCollapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <div className={`flex h-16 items-center border-b border-border px-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        {sidebarCollapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 shadow-glow text-white font-bold text-sm">
            {projectConfig.brand.logoText}
          </div>
        ) : (
          <Logo size="sm" />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-1">
          {projectConfig.navigation.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle
            const linkContent = (
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30'
                      : 'text-slate-400 border border-transparent hover:bg-white/[0.05] hover:text-slate-200'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
            return (
              <li key={item.path}>
                {sidebarCollapsed ? (
                  <Tooltip content={item.label} side="right">
                    {linkContent}
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-slate-300 ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          title="Logout (placeholder — no auth in this demo)"
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
        <button
          type="button"
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-white/[0.05] hover:text-slate-300 ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          {sidebarCollapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
