// src/pages/Dashboard.jsx
import { useState } from 'react'
import { useToast } from '../context/ToastContext'

const sidebarLinks = [
  { icon: '▦',  label: 'Overview',    active: true  },
  { icon: '💼', label: 'My Jobs',     active: false },
  { icon: '₹',  label: 'Earnings',    active: false },
  { icon: '⭐', label: 'Reviews',     active: false },
  { icon: '👤', label: 'Edit Profile',active: false },
]

const jobs = [
  { title:'Wiring repair — 2BHK flat',    loc:'Gomti Nagar, Lucknow · Today 10am', status:'new'      },
  { title:'Meter installation',            loc:'Alambagh, Lucknow · Yesterday',      status:'progress' },
  { title:'Fan & light fitting — 3 rooms', loc:'Aliganj, Lucknow · Mar 14',          status:'done', amount:'₹800' },
  { title:'Short circuit fix — shop',      loc:'Hazratganj, Lucknow · Mar 12',        status:'done', amount:'₹600' },
]

const reviews = [
  { name:'Priya Sharma', stars:5, text:'"Very professional and quick work. Came on time and charged exactly what was agreed. Highly recommend!"' },
  { name:'Vikram Singh',  stars:4, text:'"Good work but arrived 30 mins late. Otherwise very skilled and honest pricing."' },
]

const statusStyle = {
  new:      'bg-green-light text-green-700',
  progress: 'bg-orange-light text-orange-dark',
  done:     'bg-gray-100 text-gray-500',
}

export default function Dashboard() {
  const { showToast } = useToast()
  const [available, setAvailable] = useState(true)

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 p-4 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto flex-shrink-0">
        <div className="mb-5">
          <div className="w-11 h-11 rounded-full bg-orange-light flex items-center justify-center font-sora font-bold text-orange mb-2 text-sm">RK</div>
          <p className="font-sora font-bold text-sm text-gray-900">Ramesh Kumar</p>
          <p className="text-xs text-gray-500">Electrician · Lucknow</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-green" />
            <span className="text-xs font-semibold text-green">Available</span>
          </div>
        </div>

        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-2 mb-1">Main</p>
        {sidebarLinks.map(link => (
          <button key={link.label}
            onClick={() => link.label !== 'Overview' && showToast(link.label + ' — coming soon!')}
            className={'flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-colors border-none cursor-pointer text-left w-full ' +
              (link.active ? 'bg-orange-light text-orange font-semibold' : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900')}>
            <span className="text-base">{link.icon}</span>{link.label}
          </button>
        ))}

        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-2 mb-1 mt-4">Account</p>
        <button onClick={() => showToast('Logged out!')}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors border-none cursor-pointer bg-transparent text-left w-full">
          <span>↩</span> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="font-sora font-extrabold text-xl text-gray-900">Good morning, Ramesh 👋</h1>
            <p className="text-gray-500 text-sm">You have 3 new job requests today</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Availability:</span>
            <button onClick={() => setAvailable(!available)}
              className={'w-11 h-6 rounded-full relative transition-colors border-none cursor-pointer ' + (available ? 'bg-green' : 'bg-gray-300')}>
              <span className={'absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all ' + (available ? 'left-[22px]' : 'left-[3px]')} />
            </button>
            <span className={'text-sm font-semibold ' + (available ? 'text-green' : 'text-gray-400')}>
              {available ? 'Open to Work' : 'Engaged / Busy'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Earnings', value:'₹18,400', change:'↑ 12% this month' },
            { label:'Jobs Done',      value:'34',       change:'↑ 5 this week'   },
            { label:'Rating',         value:'4.8 ⭐',   change:'28 reviews'      },
            { label:'Profile Views',  value:'142',      change:'↑ this week'     },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">{m.label}</p>
              <p className="font-sora font-extrabold text-2xl text-gray-900">{m.value}</p>
              <p className="text-xs text-green font-semibold mt-0.5">{m.change}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <h2 className="font-sora font-bold text-base text-gray-900 mb-4">Active &amp; Recent Jobs</h2>
          <div className="flex flex-col gap-3">
            {jobs.map((job, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.loc}</p>
                </div>
                <span className={'text-xs font-bold px-3 py-1 rounded-full ' + statusStyle[job.status]}>
                  {job.status === 'new' && 'New Request'}
                  {job.status === 'progress' && 'In Progress'}
                  {job.status === 'done' && 'Completed · ' + job.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-sora font-bold text-base text-gray-900 mb-4">Recent Reviews</h2>
          <div className="flex flex-col gap-3">
            {reviews.map((r, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-sm text-gray-900">{r.name}</span>
                  <span className="text-amber-400 text-sm">{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
