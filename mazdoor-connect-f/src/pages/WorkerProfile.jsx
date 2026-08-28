// src/pages/WorkerProfile.jsx — worker profile and booking flow
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { workersAPI, jobsAPI } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import ContactModal from '../components/ContactModal.jsx'

export default function WorkerProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { t, translateCategory } = useLanguage()
  const navigate = useNavigate()

  const [worker, setWorker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contactOpen, setContactOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await workersAPI.getById(id)
        setWorker(res.worker)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  async function handleBooking() {
    if (!user) {
      navigate('/register')
      return
    }

    if (String(user.role || '').toUpperCase() !== 'CUSTOMER') {
      showToast('Only customers can book workers')
      return
    }

    try {
      await jobsAPI.create({
        workerId: worker.id,
        title: `Job request from ${user.name}`,
        agreedRate: worker.dailyRate,
      })
      showToast(t('sendJobRequest'))
    } catch (err) {
      showToast(err.message)
    }
  }

  async function handleReview(e) {
    e.preventDefault()
    if (!rating) {
      showToast('Please select a star rating')
      return
    }

    setSubmitting(true)
    try {
      showToast(`${t('submitReview')} ⭐`)
      setRating(0)
      setComment('')
    } catch (err) {
      showToast(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-6" />
        <div className="bg-white rounded-2xl p-6 mb-5 flex gap-5">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-28 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
        </div>
      </div>
    </div>
  )

  if (error || !worker) return (
    <div className="text-center py-24 px-6">
      <div className="text-5xl mb-4">👷</div>
      <h2 className="font-sora font-bold text-xl text-gray-900 mb-2">Worker not found</h2>
      <Link to="/workers" className="btn-primary">← {t('findWorkers')}</Link>
    </div>
  )

  const initials = worker.name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 pb-20">
      <Link to="/workers" className="btn-outline text-sm inline-block mb-6">← {t('findWorkers')}</Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-5 flex-wrap mb-5">
        <div className="w-20 h-20 rounded-full flex items-center justify-center font-sora font-bold text-3xl flex-shrink-0 bg-orange-light text-orange">
          {initials}
        </div>
        <div className="flex-1 min-w-44">
          <h1 className="font-sora font-extrabold text-2xl text-gray-900 mb-1">{worker.name}</h1>
          <p className="text-gray-500 text-sm">{translateCategory(worker.category)} · {worker.location}</p>
          <div className="flex items-center gap-2 my-2">
            <span className="text-amber-400">
              {'★'.repeat(Math.floor(worker.ratingAvg || 0))}{'☆'.repeat(5 - Math.floor(worker.ratingAvg || 0))}
            </span>
            <span className="text-xs text-gray-400">
              {worker.ratingAvg ? `${worker.ratingAvg}` : 'No ratings yet'} · {worker.reviewCount || 0} {t('reviews')}
            </span>
          </div>
          <span className={`text-xs font-bold font-sora px-3 py-1 rounded-full ${worker.available ? 'bg-green-light text-green-700' : 'bg-orange-light text-orange-dark'}`}>
            {worker.available ? `✅ ${t('availableNow')}` : `🔴 ${t('engaged')}`}
          </span>
          <div className="flex gap-3 mt-4 flex-wrap">
            <button onClick={() => setContactOpen(true)} className="btn-primary">📞 {t('contactWorker')}</button>
            <button onClick={handleBooking} className="btn-green">📋 {t('sendJobRequest')}</button>
          </div>
        </div>
      </div>

      {worker.bio && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h3 className="font-sora font-bold text-sm text-gray-900 mb-2">{t('about')}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{worker.bio}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h3 className="font-sora font-bold text-sm text-gray-900 mb-3">{t('workDetails')}</h3>
        {[
          [t('workCategory'), translateCategory(worker.category)],
          [t('dailyRate'), `₹${worker.dailyRate}/day (negotiable)`],
          [t('experience'), `${worker.experience} years`],
          [t('location'), `${worker.location}`],
          [t('payment'), 'UPI / Cash accepted'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400 font-medium">{label}</span>
            <span className={`text-xs font-semibold ${label === t('dailyRate') ? 'text-orange' : 'text-gray-900'}`}>{value}</span>
          </div>
        ))}
      </div>

      {worker.reviews?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <h3 className="font-sora font-bold text-sm text-gray-900 mb-3">{t('reviews')}</h3>
          <div className="flex flex-col gap-3">
            {worker.reviews.map(review => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-900">{review.customer?.name}</span>
                  <span className="text-amber-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                {review.comment && <p className="text-xs text-gray-500 leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {user?.role === 'CUSTOMER' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-sora font-bold text-sm text-gray-900 mb-3">{t('leaveReview')}</h3>
          <form onSubmit={handleReview}>
            <div className="flex gap-2 mb-3 text-2xl cursor-pointer text-amber-400">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} onClick={() => setRating(i)}>{i <= rating ? '★' : '☆'}</span>
              ))}
            </div>
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience with this worker..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none outline-none focus:border-orange mb-3"
            />
            <button type="submit" disabled={submitting} className="btn-primary text-sm disabled:opacity-60">
              {submitting ? 'Submitting...' : t('submitReview')}
            </button>
          </form>
        </div>
      )}

      <ContactModal worker={contactOpen ? worker : null} onClose={() => setContactOpen(false)} />
    </div>
  )
}
