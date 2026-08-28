// src/components/ContactModal.jsx
// A reusable modal. Props control whether it's shown and which worker.
// parent passes: worker, onClose

import { useToast } from '../context/ToastContext'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function ContactModal({ worker, onClose }) {
  const { showToast } = useToast()
  const { t } = useLanguage()

  // Don't render anything if no worker selected
  if (!worker) return null

  return (
    // Backdrop — click outside to close
    <div
      className="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal box — stop clicks here from closing */}
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-sm relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-lg
                     flex items-center justify-center text-gray-800 border-none cursor-pointer"
        >✕</button>

        <h3 className="font-sora font-extrabold text-gray-900 text-xl mb-1">
          {t('contact')} {worker.name}
        </h3>
        <p className="text-sm text-gray-500 mb-5">{t('directContact')}</p>

        <div className="flex flex-col gap-2.5">
          <button
            className="btn-green w-full py-3 text-base"
            onClick={() => { showToast(t('openingCall')); onClose() }}
          >
            📞 {t('callDirectly')}
          </button>
          <button
            className="btn-primary w-full py-3 text-base"
            onClick={() => { showToast(t('openingWhatsApp')); onClose() }}
          >
            💬 {t('whatsappMessage')}
          </button>
        </div>

        <div className="bg-green-light rounded-xl p-3 mt-4">
          <p className="text-xs font-semibold text-green-700 m-0">
            ✅ 100% of payment goes directly to the worker. No thekedars.
          </p>
        </div>
      </div>
    </div>
  )
}
