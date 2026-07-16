import { Link } from 'react-router-dom'
import { Code2, Boxes } from 'lucide-react'
import { projectConfig } from '../../config/projectConfig'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-800">
                <Boxes className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">{projectConfig.brand.name}</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{projectConfig.brand.tagline}</p>
          </div>

          <div>
            <p className="label-caps mb-3">Platform</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/dashboard" className="hover:text-slate-200">Dashboard</Link></li>
              <li><Link to="/forecast" className="hover:text-slate-200">Price Forecasting</Link></li>
              <li><Link to="/model-performance" className="hover:text-slate-200">Model Performance</Link></li>
              <li><Link to="/chain-comparison" className="hover:text-slate-200">Chain Comparison</Link></li>
            </ul>
          </div>

          <div>
            <p className="label-caps mb-3">Project</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/methodology" className="hover:text-slate-200">Methodology</Link></li>
              <li><Link to="/about" className="hover:text-slate-200">About Project</Link></li>
              <li><Link to="/data-explorer" className="hover:text-slate-200">Data Explorer</Link></li>
            </ul>
          </div>

          <div>
            <p className="label-caps mb-3">Academic</p>
            <ul className="space-y-1.5 text-sm text-slate-400">
              <li>{projectConfig.academic.university}</li>
              <li>{projectConfig.academic.course}</li>
              <li>{projectConfig.academic.session}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {projectConfig.brand.name}. Built as a {projectConfig.academic.projectType.toLowerCase()} for educational purposes only.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300"
          >
            <Code2 className="h-3.5 w-3.5" /> View source on GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
