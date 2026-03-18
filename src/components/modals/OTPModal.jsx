// ─────────────────────────────────────────────
//  OTPModal.jsx
//  4-digit OTP verification modal.
//  Props: { isOpen, onClose, onVerify }
// ─────────────────────────────────────────────
import { useRef } from 'react'

export default function OTPModal({ isOpen, onClose, onVerify }) {
  const inputs = useRef([])

  if (!isOpen) return null

  function handleInput(e, idx) {
    if (e.target.value.length === 1 && idx < 3) {
      inputs.current[idx + 1].focus()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/55 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">✕</button>

        <h3 className="font-sora text-xl font-extrabold text-gray-900 mb-1">Verify Your Mobile</h3>
        <p className="text-sm text-gray-500 mb-6">We sent a 4-digit OTP to your mobile number.</p>

        <div className="flex gap-3 justify-center mb-6">
          {[0,1,2,3].map(i => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="number"
              maxLength={1}
              onInput={e => handleInput(e, i)}
              className="w-14 h-14 text-center text-2xl font-bold font-sora rounded-xl border-2 border-black/15 focus:border-orange-500 outline-none text-gray-900"
            />
          ))}
        </div>

        <button
          onClick={onVerify}
          className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-sora font-semibold hover:bg-orange-600 transition-colors"
        >
          Verify &amp; Register
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Didn't receive? <span className="text-orange-500 cursor-pointer">Resend OTP</span>
        </p>
      </div>
    </div>
  )
}
