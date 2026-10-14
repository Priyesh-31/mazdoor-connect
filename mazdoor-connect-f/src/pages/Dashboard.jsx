import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { jobsAPI, workersAPI } from '../api/client.js'
import { useLanguage } from '../context/LanguageContext.jsx'

const statusStyle = {
  PENDING: { cls: 'bg-blue-50 text-blue-700', label: 'New request' },
  ACCEPTED: { cls: 'bg-green-light text-green-700', label: 'Accepted' },
  IN_PROGRESS: { cls: 'bg-orange-light text-orange', label: 'In progress' },
  COMPLETED: { cls: 'bg-gray-100 text-gray-500', label: 'Completed' },
  CANCELLED: { cls: 'bg-red-50 text-red-500', label: 'Cancelled' },
}

const workerTabs = ['Overview', 'My Jobs', 'Earnings', 'Reviews', 'Edit Profile']
const customerTabs = ['Overview', 'My Bookings', 'Leave Reviews']

function Metric({ label, value, tone = 'text-gray-900' }) {
  return (
    <div className="bg-white/90 rounded-2xl border border-black/5 p-5 shadow-sm">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`font-sora font-extrabold text-2xl ${tone}`}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const { t, translateCategory } = useLanguage()
  const navigate = useNavigate()
  const isWorker = String(user?.role || '').toUpperCase() === 'WORKER'
  const tabs = isWorker ? workerTabs : customerTabs

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(user?.workerProfile?.available ?? true)
  const [activeTab, setActiveTab] = useState('Overview')
  const [editing, setEditing] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState(() => ({
    category: user?.workerProfile?.category || '',
    location: user?.workerProfile?.location || '',
    dailyRate: user?.workerProfile?.dailyRate || '',
    experience: user?.workerProfile?.experience || 0,
    bio: user?.workerProfile?.bio || '',
  }))
  const [reviewingJob, setReviewingJob] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    let mounted = true
    jobsAPI.getMy()
      .then(res => mounted && setJobs(res.jobs || []))
      .catch(err => mounted && showToast(`Could not load jobs: ${err.message}`))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [showToast])

  const completedJobs = useMemo(() => jobs.filter(job => job.status === 'COMPLETED'), [jobs])
  const pendingJobs = useMemo(() => jobs.filter(job => job.status === 'PENDING'), [jobs])
  const inProgressJobs = useMemo(() => jobs.filter(job => job.status === 'IN_PROGRESS'), [jobs])
  const totalEarnings = completedJobs.reduce((sum, job) => sum + Number(job.agreedRate || 0), 0)
  const initials = user?.name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const displayProfile = { ...user?.workerProfile, ...profileForm }

  async function toggleAvailability() {
    try {
      const res = await workersAPI.toggleAvailability()
      setAvailable(res.available)
      showToast(res.message)
    } catch (err) {
      showToast(`Failed to update availability: ${err.message}`)
    }
  }

  async function updateJobStatus(jobId, status) {
    try {
      await jobsAPI.updateStatus(jobId, status)
      setJobs(current => current.map(job => job.id === jobId ? { ...job, status } : job))
      showToast('Job status updated.')
    } catch (err) {
      showToast(err.message)
    }
  }

  async function saveProfile(event) {
    event.preventDefault()
    setSavingProfile(true)
    try {
      const res = await workersAPI.updateProfile({
        ...profileForm,
        dailyRate: Number(profileForm.dailyRate),
        experience: Number(profileForm.experience),
      })
      setProfileForm(current => ({ ...current, ...res.profile }))
      setEditing(false)
      showToast('Profile updated successfully.')
    } catch (err) {
      showToast(`Could not save profile: ${err.message}`)
    } finally {
      setSavingProfile(false)
    }
  }

  async function submitReview(event) {
    event.preventDefault()
    try {
      await jobsAPI.submitReview({
        jobId: reviewingJob.id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      })
      setJobs(current => current.map(job => job.id === reviewingJob.id
        ? { ...job, review: { ...reviewForm, rating: Number(reviewForm.rating) } }
        : job))
      setReviewingJob(null)
      setReviewForm({ rating: 5, comment: '' })
      showToast('Review submitted. Thank you!')
    } catch (err) {
      showToast(`Could not submit review: ${err.message}`)
    }
  }

  function handleLogout() {
    logout()
    showToast(t('loggedOut'))
    navigate('/')
  }

  function renderJob(job) {
    const style = statusStyle[job.status] || statusStyle.PENDING
    const canReview = !isWorker && job.status === 'COMPLETED' && !job.review
    return (
      <div key={job.id} className="flex items-start justify-between bg-white/70 border border-black/5 rounded-xl px-4 py-3 flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{job.title || 'Work request'}</p>
          <p className="text-xs text-gray-500 mt-1">
            {isWorker ? `Customer: ${job.customer?.name || 'Customer'}` : `Worker: ${job.worker?.user?.name || 'Worker'}`}
            {job.agreedRate ? ` · ₹${job.agreedRate}/day` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.cls}`}>{style.label}</span>
          {isWorker && job.status === 'PENDING' && (
            <button onClick={() => updateJobStatus(job.id, 'ACCEPTED')} className="text-xs bg-green text-white px-3 py-1.5 rounded-full border-none cursor-pointer">Accept</button>
          )}
          {isWorker && job.status === 'ACCEPTED' && (
            <button onClick={() => updateJobStatus(job.id, 'IN_PROGRESS')} className="text-xs bg-orange text-white px-3 py-1.5 rounded-full border-none cursor-pointer">Start</button>
          )}
          {isWorker && job.status === 'IN_PROGRESS' && (
            <button onClick={() => updateJobStatus(job.id, 'COMPLETED')} className="text-xs bg-orange text-white px-3 py-1.5 rounded-full border-none cursor-pointer">Mark done</button>
          )}
          {canReview && (
            <button onClick={() => setReviewingJob(job)} className="text-xs btn-outline py-1.5 px-3">Review</button>
          )}
        </div>
      </div>
    )
  }

  function renderJobs(title, list = jobs) {
    return (
      <section className="bg-white/90 rounded-2xl border border-black/5 p-5 shadow-sm">
        <h2 className="font-sora font-bold text-base text-gray-900 mb-4">{title}</h2>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map(item => <div key={item} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}</div>
        ) : list.length ? (
          <div className="space-y-3">{list.map(renderJob)}</div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm text-gray-500">Nothing here yet.</p>
            {!isWorker && <button onClick={() => navigate('/workers')} className="btn-primary mt-4 text-sm">Find a worker</button>}
          </div>
        )}
      </section>
    )
  }

  function renderProfile() {
    if (!isWorker) return null
    if (!editing) {
      return (
        <section className="bg-white/90 rounded-2xl border border-black/5 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sora font-bold text-base text-gray-900">Worker profile</h2>
            <button onClick={() => setEditing(true)} className="btn-outline text-sm py-2 px-3">Edit profile</button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              [t('workCategory'), translateCategory(displayProfile.category)],
              [t('location'), displayProfile.location],
              [t('dailyRate'), `₹${displayProfile.dailyRate}/day`],
              [t('experience'), `${displayProfile.experience} years`],
            ].map(([label, value]) => <div key={label} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">{label}</p><p className="font-semibold text-gray-900">{value || 'Not set'}</p></div>)}
          </div>
          {displayProfile.bio && <p className="text-sm text-gray-600 leading-relaxed mt-4">{displayProfile.bio}</p>}
        </section>
      )
    }
    return (
      <form onSubmit={saveProfile} className="bg-white/90 rounded-2xl border border-black/5 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4"><h2 className="font-sora font-bold text-base text-gray-900">Edit worker profile</h2><button type="button" onClick={() => setEditing(false)} className="text-gray-400 border-none bg-transparent cursor-pointer">✕</button></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-gray-700">Category<input required value={profileForm.category} onChange={event => setProfileForm({ ...profileForm, category: event.target.value })} className="dashboard-input" /></label>
          <label className="text-xs font-semibold text-gray-700">Location<input required value={profileForm.location} onChange={event => setProfileForm({ ...profileForm, location: event.target.value })} className="dashboard-input" /></label>
          <label className="text-xs font-semibold text-gray-700">Daily rate<input required type="number" min="0" value={profileForm.dailyRate} onChange={event => setProfileForm({ ...profileForm, dailyRate: event.target.value })} className="dashboard-input" /></label>
          <label className="text-xs font-semibold text-gray-700">Experience<input required type="number" min="0" value={profileForm.experience} onChange={event => setProfileForm({ ...profileForm, experience: event.target.value })} className="dashboard-input" /></label>
        </div>
        <label className="block text-xs font-semibold text-gray-700 mt-3">Bio<textarea rows="3" value={profileForm.bio} onChange={event => setProfileForm({ ...profileForm, bio: event.target.value })} className="dashboard-input resize-none" /></label>
        <button disabled={savingProfile} className="btn-primary mt-4 text-sm disabled:opacity-60">{savingProfile ? 'Saving...' : 'Save profile'}</button>
      </form>
    )
  }

  return (
    <div className="page-shell flex min-h-[calc(100vh-64px)]">
      <aside className="hidden md:flex flex-col w-64 bg-white/80 border-r border-black/5 p-4 sticky top-16 h-[calc(100vh-64px)] flex-shrink-0">
        <div className="mb-5 p-4 bg-orange-50/80 rounded-2xl">
          <div className="w-11 h-11 rounded-full bg-orange-light flex items-center justify-center font-sora font-bold text-orange mb-2">{initials}</div>
          <p className="font-sora font-bold text-sm text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{isWorker ? translateCategory(displayProfile.category) : 'Customer'}</p>
          {isWorker && <button onClick={toggleAvailability} className={`mt-3 text-xs font-semibold border-none bg-transparent cursor-pointer ${available ? 'text-green' : 'text-gray-400'}`}>● {available ? 'Available for work' : 'Currently engaged'}</button>}
        </div>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-2 mb-1">Dashboard</p>
        {tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium border-none cursor-pointer text-left w-full ${activeTab === tab ? 'bg-orange-light text-orange font-semibold' : 'bg-transparent text-gray-500 hover:bg-gray-50'}`}>{tab}</button>)}
        <button onClick={handleLogout} className="mt-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-50 border-none cursor-pointer bg-transparent">↩ {t('logout')}</button>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div><p className="section-tag mb-2">{isWorker ? 'Worker workspace' : 'Customer workspace'}</p><h1 className="font-sora font-extrabold text-2xl text-gray-900">{t('welcomeBack')}, {user?.name?.split(' ')[0]} 👋</h1><p className="text-gray-500 text-sm mt-1">{isWorker ? `${pendingJobs.length} new request${pendingJobs.length === 1 ? '' : 's'} waiting for you` : 'Track your bookings and find trusted workers'}</p></div>
            <div className="flex gap-2 md:hidden">{tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 rounded-xl text-xs font-semibold border ${activeTab === tab ? 'bg-orange text-white border-orange' : 'bg-white text-gray-600 border-gray-200'}`}>{tab}</button>)}</div>
            {isWorker && <button onClick={toggleAvailability} className={`hidden md:block px-4 py-2 rounded-xl border text-sm font-semibold ${available ? 'bg-green-50 text-green border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{available ? '● Available now' : '○ Mark available'}</button>}
          </div>

          {activeTab === 'Overview' && <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {isWorker ? <><Metric label="Total earned" value={`₹${totalEarnings.toLocaleString('en-IN')}`} tone="text-orange" /><Metric label="Jobs completed" value={completedJobs.length} /><Metric label="Rating" value={user?.workerProfile?.ratingAvg ? `${user.workerProfile.ratingAvg} ⭐` : 'New'} /><Metric label="Pending requests" value={pendingJobs.length} /></> : <><Metric label="Jobs posted" value={jobs.length} /><Metric label="Completed" value={completedJobs.length} /><Metric label="In progress" value={inProgressJobs.length} /><Metric label="Pending" value={pendingJobs.length} /></>}
            </div>
            {renderJobs(isWorker ? 'Latest job requests' : 'Latest bookings', jobs.slice(0, 5))}
            {!isWorker && <div className="bg-green-50/90 border border-green-100 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"><div><h2 className="font-sora font-bold text-gray-900">Need help with a job?</h2><p className="text-sm text-gray-600 mt-1">Browse skilled workers and send a direct request.</p></div><button onClick={() => navigate('/workers')} className="btn-green text-sm">Find workers →</button></div>}
            {renderProfile()}
          </div>}
          {activeTab === 'My Jobs' && renderJobs('All job requests', jobs)}
          {activeTab === 'Earnings' && <div className="space-y-5"><div className="bg-orange-50/90 rounded-2xl p-6"><p className="text-sm text-orange-800">Your completed work has earned</p><p className="font-sora font-extrabold text-4xl text-orange mt-1">₹{totalEarnings.toLocaleString('en-IN')}</p><p className="text-sm text-orange-800 mt-2">{completedJobs.length} completed job{completedJobs.length === 1 ? '' : 's'}</p></div>{renderJobs('Completed jobs', completedJobs)}</div>}
          {activeTab === 'Reviews' && <div className="space-y-5"><div className="bg-white/90 rounded-2xl border border-black/5 p-6"><p className="text-sm text-gray-500">Your current rating</p><p className="font-sora font-extrabold text-4xl text-gray-900 mt-1">{user?.workerProfile?.ratingAvg || 'New'} {user?.workerProfile?.ratingAvg ? '⭐' : ''}</p><p className="text-sm text-gray-500 mt-2">{user?.workerProfile?.reviewCount || 0} customer reviews</p></div>{renderJobs('Jobs that can earn reviews', completedJobs)}</div>}
          {activeTab === 'Edit Profile' && renderProfile()}
          {activeTab === 'My Bookings' && renderJobs('My bookings', jobs)}
          {activeTab === 'Leave Reviews' && renderJobs('Completed bookings', completedJobs)}
        </div>
      </main>

      {reviewingJob && <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={() => setReviewingJob(null)}><form onSubmit={submitReview} onClick={event => event.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md"><h2 className="font-sora font-bold text-lg text-gray-900">Review {reviewingJob.worker?.user?.name || 'worker'}</h2><label className="block text-sm font-semibold text-gray-700 mt-5">Rating<select value={reviewForm.rating} onChange={event => setReviewForm({ ...reviewForm, rating: event.target.value })} className="dashboard-input"><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Average</option><option value="2">2 - Poor</option><option value="1">1 - Bad</option></select></label><label className="block text-sm font-semibold text-gray-700 mt-3">Comment<textarea value={reviewForm.comment} onChange={event => setReviewForm({ ...reviewForm, comment: event.target.value })} rows="3" className="dashboard-input" /></label><div className="flex gap-3 mt-5"><button type="button" onClick={() => setReviewingJob(null)} className="btn-outline flex-1">Cancel</button><button className="btn-primary flex-1">Submit review</button></div></form></div>}
    </div>
  )
}
