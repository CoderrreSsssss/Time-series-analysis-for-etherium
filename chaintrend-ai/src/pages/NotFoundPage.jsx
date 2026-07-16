import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'
import Logo from '../components/common/Logo'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <Logo />
      <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-white/[0.03]">
        <Compass className="h-7 w-7 text-slate-500" />
      </div>
      <h1 className="mt-6 text-5xl font-bold text-white">404</h1>
      <p className="mt-2 text-lg font-semibold text-slate-200">Page not found</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or has moved. Let's get you back to the dashboard.
      </p>
      <Link to="/dashboard" className="btn-primary mt-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
    </div>
  )
}
