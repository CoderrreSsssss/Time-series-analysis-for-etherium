import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import ToastContainer from '../common/Toast'

/** Shell used by all internal dashboard-style pages: sidebar + scrollable content. */
export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <MobileNav />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-[1600px]">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}
