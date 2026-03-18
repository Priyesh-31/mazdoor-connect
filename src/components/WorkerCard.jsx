// ─────────────────────────────────────────────
//  WorkerCard.jsx
//  Reusable card for a single worker.
//  Used in the Workers page grid — just pass
//  the worker object as a prop.
//  Props: { worker }
// ─────────────────────────────────────────────
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1 mb-3">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-sm ${i <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating} ({/* reviews shown in parent */})</span>
    </div>
  )
}

export default function WorkerCard({ worker }) {
  const navigate   = useNavigate()
  const { showToast } = useApp()

  return (
    <div
      className="bg-white rounded-2xl p-5 border border-black/10 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-300 transition-all duration-250 relative"
      onClick={() => navigate(`/workers/${worker.id}`)}
    >
      {/* Availability badge — top right */}
      <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-bold font-sora ${
        worker.available ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-800'
      }`}>
        {worker.available ? '✅ Available' : '🔴 Engaged'}
      </span>

      {/* Avatar + name */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-13 h-13 rounded-full flex items-center justify-center font-sora font-bold text-lg flex-shrink-0 w-12 h-12"
          style={{ backgroundColor: worker.avatarBg, color: worker.avatarColor }}
        >
          {worker.initials}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{worker.name}</h3>
          <p className="text-xs text-gray-500 font-medium">{worker.category}</p>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex gap-3 flex-wrap mb-3">
        <span className="text-xs text-gray-500 font-medium">📍 {worker.location}</span>
        <span className="text-xs text-gray-500 font-medium">🏆 {worker.experience} yrs exp</span>
      </div>

      {/* Rate */}
      <p className="font-sora font-extrabold text-orange-500 text-lg mb-3">
        ₹{worker.rate}<span className="text-xs font-normal text-gray-500">/day (negotiable)</span>
      </p>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-4">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={`text-sm ${i <= Math.floor(worker.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
        ))}
        <span className="text-xs text-gray-500 ml-1">{worker.rating} ({worker.reviews})</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold font-sora hover:bg-orange-600 transition-colors"
          onClick={e => { e.stopPropagation(); showToast(`Contacting ${worker.name}...`) }}
        >
          Contact
        </button>
        <button
          className="flex-1 py-2 border border-black/15 rounded-lg text-xs font-semibold font-sora hover:border-orange-500 hover:text-orange-500 transition-colors"
          onClick={e => { e.stopPropagation(); navigate(`/workers/${worker.id}`) }}
        >
          Profile
        </button>
      </div>
    </div>
  )
}
