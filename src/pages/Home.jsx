// ─────────────────────────────────────────────
//  Home.jsx — Landing page
//  Uses useNavigate + setActiveCategory so that
//  clicking a category card goes straight to the
//  Workers page pre-filtered.
// ─────────────────────────────────────────────
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CategoryGrid from '../components/CategoryGrid'

// ── small reusable stat card ──────────────────
function StatItem({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-sora text-3xl font-extrabold text-orange-500">{value}</div>
      <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
    </div>
  )
}

// ── step card ────────────────────────────────
function StepCard({ num, icon, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-7 border border-black/10 relative overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
      <span className="absolute top-4 right-5 font-sora text-5xl font-extrabold text-orange-500/8">{num}</span>
      <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl mb-4">{icon}</div>
      <h3 className="font-sora font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

// ── why-us row item ──────────────────────────
function WhyItem({ icon, bg, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0`} style={{ background: bg }}>{icon}</div>
      <div>
        <h3 className="font-sora font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { setActiveCategory } = useApp()

  // Animate counters once on mount
  const countersRef = useRef(false)
  useEffect(() => {
    if (countersRef.current) return
    countersRef.current = true
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target)
      let current  = 0
      const step   = Math.ceil(target / 60)
      const iv = setInterval(() => {
        current = Math.min(current + step, target)
        el.textContent = current.toLocaleString('en-IN') + (el.dataset.suffix || '')
        if (current >= target) clearInterval(iv)
      }, 25)
    })
  }, [])

  function handleCategorySelect(cat) {
    setActiveCategory(cat)
    navigate('/workers')
  }

  return (
    <main>
      {/* ── HERO ─────────────────────────────── */}
      <section className="hero-gradient px-6 py-20 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-500 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-200 mb-6">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse-dot"></span>
            No Middlemen. No Exploitation.
          </div>

          <h1 className="font-sora text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-5">
            Connect Directly with<br/>
            <span className="text-orange-500">Skilled Workers</span> &amp; Get<br/>
            <span className="text-green-500">Fair Wages</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-10 leading-relaxed">
            MazdoorConnect bridges the gap between rural workers and urban customers — eliminating thekedars and ensuring transparent, fair pay for everyone.
          </p>

          <div className="flex gap-3 justify-center flex-wrap mb-12">
            <button onClick={() => navigate('/workers')} className="px-8 py-4 bg-orange-500 text-white rounded-xl font-sora font-semibold text-base hover:bg-orange-600 transition-colors">
              🔍 Find a Worker
            </button>
            <button onClick={() => navigate('/register')} className="px-8 py-4 bg-green-500 text-white rounded-xl font-sora font-semibold text-base hover:bg-green-600 transition-colors">
              💼 Register as Worker
            </button>
          </div>

          <div className="flex gap-8 justify-center flex-wrap pt-8 border-t border-black/10">
            <StatItem value={<span data-target="2400">0</span>} label="Registered Workers" />
            <StatItem value={<span data-target="850">0</span>}  label="Jobs Completed" />
            <StatItem value={<span data-target="120">0</span>}  label="Cities & Villages" />
            <StatItem value="0%" label="Middleman Cut" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-block bg-orange-50 text-orange-500 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded mb-3">How It Works</span>
          <h2 className="font-sora text-3xl font-bold text-gray-900 mb-2">Simple. Transparent. Fair.</h2>
          <p className="text-gray-500">From village to city — find work or workers in 4 easy steps</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StepCard num="01" icon="📱" title="Register Your Profile"   desc="Workers create a profile with skills, location, and their own fair rate." />
          <StepCard num="02" icon="🔍" title="Search & Connect"        desc="Customers browse verified workers by category, location, and rate." />
          <StepCard num="03" icon="✅" title="Work & Get Paid"         desc="Complete the job, receive payment directly via UPI or cash." />
          <StepCard num="04" icon="⭐" title="Build Your Reputation"   desc="Positive reviews grow your profile and bring more opportunities." />
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────── */}
      <section className="bg-[#F2F1EC] px-6 py-16">
        <div className="text-center mb-10">
          <span className="inline-block bg-orange-50 text-orange-500 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded mb-3">Work Categories</span>
          <h2 className="font-sora text-3xl font-bold text-gray-900 mb-2">Find Any Skilled Worker</h2>
          <p className="text-gray-500">From home construction to daily labor — all categories in one place</p>
        </div>
        <CategoryGrid onSelect={handleCategorySelect} activeCategory="" />
        <div className="text-center mt-8">
          <button onClick={() => { setActiveCategory(''); navigate('/workers') }} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-sora font-semibold hover:bg-orange-600 transition-colors">
            Browse All Workers →
          </button>
        </div>
      </section>

      {/* ── WHY US ───────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-block bg-orange-50 text-orange-500 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded mb-3">Why MazdoorConnect</span>
          <h2 className="font-sora text-3xl font-bold text-gray-900 mb-2">End Exploitation — Start Empowerment</h2>
          <p className="text-gray-500">Built for India's informal labor market, by people who understand it</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <WhyItem icon="🚫" bg="#FFF0E8" title="No Thekedars (Middlemen)"   desc="Workers keep 100% of what customers pay. Zero deductions. Direct payments only." />
          <WhyItem icon="💰" bg="#E1F5EE" title="Fair Wages Guaranteed"       desc="Workers set their own negotiable rates. No village-city wage gap anymore." />
          <WhyItem icon="📍" bg="#FFF0E8" title="Skip the Mandi Queue"        desc="Workers get pre-booked jobs. Customers find workers online — no mandi visits." />
          <WhyItem icon="⭐" bg="#E6F1FB" title="Verified Ratings"            desc="Real reviews from real customers build trust and grow your reputation." />
          <WhyItem icon="📱" bg="#EAF3DE" title="Mobile-First Platform"       desc="Designed for smartphone users in rural areas. Works on any connection." />
          <WhyItem icon="🔒" bg="#FAEEDA" title="Safe & Secure OTP Login"     desc="Mobile OTP authentication. Every worker and customer is verified." />
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────── */}
      <section className="bg-gray-900 px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-sora text-3xl font-bold text-white mb-4">Ready to Change How India Works?</h2>
          <p className="text-white/70 mb-8 leading-relaxed">Join thousands of workers and customers already using MazdoorConnect for fair, transparent employment.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/register')} className="px-8 py-4 bg-orange-500 text-white rounded-xl font-sora font-semibold hover:bg-orange-600 transition-colors">
              Register Now — It's Free
            </button>
            <button onClick={() => navigate('/workers')} className="px-8 py-4 border border-white/30 text-white rounded-xl font-sora font-semibold hover:border-white/60 transition-colors">
              Browse Workers
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className="bg-[#111] text-white/55 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-sora font-bold text-white mb-3">MazdoorConnect</h3>
              <p className="text-sm leading-relaxed">Empowering India's informal workforce with transparent, fair technology.</p>
            </div>
            {[
              { title: 'For Workers',   links: [['Register Profile', '/register'], ['Find Jobs', '/workers'], ['Dashboard', '/dashboard']] },
              { title: 'For Customers', links: [['Find Workers', '/workers'], ['Post a Job', '/register'], ['Leave Review', '/workers']] },
              { title: 'Company',       links: [['About Us', '/about'], ['How It Works', '/about'], ['Contact', '/about']] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">{col.title}</h4>
                {col.links.map(([label, path]) => (
                  <a key={label} onClick={() => navigate(path)} className="block text-sm mb-2 cursor-pointer hover:text-orange-400 transition-colors">{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-wrap justify-between gap-3 text-xs text-white/40">
            <span>© 2025 MazdoorConnect. Made with ❤️ for Indian workers.</span>
            <span>Lucknow, Uttar Pradesh, India</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
