// ─────────────────────────────────────────────
//  Workers.jsx — Browse / search workers page
//  Reads activeCategory from context (set when
//  user clicks a category on the Home page).
//  Local state handles search + other filters.
// ─────────────────────────────────────────────
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { workers, CATEGORIES } from '../data/workers'
import WorkerCard from '../components/WorkerCard'

export default function Workers() {
  const { activeCategory, setActiveCategory } = useApp()
  const [search,    setSearch]    = useState('')
  const [avail,     setAvail]     = useState('')
  const [rateRange, setRateRange] = useState('')

  // ── filter logic ─────────────────────────
  const filtered = workers.filter(w => {
    if (activeCategory && w.category !== activeCategory)   return false
    if (search && !w.name.toLowerCase().includes(search.toLowerCase()) &&
                  !w.category.toLowerCase().includes(search.toLowerCase())) return false
    if (avail === 'available' && !w.available)  return false
    if (avail === 'engaged'   &&  w.available)  return false
    if (rateRange === 'low'  && w.rate >= 400)  return false
    if (rateRange === 'mid'  && (w.rate < 400 || w.rate > 600)) return false
    if (rateRange === 'high' && w.rate <= 600)  return false
    return true
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* ── Header ─────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="font-sora text-2xl font-extrabold text-gray-900">Find Skilled Workers</h2>
          <p className="text-gray-500 text-sm mt-1">Direct contact. No middlemen. Fair rates.</p>
        </div>
        {activeCategory && (
          <div className="flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-200 px-4 py-1.5 rounded-full text-sm font-semibold">
            Showing: {activeCategory}
            <button onClick={() => setActiveCategory('')} className="ml-1 hover:text-orange-800">✕</button>
          </div>
        )}
      </div>

      {/* ── Category pill tabs ───────────────── */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setActiveCategory('')}
          className={`px-4 py-1.5 rounded-full border text-xs font-bold font-sora transition-colors ${
            activeCategory === '' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-black/15 hover:border-orange-400 hover:text-orange-500'
          }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(activeCategory === cat.label ? '' : cat.label)}
            className={`px-4 py-1.5 rounded-full border text-xs font-bold font-sora transition-colors ${
              activeCategory === cat.label ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-black/15 hover:border-orange-400 hover:text-orange-500'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* ── Search + filter bar ──────────────── */}
      <div className="flex gap-3 flex-wrap bg-white p-4 rounded-2xl border border-black/10 shadow-sm mb-7">
        <input
          type="text"
          placeholder="🔍 Search by name or skill..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-36 px-4 py-2.5 rounded-lg border border-black/10 bg-gray-50 text-sm text-gray-900 outline-none focus:border-orange-500"
        />
        <select value={avail} onChange={e => setAvail(e.target.value)}
          className="flex-1 min-w-36 px-4 py-2.5 rounded-lg border border-black/10 bg-gray-50 text-sm text-gray-900 outline-none focus:border-orange-500">
          <option value="">Any Availability</option>
          <option value="available">Available Now</option>
          <option value="engaged">Engaged</option>
        </select>
        <select value={rateRange} onChange={e => setRateRange(e.target.value)}
          className="flex-1 min-w-36 px-4 py-2.5 rounded-lg border border-black/10 bg-gray-50 text-sm text-gray-900 outline-none focus:border-orange-500">
          <option value="">Any Rate</option>
          <option value="low">Under ₹400/day</option>
          <option value="mid">₹400–600/day</option>
          <option value="high">Above ₹600/day</option>
        </select>
        <button
          onClick={() => { setSearch(''); setAvail(''); setRateRange(''); setActiveCategory('') }}
          className="px-5 py-2.5 border border-black/15 rounded-lg text-sm font-semibold font-sora hover:border-orange-500 hover:text-orange-500 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* ── Worker grid ─────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-sora font-bold text-gray-900 text-lg mb-2">No workers found</h3>
          <p className="text-gray-500 text-sm mb-5">Try a different category or clear your filters</p>
          <button onClick={() => { setSearch(''); setAvail(''); setRateRange(''); setActiveCategory('') }}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-sora font-semibold hover:bg-orange-600 transition-colors">
            Show All Workers
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(w => <WorkerCard key={w.id} worker={w} />)}
        </div>
      )}
    </div>
  )
}
