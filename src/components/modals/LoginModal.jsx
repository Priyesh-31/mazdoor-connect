// ─────────────────────────────────────────────
//  LoginModal.jsx
//  Reusable modal for OTP login.
//  Props: { isOpen, onClose }
// ─────────────────────────────────────────────
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function LoginModal({ isOpen, onClose }) {
  const navigate    = useNavigate()
  const { showToast } = useApp()

  if (!isOpen) return null   // render nothing when closed

  function handleLogin() {
    onClose()
    navigate('/dashboard')
    showToast('Welcome back, Ramesh! 👷')
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/55 z-[100] flex items-center justify-center p-4"
      onClick={onClose}   // close when clicking outside
    >
      {/* Modal box — stopPropagation so clicking inside doesn't close */}
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-md relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-lg text-gray-800 flex items-center justify-center hover:bg-gray-200"
        >✕</button>

        <h3 className="font-sora text-xl font-extrabold text-gray-900 mb-1">Login to MazdoorConnect</h3>
        <p className="text-sm text-gray-500 mb-6">Enter your mobile number to receive a login OTP</p>

        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mobile Number</label>
        <input
          type="tel"
          placeholder="+91 9876543210"
          className="w-full px-4 py-3 rounded-xl border-2 border-black/10 text-sm text-gray-900 outline-none focus:border-orange-500 mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-sora font-semibold hover:bg-orange-600 transition-colors"
        >
          Send OTP
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          New here?{' '}
          <span
            className="text-orange-500 cursor-pointer"
            onClick={() => { onClose(); navigate('/register') }}
          >
            Create account
          </span>
        </p>
      </div>
    </div>
  )
}
