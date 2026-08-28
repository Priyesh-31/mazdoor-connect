// src/context/ToastContext.jsx
// Context lets ANY component deep in the tree trigger a toast
// without passing functions down through props manually.
// Usage anywhere: const { showToast } = useToast()
//                 showToast('Worker saved!')

import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const [visible, setVisible]  = useState(false)

  const showToast = useCallback((msg) => {
    setMessage(msg)
    setVisible(true)
    // Auto-hide after 3 seconds
    setTimeout(() => setVisible(false), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, message, visible }}>
      {children}
    </ToastContext.Provider>
  )
}

// Custom hook — cleaner to use than raw useContext(ToastContext)
export function useToast() {
  return useContext(ToastContext)
}
