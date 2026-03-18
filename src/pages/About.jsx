// src/pages/About.jsx
import { Link } from 'react-router-dom'

const team = [
  { initials:'PR', name:'Priyesh Raj',   role:'Founder & CEO',     bg:'#FFF0E8', tc:'#8A3208' },
  { initials:'SP', name:'Shashwat Pandey',   role:'Marketing',  bg:'#E1F5EE', tc:'#0A5940' },
  // { initials:'RV', name:'Rahul Verma',   role:'Tech Lead',         bg:'#E6F1FB', tc:'#0C447C' },
]

const stats = [
  { val:'2,400+', label:'Workers Registered', bg:'#FFF0E8', tc:'#8A3208' },
  { val:'850+',   label:'Jobs Completed',      bg:'#E1F5EE', tc:'#0A5940' },
  { val:'120+',   label:'Cities & Villages',   bg:'#E6F1FB', tc:'#0C447C' },
  { val:'0%',     label:'Middleman Cut',        bg:'#EAF3DE', tc:'#27500A' },
]

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link to="/" className="btn-outline text-sm inline-block mb-6">← Back to Home</Link>

      {/* Header */}
      <div className="mb-8">
        <div className="section-tag">Our Story</div>
        <h1 className="font-sora font-extrabold text-3xl text-gray-900 mb-3">About MazdoorConnect</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          We are on a mission to eliminate exploitation in India's informal labor market —
          giving every worker fair wages, dignity, and direct access to employment.
        </p>
      </div>

      {/* Problem */}
      <div className="card mb-5">
        <h2 className="font-sora font-bold text-base text-gray-900 mb-3">🎯 The Problem We Are Solving</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Every day, millions of skilled workers in villages and small towns travel to city mandis hoping
          to find work. They wait for hours, sometimes return empty-handed. When they do find work,
          <strong> thekedars (middlemen)</strong> take 20–40% of their earnings — leaving workers with
          far less than they deserve.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Customers have no easy way to find trusted, skilled workers. They rely on the same middlemen,
          overpay, and have no way to verify quality.
        </p>
      </div>

      {/* Solution */}
      <div className="card mb-5">
        <h2 className="font-sora font-bold text-base text-gray-900 mb-3">💡 Our Solution</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          MazdoorConnect is a direct-connection platform that removes middlemen entirely. Workers create
          verified profiles, set their own rates, and get discovered by customers. Payment goes directly
          — no cuts, no exploitation.
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1.5">
          <li>Workers earn 100% of what customers pay</li>
          <li>Customers find verified, rated workers in minutes</li>
          <li>OTP-verified profiles ensure trust and safety</li>
          <li>Ratings and reviews build long-term reputation</li>
        </ul>
      </div>

      {/* Impact stats */}
      <div className="card mb-5">
        <h2 className="font-sora font-bold text-base text-gray-900 mb-4">🌍 Our Impact</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: s.bg }}>
              <div className="font-sora font-extrabold text-xl" style={{ color: s.tc }}>{s.val}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: s.tc }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="card mb-5">
        <h2 className="font-sora font-bold text-base text-gray-900 mb-2">👥 Our Team</h2>
        <p className="text-sm text-gray-500 mb-4">
          A small team of passionate engineers and social workers from Uttar Pradesh who have seen
          firsthand how the mandi system fails workers.
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
        <h2 className="font-sora font-bold text-base text-gray-900 mb-3">📞 Contact Us</h2>
        <div className="flex flex-col gap-2 mb-5">
          <p className="text-sm text-gray-700">📧 <strong>hello@mazdoorconnect.in</strong></p>
          <p className="text-sm text-gray-700">📱 <strong>+91 95236 72637</strong></p>
          <p className="text-sm text-gray-700">📍 <strong>Lucknow, Uttar Pradesh, India</strong></p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/register" className="btn-primary">Join the Platform</Link>
          <Link to="/workers"  className="btn-outline">Find Workers</Link>
        </div>
      </div>
    </div>
  )
}
