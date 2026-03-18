// ─────────────────────────────────────────────
//  Navbar.jsx
//  Sticky top navigation bar.
//  NavLink from react-router-dom automatically
//  adds an "active" class when the URL matches.
// ─────────────────────────────────────────────
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import LoginModal from './modals/LoginModal'

export default function Navbar() {
  const navigate = useNavigate()
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  // Tailwind classes reused for nav links
  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors cursor-pointer ${
      isActive ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'
    }`

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/10 px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <span className="font-sora text-xl font-bold text-gray-900">
            Mazdoor<span className="text-orange-500">Connect</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/"          className={linkClass} end>Home</NavLink>
          <NavLink to="/workers"   className={linkClass}>Find Workers</NavLink>
          <NavLink to="/register"  className={linkClass}>Register</NavLink>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/about"     className={linkClass}>About</NavLink>
        </div>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => setLoginOpen(true)}
            className="px-5 py-2 rounded-lg border border-black/15 text-sm font-semibold font-sora text-gray-800 hover:border-orange-500 hover:text-orange-500 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold font-sora hover:bg-orange-600 transition-colors"
          >
            Join Free
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-1" onClick={() => setMenuOpen(true)}>
          <svg className="w-6 h-6" fill="#1A1A1A" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="font-sora text-xl font-bold">Mazdoor<span className="text-orange-500">Connect</span></span>
            <button onClick={() => setMenuOpen(false)} className="text-2xl text-gray-800">✕</button>
          </div>
          <div className="flex flex-col gap-0">
            {[['/', 'Home'], ['/workers', 'Find Workers'], ['/register', 'Register'], ['/dashboard', 'Dashboard'], ['/about', 'About']].map(([path, label]) => (
              <NavLink
                key={path} to={path} end={path === '/'}
                onClick={() => setMenuOpen(false)}
                className="text-lg font-semibold text-gray-900 py-4 border-b border-black/10"
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div className="flex flex-col gap-3 mt-8">
            <button onClick={() => { setLoginOpen(true); setMenuOpen(false) }} className="w-full py-3 border border-black/15 rounded-xl font-sora font-semibold">Login</button>
            <button onClick={() => { navigate('/register'); setMenuOpen(false) }} className="w-full py-3 bg-orange-500 text-white rounded-xl font-sora font-semibold">Join Free</button>
          </div>
        </div>
      )}

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
