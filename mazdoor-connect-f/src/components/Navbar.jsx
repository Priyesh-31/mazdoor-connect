// src/components/Navbar.jsx
import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth }  from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import Logo from './Logo.jsx'

const links = [
  { to: '/',          label: 'Home' },
  { to: '/workers',   label: 'Find Workers' },
  { to: '/about',     label: 'About' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { showToast }    = useToast()
  const { t, toggleLanguage, language } = useLanguage()
  const navigate         = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    showToast(t('loggedOut'))
    navigate('/')
    setMenuOpen(false)
  }

  // All nav links including conditional ones
  const allLinks = [
    ...links,
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {allLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors no-underline
                 ${isActive ? 'text-orange' : 'text-gray-500 hover:text-orange'}`}>
              {t(link.label === 'Home' ? 'home' : link.label === 'Find Workers' ? 'findWorkers' : link.label === 'About' ? 'about' : 'dashboard')}
            </NavLink>
          ))}
          <button onClick={toggleLanguage} className="btn-outline py-2 px-4 text-xs">
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
        </div>

        {/* Desktop right buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-3">
              {/* User avatar + name */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-light flex items-center
                                justify-center font-sora font-bold text-orange text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn-outline text-sm py-2 px-4">
                {t('logout')}
              </button>
            </div>
          ) : (
            <>
              <Link to="/register" className="btn-outline text-sm py-2 px-5">{t('login')}</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">{t('joinFree')}</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-1 bg-transparent border-none cursor-pointer"
          onClick={() => setMenuOpen(true)}>
          <svg className="w-6 h-6 fill-gray-800" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-6 md:hidden">
          <div className="flex justify-between items-center mb-6">
            <Logo compact />
            <button onClick={() => setMenuOpen(false)} className="text-2xl bg-transparent border-none cursor-pointer text-gray-800">✕</button>
          </div>

          {user && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-orange-light rounded-xl">
              <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center font-sora font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-sora font-bold text-sm text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            {allLinks.map(link => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `py-4 text-base font-semibold border-b border-gray-100 no-underline
                   ${isActive ? 'text-orange' : 'text-gray-800'}`}>
                {t(link.label === 'Home' ? 'home' : link.label === 'Find Workers' ? 'findWorkers' : link.label === 'About' ? 'about' : 'dashboard')}
              </NavLink>
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-6">
            {user ? (
              <button onClick={handleLogout} className="btn-outline text-center">{t('logout')}</button>
            ) : (
              <>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-outline text-center">{t('login')}</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center">{t('joinFree')}</Link>
              </>
            )}
            <button onClick={toggleLanguage} className="btn-outline text-center py-3">
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
