// ─────────────────────────────────────────────
//  ContactModal.jsx
//  Shows Call / WhatsApp / Profile options.
//  Props: { isOpen, onClose, worker }
// ─────────────────────────────────────────────
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function ContactModal({ isOpen, onClose, worker }) {
  const navigate    = useNavigate()
  const { showToast } = useApp()

  if (!isOpen || !worker) return null

  return (
    <div className="fixed inset-0 bg-black/55 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">✕</button>

        <h3 className="font-sora text-xl font-extrabold text-gray-900 mb-1">Contact {worker.name}</h3>
        <p className="text-sm text-gray-500 mb-6">Choose how to reach this worker directly. No middleman.</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { showToast('Opening phone call...'); onClose() }}
            className="w-full py-3.5 bg-green-500 text-white rounded-xl font-sora font-semibold hover:bg-green-600 transition-colors"
          >
            📞 Call Directly
          </button>
          <button
            onClick={() => { showToast('Opening WhatsApp...'); onClose() }}
            className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-sora font-semibold hover:bg-orange-600 transition-colors"
          >
            💬 WhatsApp Message
          </button>
          <button
            onClick={() => { onClose(); navigate(`/workers/${worker.id}`) }}
            className="w-full py-3.5 border border-black/15 rounded-xl font-sora font-semibold hover:border-orange-500 hover:text-orange-500 transition-colors"
          >
            👁️ View Full Profile
          </button>
        </div>

        <div className="mt-4 bg-green-50 rounded-xl p-3">
          <p className="text-xs text-green-800 font-semibold">✅ Direct contact — 100% of payment goes to the worker. No thekedars.</p>
        </div>
      </div>
    </div>
  )
}
