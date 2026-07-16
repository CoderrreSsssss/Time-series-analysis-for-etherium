import { useAppContext } from '../context/AppContext'

/** Fire-and-forget toast notifications: useToast().success('Saved!') */
export function useToast() {
  const { showToast } = useAppContext()
  return {
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    info: (msg) => showToast(msg, 'info'),
    warning: (msg) => showToast(msg, 'warning'),
  }
}
