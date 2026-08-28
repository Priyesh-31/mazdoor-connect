// src/pages/Dashboard.jsx — real data from backend
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }  from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { jobsAPI, workersAPI } from '../api/client.js'
import { useLanguage } from '../context/LanguageContext.jsx'

const statusStyle = {
  PENDING:     { cls: 'bg-blue-50 text-blue-700',    label: 'New Request'  },
  ACCEPTED:    { cls: 'bg-green-light text-green-700',label: 'Accepted'     },
  IN_PROGRESS: { cls: 'bg-orange-light text-orange',  label: 'In Progress'  },
  COMPLETED:   { cls: 'bg-gray-100 text-gray-500',    label: 'Completed'    },
  CANCELLED:   { cls: 'bg-red-50 text-red-500',       label: 'Cancelled'    },
}

const sidebarItems = [
  { icon: '▦',  label: 'Overview'    },
  { icon: '💼', label: 'My Jobs'     },
  { icon: '₹',  label: 'Earnings'    },
  { icon: '⭐', label: 'Reviews'     },
  { icon: '👤', label: 'Edit Profile'},
]

export default function Dashboard() {
  const { user, logout }  = useAuth()
  const { showToast }     = useToast()
  const { t, translateCategory } = useLanguage()
  const navigate          = useNavigate()

  const [jobs,      setJobs]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [available, setAvailable] = useState(user?.workerProfile?.available ?? true)
  const [activeTab, setActiveTab] = useState('Overview')

  const isWorker = String(user?.role || '').toUpperCase() === 'WORKER'

  // Load jobs on mount
  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await jobsAPI.getMy()
        setJobs(res.jobs)
      } catch (err) {
        showToast('Could not load jobs: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [])

  async function handleToggleAvailability() {
    try {
      const res = await workersAPI.toggleAvailability()
      setAvailable(res.available)
      showToast(res.message)
    } catch (err) {
      showToast('Failed to update: ' + err.message)
    }
  }

  async function handleUpdateJobStatus(jobId, status) {
    try {
      await jobsAPI.updateStatus(jobId, status)
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j))
      showToast('Job status updated!')
    } catch (err) {
      showToast(err.message)
    }
  }

  function handleLogout() {
    logout()
    showToast(t('loggedOut'))
    navigate('/')
  }

  // Stats computed from jobs
  const completedJobs  = jobs.filter(j => j.status === 'COMPLETED')
  const totalEarnings  = completedJobs.reduce((sum, j) => sum + (j.agreedRate || 0), 0)
  const pendingJobs    = jobs.filter(j => j.status === 'PENDING').length

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 p-4 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto flex-shrink-0">
        <div className="mb-5 p-3 bg-gray-50 rounded-xl">
          <div className="w-11 h-11 rounded-full bg-orange-light flex items-center justify-center font-sora font-bold text-orange mb-2 text-sm">
            {initials}
          </div>
          <p className="font-sora font-bold text-sm text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.workerProfile?.category ? translateCategory(user.workerProfile.category) : 'Customer'} · {user?.workerProfile?.location || ''}</p>
          {isWorker && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`w-2 h-2 rounded-full ${available ? 'bg-green' : 'bg-gray-400'}`} />
              <span className={`text-xs font-semibold ${available ? 'text-green' : 'text-gray-400'}`}>
                {available ? t('available') : t('engaged')}
              </span>
            </div>
          )}
        </div>

        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-2 mb-1">Menu</p>
        {sidebarItems.map(item => (
          <button key={item.label} onClick={() => setActiveTab(item.label)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-colors border-none cursor-pointer text-left w-full
              ${activeTab === item.label ? 'bg-orange-light text-orange font-semibold' : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}

        <div className="mt-auto pt-4 border-t border-gray-100">
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors border-none cursor-pointer bg-transparent w-full">
            ↩ {t('logout')}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        {/* Header row */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="font-sora font-extrabold text-xl text-gray-900">
              {t('welcomeBack')}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 text-sm">
              {pendingJobs > 0 ? `You have ${pendingJobs} new job request${pendingJobs > 1 ? 's' : ''}` : 'No new requests right now'}
            </p>
          </div>
          {isWorker && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{t('available')}</span>
              <button onClick={handleToggleAvailability}
                className={`w-11 h-6 rounded-full relative transition-colors border-none cursor-pointer
                  ${available ? 'bg-green' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all
                  ${available ? 'left-[22px]' : 'left-[3px]'}`} />
              </button>
              <span className={`text-sm font-semibold ${available ? 'text-green' : 'text-gray-400'}`}>
                {available ? t('availableNow') : t('engaged')}
              </span>
            </div>
          )}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {(isWorker ? [
            { label: t('totalEarned') || 'Total Earned',   value: `₹${totalEarnings.toLocaleString('en-IN')}` },
            { label: t('jobsCompleted') || 'Jobs Completed', value: completedJobs.length },
            { label: t('rating') || 'Rating',         value: user?.workerProfile?.ratingAvg ? `${user.workerProfile.ratingAvg} ⭐` : 'No ratings yet' },
            { label: t('pendingRequests') || 'Pending Requests', value: pendingJobs },
          ] : [
            { label: 'Jobs Posted',    value: jobs.length },
            { label: 'Completed',      value: completedJobs.length },
            { label: 'In Progress',    value: jobs.filter(j => j.status === 'IN_PROGRESS').length },
            { label: 'Pending',        value: pendingJobs },
          ]).map(m => (
            <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">{m.label}</p>
              <p className="font-sora font-extrabold text-2xl text-gray-900">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Jobs list */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <h2 className="font-sora font-bold text-base text-gray-900 mb-4">
            {isWorker ? t('jobRequests') : 'My Bookings'}
          </h2>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse flex justify-between bg-gray-50 rounded-xl p-4">
                  <div><div className="h-3 bg-gray-200 rounded w-48 mb-2"/><div className="h-2.5 bg-gray-100 rounded w-32"/></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"/>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500 text-sm">No jobs yet.</p>
              {!isWorker && (
                <button onClick={() => navigate('/workers')} className="btn-primary mt-4 text-sm">
                  {t('findAWorker')}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {jobs.map(job => (
                <div key={job.id} className="flex items-start justify-between bg-gray-50 rounded-xl px-4 py-3 flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isWorker
                        ? `From: ${job.customer?.name}`
                        : `Worker: ${job.worker?.user?.name}`}
                      {job.agreedRate && ` · ₹${job.agreedRate}/day`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyle[job.status]?.cls}`}>
                      {statusStyle[job.status]?.label}
                    </span>
                    {/* Worker can update status */}
                    {isWorker && job.status === 'PENDING' && (
                      <button onClick={() => handleUpdateJobStatus(job.id, 'ACCEPTED')}
                        className="text-xs bg-green text-white px-3 py-1 rounded-full border-none cursor-pointer hover:bg-green-700">
                        Accept
                      </button>
                    )}
                    {isWorker && job.status === 'ACCEPTED' && (
                      <button onClick={() => handleUpdateJobStatus(job.id, 'COMPLETED')}
                        className="text-xs bg-orange text-white px-3 py-1 rounded-full border-none cursor-pointer hover:bg-orange-dark">
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Worker profile quick-edit */}
        {isWorker && user?.workerProfile && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-sora font-bold text-base text-gray-900 mb-4">{t('profile')}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                [t('workCategory'),   translateCategory(user.workerProfile.category)],
                [t('location'),   user.workerProfile.location],
                [t('dailyRate'), `₹${user.workerProfile.dailyRate}/day`],
                [t('experience'), `${user.workerProfile.experience} years`],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{k}</p>
                  <p className="font-semibold text-gray-900">{v}</p>
                </div>
              ))}
            </div>
            <button onClick={() => showToast('Profile editing coming soon!')}
              className="btn-outline mt-4 text-sm">
              {t('profileUpdatedSoon')}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
