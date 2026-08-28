// src/pages/Register.jsx
// Full flow: enter phone → get OTP → login or create account.
// Uses the live backend when available and a local demo store when it is not.

import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { authAPI } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const CATEGORIES = [
  'Electrician','Plumber','Mason','Painter','Carpenter',
  'General Labor','Welder','Driver','Gardener','Helper',
]

// 3 steps: PHONE → OTP → DETAILS
const STEPS = { PHONE: 'phone', OTP: 'otp', DETAILS: 'details' }
const MODES = { REGISTER: 'register', LOGIN: 'login' }

export default function Register() {
  const { user, loginUser } = useAuth()
  const { showToast }       = useToast()
  const { t }               = useLanguage()
  const navigate            = useNavigate()

  const [step,     setStep]     = useState(STEPS.PHONE)
  const [mode,     setMode]     = useState(MODES.REGISTER)
  const [role,     setRole]     = useState('worker')
  const [phone,    setPhone]    = useState('')
  const [otp,      setOtp]      = useState(['','','',''])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // Form fields for details step
  const [form, setForm] = useState({
    name: '', category: '', location: '',
    dailyRate: '', experience: '', bio: '', available: true,
  })

  // Redirect already-logged-in users
  if (user) return <Navigate to="/dashboard" replace />

  const isLogin = mode === MODES.LOGIN

  function fullPhone() {
    return '+91' + phone.replace(/\D/g, '').slice(-10)
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setStep(STEPS.PHONE)
    setOtp(['','','',''])
    setError('')
  }

  // ── Step 1: Send OTP ──
  async function handleSendOTP(e) {
    e.preventDefault()
    setError('')
    if (!phone || phone.length < 10) {
      setError(t('enterValidPhone'))
      return
    }
    setLoading(true)
    try {
      const res = await authAPI.sendOTP(fullPhone())
      showToast(t('sendOTP'))
      // In dev mode backend returns the OTP — show it as a hint
      if (res.dev_otp) showToast(`DEV MODE — OTP: ${res.dev_otp}`)
      setStep(STEPS.OTP)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP ──
  async function handleVerifyOTP(e) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 4) { setError('Enter all 4 digits'); return }
    setError('')
    if (isLogin) {
      setLoading(true)
      try {
        const res = await authAPI.login(fullPhone(), code)
        loginUser(res.token, res.user)
        showToast(`${t('welcomeBack')}, ${res.user.name}!`)
        navigate('/dashboard')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
      return
    }

    setStep(STEPS.DETAILS)
  }

  // OTP input: auto-advance to next box
  function handleOtpChange(val, idx) {
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 3) document.getElementById(`otp-${idx+1}`)?.focus()
    if (!val && idx > 0) document.getElementById(`otp-${idx-1}`)?.focus()
  }

  // ── Step 3: Submit full registration ──
  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError(t('nameRequired')); return }
    if (role === 'worker' && !form.category) { setError(t('categoryRequired')); return }
    if (role === 'worker' && !form.dailyRate) { setError(t('dailyRateRequired')); return }

    setLoading(true)
    try {
      const fullPhone = '+91' + phone.replace(/\D/g, '').slice(-10)
      const otpCode   = otp.join('')
      let res

      if (role === 'worker') {
        res = await authAPI.registerWorker({
          phone:      fullPhone,
          otp:        otpCode,
          name:       form.name,
          category:   form.category,
          location:   form.location || 'India',
          dailyRate:  parseInt(form.dailyRate),
          experience: parseInt(form.experience) || 0,
          bio:        form.bio,
          available:  form.available,
        })
      } else {
        res = await authAPI.registerCustomer({
          phone:    fullPhone,
          otp:      otpCode,
          name:     form.name,
          location: form.location,
        })
      }

      loginUser(res.token, res.user)
      showToast(`Welcome, ${res.user.name}! 🎉`)
      navigate('/dashboard')

    } catch (err) {
      // If OTP error, go back to OTP step
      if (err.message.toLowerCase().includes('otp')) {
        setStep(STEPS.OTP)
        setOtp(['','','',''])
      }
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10 pb-20">

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {(isLogin ? [STEPS.PHONE, STEPS.OTP] : [STEPS.PHONE, STEPS.OTP, STEPS.DETAILS]).map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300
            ${step === STEPS.PHONE && i === 0 ? 'bg-orange' :
              step === STEPS.OTP   && i <= 1 ? 'bg-orange' :
              step === STEPS.DETAILS ? 'bg-orange' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* ── STEP 1: Phone ── */}
      {step === STEPS.PHONE && (
        <>
          <h1 className="font-sora font-extrabold text-2xl text-gray-900 mb-1">
            {isLogin ? t('loginToYourAccount') : t('createYourFreeAccount')}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {isLogin ? t('loginOtpText') : t('registerProfileDesc')}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => switchMode(MODES.REGISTER)}
              className={`btn-outline py-3 ${!isLogin ? 'border-orange-500 text-orange-600 bg-orange-50' : ''}`}>
              {t('freeJoin')}
            </button>
            <button
              type="button"
              onClick={() => switchMode(MODES.LOGIN)}
              className={`btn-outline py-3 ${isLogin ? 'border-orange-500 text-orange-600 bg-orange-50' : ''}`}>
              {t('login')}
            </button>
          </div>

          {/* Role selector */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { key:'worker',   icon:'👷', title:t('workerRoleTitle'),   sub:t('workerRoleSub') },
                { key:'customer', icon:'🏠', title:t('customerRoleTitle'), sub:t('customerRoleSub') },
              ].map(r => (
                <button key={r.key} type="button" onClick={() => setRole(r.key)}
                  className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all shadow-sm
                    ${role === r.key ? 'border-orange bg-orange-light' : 'border-gray-200 bg-white hover:border-orange'}`}>
                  <span className="text-2xl block mb-1">{r.icon}</span>
                  <h3 className="font-sora font-bold text-sm text-gray-900">{r.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{r.sub}</p>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendOTP}>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('phoneNumberRequired')}</label>
            <div className="flex gap-2 mb-4">
              <div className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">+91</div>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="9876543210" maxLength={10} required
                className="flex-1 px-3.5 py-3 rounded-xl border border-gray-200 bg-white
                           text-gray-900 text-sm outline-none focus:border-orange" />
            </div>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60">
              {loading ? `${t('sendOTP')}...` : isLogin ? t('sendLoginOtp') : `${t('sendOTP')} →`}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4">
              {isLogin ? `${t('newHere')} ` : `${t('alreadyRegistered')} `}
              <button type="button" onClick={() => switchMode(isLogin ? MODES.REGISTER : MODES.LOGIN)}
                className="text-orange font-semibold bg-transparent border-none cursor-pointer">
                {isLogin ? t('createAccount') : t('loginWithOtp')}
              </button>
            </p>
          </form>
        </>
      )}

      {/* ── STEP 2: OTP ── */}
      {step === STEPS.OTP && (
        <>
          <button onClick={() => setStep(STEPS.PHONE)}
            className="text-gray-400 text-sm mb-4 bg-transparent border-none cursor-pointer hover:text-gray-600">
            ← {t('mobileNumber')}
          </button>
          <h1 className="font-sora font-extrabold text-2xl text-gray-900 mb-1">{t('verifyMobile')}</h1>
          <p className="text-gray-500 text-sm mb-6">
            Sent to <strong className="text-gray-900">{fullPhone()}</strong>
          </p>
          <form onSubmit={handleVerifyOTP}>
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, i) => (
                <input key={i} id={`otp-${i}`} type="number" value={digit}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  maxLength={1}
                  className="w-14 h-14 text-center text-2xl font-sora font-bold rounded-xl
                             border-2 border-gray-200 outline-none focus:border-orange
                             text-gray-900 bg-white" />
              ))}
            </div>
            {error && <p className="text-red-500 text-xs text-center mb-3">{error}</p>}
            <button type="submit"
              className="btn-primary w-full py-3.5 text-base">
              {isLogin ? t('loginToDashboard') : `${t('verifyRegister')} →`}
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">
              Didn't receive?{' '}
              <button type="button" onClick={handleSendOTP}
                className="text-orange font-semibold bg-transparent border-none cursor-pointer">
                {t('resendOTP')}
              </button>
            </p>
          </form>
        </>
      )}

      {/* ── STEP 3: Details ── */}
      {step === STEPS.DETAILS && !isLogin && (
        <>
          <button onClick={() => setStep(STEPS.OTP)}
            className="text-gray-400 text-sm mb-4 bg-transparent border-none cursor-pointer hover:text-gray-600">
            ← Back
          </button>
          <h1 className="font-sora font-extrabold text-2xl text-gray-900 mb-1">
            {role === 'worker' ? t('setUpProfile') : t('almostDone')}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {role === 'worker' ? t('customersWillSee') : t('tellingAboutYourself')}
          </p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('fullName')} *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder={role === 'worker' ? 'Ramesh Kumar' : 'Priya Sharma'} required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-orange" />
            </div>

            {role === 'worker' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('workCategory')} *</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-orange bg-white">
                      <option value="">{t('workCategory')}</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('location')} *</label>
                    <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                      placeholder={t('cityPlaceholder')} required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-orange" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('dailyRate')} (₹) *</label>
                    <input type="number" value={form.dailyRate} onChange={e => setForm({...form, dailyRate: e.target.value})}
                      placeholder="500" min="100" required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-orange" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('experienceYears')}</label>
                    <input type="number" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})}
                      placeholder="5" min="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-orange" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('bioOptional')}</label>
                  <textarea rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                    placeholder={t('tellingAboutYourself')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none outline-none focus:border-orange" />
                </div>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('availableForWork')}</p>
                    <p className="text-xs text-gray-500">{t('canToggleAnytime')}</p>
                  </div>
                  <button type="button" onClick={() => setForm({...form, available: !form.available})}
                    className={`w-11 h-6 rounded-full relative transition-colors border-none cursor-pointer
                                ${form.available ? 'bg-green' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all
                                     ${form.available ? 'left-[22px]' : 'left-[3px]'}`} />
                  </button>
                </div>
              </>
            )}

            {role === 'customer' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">{t('yourCity')}</label>
                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                  placeholder={t('cityPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-orange" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary py-3.5 text-base mt-2 disabled:opacity-60">
              {loading ? t('creatingAccount') : t('createAccountCta')}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
