// src/context/AuthContext.jsx
// This is the brain of authentication in the frontend.
// Any component can call useAuth() to know:
//   - who is logged in (user)
//   - whether a check is happening (loading)
//   - how to log out (logout)
//
// It reads the saved token on page load, verifies it with the
// backend, and keeps user state fresh across the whole app.

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, saveSession, clearSession, getSavedUser } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Start with whatever user is saved in localStorage (instant, no flicker)
  const [user,    setUser]    = useState(getSavedUser)
  const [loading, setLoading] = useState(true)  // true until we verify with backend

  // On app load: verify the saved token is still valid with the backend
  // Handles the case where token expired while user was away
  useEffect(() => {
    async function verifySession() {
      const token = localStorage.getItem('mc_token')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await authAPI.getMe()
        setUser(data.user)                          // refresh with latest data from DB
        saveSession(token, data.user)               // update localStorage with fresh data
      } catch {
        // Backend is unavailable or token is a demo token. Keep the saved user
        // so the local demo flow still works after a reload.
        const savedUser = getSavedUser()
        if (savedUser) {
          setUser(savedUser)
        } else {
          clearSession()
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [])

  // Called after successful login or register
  const loginUser = useCallback((token, userData) => {
    saveSession(token, userData)
    setUser(userData)
  }, [])

  // Called when user clicks logout
  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
