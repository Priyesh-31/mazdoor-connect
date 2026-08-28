// src/pages/Workers.jsx — fetches real workers from backend API
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { workersAPI } from '../api/client.js'
import { categories } from '../data/workers.js'
import WorkerCard    from '../components/WorkerCard.jsx'
import ContactModal  from '../components/ContactModal.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Workers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, translateCategory } = useLanguage()

  const [workers,       setWorkers]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [contactWorker, setContactWorker] = useState(null)
  const [pagination,    setPagination]    = useState({})

  const [search,       setSearch]       = useState('')
  const [availability, setAvailability] = useState('')
  const [rateFilter,   setRateFilter]   = useState('')

  const activeCategory = searchParams.get('category') || ''

  const fetchWorkers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const filters = {
        ...(activeCategory  && { category:  activeCategory }),
        ...(search          && { search }),
        ...(availability === 'available' && { available: true }),
        ...(availability === 'engaged'   && { available: false }),
        ...(rateFilter === 'low'  && { maxRate: 399 }),
        ...(rateFilter === 'mid'  && { minRate: 400, maxRate: 600 }),
        ...(rateFilter === 'high' && { minRate: 601 }),
      }
      const res = await workersAPI.getAll(filters)
      setWorkers(res.workers)
      setPagination(res.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, search, availability, rateFilter])

  useEffect(() => {
    // Debounce: wait 400ms after typing stops before fetching
    const timer = setTimeout(fetchWorkers, 400)
    return () => clearTimeout(timer)
  }, [fetchWorkers])

  function setCategory(cat) {
    cat ? setSearchParams({ category: cat }) : setSearchParams({})
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-gray-900">{t('findAnySkilledWorker')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('directContact') || 'Direct contact. No middlemen. Fair rates.'}</p>
        </div>
        {activeCategory && (
          <div className="bg-orange-light text-orange text-sm font-semibold px-4 py-1.5
                          rounded-full border border-orange/20 flex items-center gap-2">
            {translateCategory(activeCategory)}
            <button onClick={() => setCategory('')}
              className="bg-transparent border-none cursor-pointer text-orange/60 hover:text-orange text-xs">✕</button>
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button onClick={() => setCategory('')}
          className={`px-4 py-1.5 rounded-full border text-xs font-sora font-semibold transition-all
            ${!activeCategory ? 'bg-orange text-white border-orange' : 'bg-white text-gray-500 border-gray-200 hover:border-orange hover:text-orange'}`}>
          {t('all')}
        </button>
        {categories.map(cat => (
          <button key={cat.name} onClick={() => setCategory(cat.name)}
            className={`px-4 py-1.5 rounded-full border text-xs font-sora font-semibold transition-all
              ${activeCategory === cat.name ? 'bg-orange text-white border-orange' : 'bg-white text-gray-500 border-gray-200 hover:border-orange hover:text-orange'}`}>
            {cat.emoji} {translateCategory(cat.name)}
          </button>
        ))}
      </div>

      {/* Search & filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 flex-wrap shadow-sm mb-6">
        <input type="text" placeholder={`🔍 ${t('searchPlaceholder')}`}
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-36 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-orange" />
        <select value={availability} onChange={e => setAvailability(e.target.value)}
          className="flex-1 min-w-36 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-orange">
          <option value="">{t('anyAvailability')}</option>
          <option value="available">{t('availableNow')}</option>
          <option value="engaged">{t('engaged')}</option>
        </select>
        <select value={rateFilter} onChange={e => setRateFilter(e.target.value)}
          className="flex-1 min-w-36 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-orange">
          <option value="">{t('anyRate')}</option>
          <option value="low">{t('under400')}</option>
          <option value="mid">{t('midRate')}</option>
          <option value="high">{t('above600')}</option>
        </select>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-2.5 bg-gray-100 rounded mb-2" />
              <div className="h-2.5 bg-gray-100 rounded w-2/3 mb-4" />
              <div className="h-8 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchWorkers} className="btn-primary">Try Again</button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          <p className="text-sm text-gray-400 mb-4">
            {pagination.total ?? workers.length} {t('workersFound')}
          </p>
          {workers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {workers.map(worker => (
                <WorkerCard key={worker.id} worker={worker} onContact={setContactWorker} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-sora font-bold text-gray-900 mb-2">{t('noWorkersFound')}</h3>
              <p className="text-gray-500 text-sm mb-6">{t('tryDifferent')}</p>
              <button onClick={() => { setCategory(''); setSearch(''); setAvailability(''); setRateFilter('') }}
                className="btn-primary">{t('showAllWorkers')}</button>
            </div>
          )}
        </>
      )}

      <ContactModal worker={contactWorker} onClose={() => setContactWorker(null)} />
    </div>
  )
}
