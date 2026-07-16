import { NavLink, Link } from 'react-router-dom'
import { Menu, ArrowRight } from 'lucide-react'
import { projectConfig } from '../../config/projectConfig'
import { useAppContext } from '../../context/AppContext'
import Logo from '../common/Logo'
import ThemeToggle from '../common/ThemeToggle'

/** Marketing top navigation, used on the Landing page. */
export default function TopNav() {
  const { setMobileNavOpen } = useAppContext()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="ChainTrend AI home">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {projectConfig.topNavigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:flex" />
          <Link to="/dashboard" className="btn-primary hidden sm:inline-flex">
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="btn-ghost h-9 w-9 !p-0 rounded-lg border border-border md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
