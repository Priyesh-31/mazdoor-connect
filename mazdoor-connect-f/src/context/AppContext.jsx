// ─────────────────────────────────────────────
//  AppContext — global state shared across all
//  pages: toast messages, active category filter,
//  and (later) logged-in user info.
// ─────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [toast, setToast]             = useState({ msg: '', visible: false })
  const [activeCategory, setActiveCategory] = useState('')

  // Call showToast('message') from any component
  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }, [])

  return (
    <AppContext.Provider value={{ toast, showToast, activeCategory, setActiveCategory }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook — import and call useApp() in any component
export function useApp() {
  return useContext(AppContext)
}
