// ─────────────────────────────────────────────
//  Register.jsx
//  Two-role registration form.
//  useState manages which role is selected and
//  all form field values.
// ─────────────────────────────────────────────
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import OTPModal from '../components/modals/OTPModal'
import { CATEGORIES } from '../data/workers'

export default function Register() {
  const navigate = useNavigate()
  const { showToast } = useApp()

  const [role,     setRole]     = useState('worker')   // 'worker' | 'customer'
  const [otpOpen,  setOtpOpen]  = useState(false)
  const [available, setAvailable] = useState(true)

  // Worker fields
  const [wForm, setW] = useState({ name:'', phone:'', category:'', location:'', rate:'', experience:'', bio:'' })
  // Customer fields
  const [cForm, setC] = useState({ name:'', phone:'', city:'', email:'' })

  function handleSubmit() {
    const form = role === 'worker' ? wForm : cForm
    if (!form.name || !form.phone) { showToast('Please fill in name and mobile number'); return }
    setOtpOpen(true)
  }

  function handleVerify() {
    setOtpOpen(false)
    navigate('/dashboard')
    showToast('Account created! Welcome to MazdoorConnect 🎉')
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-10">
      <h1 className="font-sora text-2xl font-extrabold text-gray-900 mb-1">Create Your Account</h1>
      <p className="text-gray-500 text-sm mb-8">Join MazdoorConnect — free for workers and customers</p>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        {[
          { key: 'worker',   icon: '👷', title: "I'm a Worker",    sub: 'Find jobs, set my rate, get paid directly' },
          { key: 'customer', icon: '🏠', title: 'I Need a Worker', sub: 'Find skilled workers in my area' },
        ].map(r => (
          <div key={r.key} onClick={() => setRole(r.key)}
            className={`p-5 rounded-xl border-2 text-center cursor-pointer transition-all ${
              role === r.key ? 'border-orange-500 bg-orange-50' : 'border-black/10 bg-white hover:border-orange-300'
            }`}>
            <span className="text-3xl block mb-2">{r.icon}</span>
            <h3 className="font-sora font-bold text-gray-900 text-sm mb-1">{r.title}</h3>
            <p className="text-xs text-gray-500">{r.sub}</p>
          </div>
        ))}
      </div>

      {/* Worker form */}
      {role === 'worker' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name *"     value={wForm.name}     onChange={v => setW({...wForm, name:v})}     placeholder="Ramesh Kumar" />
            <Field label="Mobile Number *" value={wForm.phone}    onChange={v => setW({...wForm, phone:v})}    placeholder="+91 9876543210" type="tel" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Work Category *</label>
              <select value={wForm.category} onChange={e => setW({...wForm, category:e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-black/10 text-sm text-gray-900 outline-none focus:border-orange-500">
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c.label}>{c.label}</option>)}
              </select>
            </div>
            <Field label="Location / Village *" value={wForm.location} onChange={v => setW({...wForm, location:v})} placeholder="Village/City name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Daily Rate (₹) *"    value={wForm.rate}       onChange={v => setW({...wForm, rate:v})}       placeholder="500" type="number" />
            <Field label="Years of Experience" value={wForm.experience} onChange={v => setW({...wForm, experience:v})} placeholder="5"   type="number" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bio / About Work</label>
            <textarea value={wForm.bio} onChange={e => setW({...wForm, bio:e.target.value})}
              rows={3} placeholder="Tell customers about your skills and experience..."
              className="w-full px-4 py-3 rounded-xl border-2 border-black/10 text-sm text-gray-900 resize-none outline-none focus:border-orange-500" />
          </div>
          {/* Availability toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">Currently Available for Work?</div>
              <div className="text-xs text-gray-500">You can change this anytime from dashboard</div>
            </div>
            <div onClick={() => setAvailable(!available)}
              className={`w-11 h-6 rounded-full cursor-pointer relative transition-colors ${available ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-4.5 h-4.5 w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-all shadow ${available ? 'left-[23px]' : 'left-[3px]'}`} />
            </div>
          </div>
        </div>
      )}

      {/* Customer form */}
      {role === 'customer' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name *"     value={cForm.name}  onChange={v => setC({...cForm, name:v})}  placeholder="Priya Sharma" />
            <Field label="Mobile Number *" value={cForm.phone} onChange={v => setC({...cForm, phone:v})} placeholder="+91 9876543210" type="tel" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City / Location *" value={cForm.city}  onChange={v => setC({...cForm, city:v})}  placeholder="Lucknow, UP" />
            <Field label="Email (optional)"  value={cForm.email} onChange={v => setC({...cForm, email:v})} placeholder="you@example.com" type="email" />
          </div>
        </div>
      )}

      <button onClick={handleSubmit} className="w-full mt-7 py-4 bg-orange-500 text-white rounded-xl font-sora font-semibold text-base hover:bg-orange-600 transition-colors">
        Send OTP &amp; Verify →
      </button>
      <p className="text-center text-xs text-gray-500 mt-4">
        Already registered? <span className="text-orange-500 cursor-pointer" onClick={() => showToast('Opening login...')}>Login here</span>
      </p>

      <OTPModal isOpen={otpOpen} onClose={() => setOtpOpen(false)} onVerify={handleVerify} />
    </div>
  )
}

// ── tiny reusable input ─────────────────────
function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border-2 border-black/10 text-sm text-gray-900 outline-none focus:border-orange-500" />
    </div>
  )
}
