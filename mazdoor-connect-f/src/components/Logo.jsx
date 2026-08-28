import { Link } from 'react-router-dom'

export default function Logo({ compact = false, className = '', to = '/' }) {
  return (
    <Link to={to} className={`flex items-center gap-2.5 no-underline ${className}`.trim()}>
      <div className={`bg-orange rounded-xl flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-9 h-9'}`}>
        <svg className={`${compact ? 'w-4.5 h-4.5' : 'w-5 h-5'} fill-white`} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13 2L4 14h6l-1 8 11-14h-6l-1-6z" />
        </svg>
      </div>
      <span className={`font-sora font-bold ${compact ? 'text-base' : 'text-lg'} text-gray-900`}>
        Mazdoor<span className="text-orange">Connect</span>
      </span>
    </Link>
  )
}
