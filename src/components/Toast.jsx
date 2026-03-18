// ─────────────────────────────────────────────
//  Toast.jsx
//  Global notification bar shown at bottom-right.
//  Reads state from AppContext — any component
//  can trigger it by calling showToast('message').
// ─────────────────────────────────────────────
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast } = useApp()

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] bg-gray-900 text-white px-5 py-3.5 rounded-xl text-sm font-medium max-w-xs border-l-4 border-orange-500 transition-all duration-400 ${
        toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
      }`}
    >
      {toast.msg}
    </div>
  )
}
