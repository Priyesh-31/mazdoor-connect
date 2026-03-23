// ─────────────────────────────────────────────
//  App.jsx — root component.
//  Sets up routing (each URL → a page component)
//  and wraps everything in AppProvider so all
//  pages share the same global state.
// ─────────────────────────────────────────────
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import Navbar  from './components/Navbar'
import Toast   from './components/Toast'
import Home           from './pages/Home'
import Workers        from './pages/Workers'
import WorkerProfile  from './pages/WorkerProfile'
import Register       from './pages/Register'
import Dashboard      from './pages/Dashboard'
import About          from './pages/About'

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        {/* Navbar is outside Routes so it shows on every page */}
        <Navbar />

        {/* Each <Route> maps a URL path to a page component */}
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/workers"    element={<Workers />} />
          <Route path="/workers/:id" element={<WorkerProfile />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/about"      element={<About />} />
        </Routes>

        {/* Toast sits at bottom-right, reads from context */}
        <Toast />
      </AppProvider>
    </ToastProvider>
  )
}
