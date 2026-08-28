// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Navbar        from './components/Navbar.jsx'
import Toast         from './components/Toast.jsx'
import Home          from './pages/Home.jsx'
import Workers       from './pages/Workers.jsx'
import WorkerProfile from './pages/WorkerProfile.jsx'
import Register      from './pages/Register.jsx'
import Dashboard     from './pages/Dashboard.jsx'
import About         from './pages/About.jsx'

// ProtectedRoute: redirects to /register if not logged in
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange border-t-transparent
                        rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/register" replace />
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/workers"    element={<Workers />} />
        <Route path="/workers/:id" element={<WorkerProfile />} />
        <Route path="/worker/:id"  element={<WorkerProfile />} />
        <Route path="/about"      element={<About />} />
        {/* Redirect logged-in users away from register page */}
        <Route path="/register"   element={<Register />} />
        {/* Dashboard requires login */}
        <Route path="/dashboard"  element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
      </Routes>
      <Toast />
    </>
  )
}
