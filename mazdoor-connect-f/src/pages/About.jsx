// src/pages/About.jsx
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Logo from '../components/Logo.jsx'

const team = [
  { initials:'PR', name:'Priyesh Raj',      role:'Founder & CEO',   bg:'#FFF0E8', tc:'#8A3208' },
  { initials:'SP', name:'Shashwat Pandey',  role:'Marketing Head',  bg:'#E1F5EE', tc:'#0A5940' },
]

const stats = [
  { val:'2,400+', label:'aboutImpactWorkers', bg:'#FFF0E8', tc:'#8A3208' },
  { val:'850+',   label:'aboutImpactJobs',    bg:'#E1F5EE', tc:'#0A5940' },
  { val:'120+',   label:'aboutImpactCities',  bg:'#E6F1FB', tc:'#0C447C' },
  { val:'0%',     label:'aboutImpactCut',     bg:'#EAF3DE', tc:'#27500A' },
]

export default function About() {
  const { t } = useLanguage()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <Logo />
        <Link to="/" className="btn-outline text-sm inline-block">← {t('home')}</Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="section-tag">{t('whyMazdoorConnect')}</div>
        <h1 className="font-sora font-extrabold text-3xl text-gray-900 mb-3">MazdoorConnect</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          {t('empowerText')}
        </p>
      </div>

      {/* Problem */}
      <div className="card mb-5">
        <h2 className="font-sora font-bold text-base text-gray-900 mb-3">🎯 {t('empowerTitle')}</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {t('aboutProblemDesc1')}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          {t('aboutProblemDesc2')}
        </p>
      </div>

      {/* Solution */}
      <div className="card mb-5">
        <h2 className="font-sora font-bold text-base text-gray-900 mb-3">💡 {t('searchConnectTitle')}</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {t('aboutSolutionDesc')}
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1.5">
          <li>{t('aboutSolutionPoint1')}</li>
          <li>{t('aboutSolutionPoint2')}</li>
          <li>{t('aboutSolutionPoint3')}</li>
          <li>{t('aboutSolutionPoint4')}</li>
        </ul>
      </div>

      {/* Impact stats */}
      <div className="card mb-5">
        <h2 className="font-sora font-bold text-base text-gray-900 mb-4">🌍 {t('aboutImpact')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: s.bg }}>
              <div className="font-sora font-extrabold text-xl" style={{ color: s.tc }}>{s.val}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: s.tc }}>{t(s.label)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="card mb-5">
        <h2 className="font-sora font-bold text-base text-gray-900 mb-2">👥 {t('about')}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {t('aboutTeamIntro')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {team.map(m => (
            <div key={m.name} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center
                              font-sora font-bold text-sm"
                   style={{ backgroundColor: m.bg, color: m.tc }}>
                {m.initials}
              </div>
              <p className="font-sora font-bold text-xs text-gray-900">{m.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="card">
        <h2 className="font-sora font-bold text-base text-gray-900 mb-3">📞 {t('contact')}</h2>
        <div className="flex flex-col gap-2 mb-5">
          <a href={`mailto:${t('aboutContactEmail')}`} className="text-sm text-gray-700 hover:text-orange no-underline">📧 <strong>{t('aboutContactEmail')}</strong></a>
          <a href={`tel:+91${t('aboutContactPhone')}`} className="text-sm text-gray-700 hover:text-orange no-underline">📱 <strong>+91 {t('aboutContactPhone')}</strong></a>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/register" className="btn-primary">{t('joinFree')}</Link>
          <Link to="/workers"  className="btn-outline">{t('findWorkers')}</Link>
        </div>
      </div>
    </div>
  )
}
