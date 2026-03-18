// ─────────────────────────────────────────────
//  WorkerProfile.jsx
//  Individual worker profile page.
//  useParams() reads the :id from the URL.
// ─────────────────────────────────────────────
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { workers } from '../data/workers'
import { useApp } from '../context/AppContext'
import ContactModal from '../components/modals/ContactModal'

export default function WorkerProfile() {
  const { id }    = useParams()                          // gets :id from /workers/:id
  const navigate  = useNavigate()
  const { showToast } = useApp()
  const worker    = workers.find(w => w.id === parseInt(id))

  const [contactOpen, setContactOpen] = useState(false)
  const [rating,      setRating]      = useState(0)
  const [reviewText,  setReviewText]  = useState('')

  if (!worker) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Worker not found.</p>
      <button onClick={() => navigate('/workers')} className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl font-sora font-semibold">← Back to Workers</button>
    </div>
  )

  function submitReview() {
    if (!rating) { showToast('Please select a star rating first'); return }
    showToast('Review submitted! Thank you ⭐')
    setRating(0); setReviewText('')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/workers')} className="mb-6 px-4 py-2 border border-black/15 rounded-lg text-sm font-semibold hover:border-orange-500 hover:text-orange-500 transition-colors">
        ← Back to Workers
      </button>

      {/* ── Profile header ───────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-black/10 mb-4 flex gap-5 flex-wrap">
        <div className="w-20 h-20 rounded-full flex items-center justify-center font-sora font-bold text-3xl flex-shrink-0"
          style={{ backgroundColor: worker.avatarBg, color: worker.avatarColor }}>
          {worker.initials}
        </div>
        <div className="flex-1 min-w-48">
          <h2 className="font-sora text-2xl font-extrabold text-gray-900 mb-0.5">{worker.name}</h2>
          <p className="text-gray-500 text-sm mb-2">{worker.category} · {worker.location}</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400">{[1,2,3,4,5].map(i => i <= Math.floor(worker.rating) ? '★' : '☆').join('')}</span>
            <span className="text-xs text-gray-500">{worker.rating} · {worker.reviews} reviews</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-sora ${worker.available ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-800'}`}>
            {worker.available ? '✅ Available Now' : '🔴 Currently Engaged'}
          </span>
          <div className="flex gap-3 mt-4 flex-wrap">
            <button onClick={() => setContactOpen(true)} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-sora font-semibold text-sm hover:bg-orange-600 transition-colors">
              📞 Contact Worker
            </button>
            <button onClick={() => showToast('Saved to favourites ♥')} className="px-5 py-2.5 border border-black/15 rounded-xl font-sora font-semibold text-sm hover:border-orange-500 hover:text-orange-500 transition-colors">
              ♡ Save
            </button>
          </div>
        </div>
      </div>

      {/* ── About ────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-black/10 mb-4">
        <h4 className="font-sora font-bold text-gray-900 mb-3">About</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{worker.bio}</p>
      </div>

      {/* ── Work Details ─────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-black/10 mb-4">
        <h4 className="font-sora font-bold text-gray-900 mb-4">Work Details</h4>
        {[
          ['Category',   worker.category],
          ['Daily Rate', `₹${worker.rate}/day (negotiable)`],
          ['Experience', `${worker.experience} years`],
          ['Location',   `${worker.location}, UP`],
          ['Payment',    'UPI / Cash accepted'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between py-2 border-b border-black/5 last:border-0">
            <span className="text-xs text-gray-500 font-medium">{label}</span>
            <span className={`text-xs font-semibold ${label === 'Daily Rate' ? 'text-orange-500' : 'text-gray-900'}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Leave a Review ───────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-black/10">
        <h4 className="font-sora font-bold text-gray-900 mb-4">Leave a Review</h4>
        <div className="flex gap-2 mb-4 text-2xl">
          {[1,2,3,4,5].map(i => (
            <span key={i} className={`cursor-pointer transition-colors ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              onClick={() => setRating(i)}>★</span>
          ))}
        </div>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          placeholder={`Share your experience working with ${worker.name}...`}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-black/10 text-sm text-gray-900 resize-none outline-none focus:border-orange-500 mb-3"
        />
        <button onClick={submitReview} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-sora font-semibold text-sm hover:bg-orange-600 transition-colors">
          Submit Review
        </button>
      </div>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} worker={worker} />
    </div>
  )
}
