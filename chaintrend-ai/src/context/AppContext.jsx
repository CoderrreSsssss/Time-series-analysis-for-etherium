import { createContext, useCallback, useContext, useState } from 'react'
import { projectConfig } from '../config/projectConfig'

const AppContext = createContext(null)

let toastId = 0

export function AppProvider({ children }) {
  const [selectedCoinId, setSelectedCoinId] = useState('ETH')
  const [selectedRange, setSelectedRange] = useState('3M')
  const [useMockData] = useState(projectConfig.api.useMockData)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, variant = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = {
    selectedCoinId,
    setSelectedCoinId,
    selectedRange,
    setSelectedRange,
    useMockData,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileNavOpen,
    setMobileNavOpen,
    toasts,
    showToast,
    dismissToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within an AppProvider')
  return ctx
}
