// src/api/client.js
// One shared API client that prefers the live backend but falls back to a
// local demo store when the server or database is unavailable.

import { workers as seedWorkers } from '../data/workers.js'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true'

const DEMO_KEYS = {
  users: 'mc_demo_users',
  jobs: 'mc_demo_jobs',
  otps: 'mc_demo_otps',
}

function safeJSONParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function readStore(key, fallback) {
  return safeJSONParse(localStorage.getItem(key), fallback)
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-10)
}

function makeInitials(name = '') {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return initials || 'U'
}

function normalizeWorkerList(raw = {}) {
  const profile = raw.workerProfile || {}
  const rate = raw.rate ?? raw.dailyRate ?? profile.dailyRate ?? 0
  const rating = raw.rating ?? raw.ratingAvg ?? profile.ratingAvg ?? 0
  const reviews = raw.reviews ?? raw.reviewCount ?? profile.reviewCount ?? 0

  return {
    id: String(raw.id),
    name: raw.name || 'Unnamed Worker',
    phone: raw.phone || '',
    initials: raw.initials || makeInitials(raw.name),
    category: raw.category || profile.category || '',
    location: raw.location || profile.location || '',
    rate: Number(rate) || 0,
    available: raw.available ?? profile.available ?? true,
    rating: Number(rating) || 0,
    reviews: Number(reviews) || 0,
    experience: Number(raw.experience ?? profile.experience ?? 0) || 0,
    avatarBg: raw.avatarBg || '#FFF0E8',
    avatarColor: raw.avatarColor || '#8A3208',
    bio: raw.bio || profile.bio || '',
    workerProfile: {
      id: profile.id || `profile-${String(raw.id)}`,
      category: raw.category || profile.category || '',
      location: raw.location || profile.location || '',
      dailyRate: Number(rate) || 0,
      experience: Number(raw.experience ?? profile.experience ?? 0) || 0,
      bio: raw.bio || profile.bio || '',
      available: raw.available ?? profile.available ?? true,
      ratingAvg: Number(rating) || 0,
      reviewCount: Number(reviews) || 0,
      photoUrl: profile.photoUrl || raw.photoUrl || null,
    },
  }
}

function normalizeWorkerProfile(raw = {}) {
  const base = normalizeWorkerList(raw)
  return {
    ...base,
    ratingAvg: base.rating,
    reviewCount: base.reviews,
    reviews: Array.isArray(raw.reviews)
      ? raw.reviews.map(review => ({
          id: review.id || makeId('review'),
          rating: Number(review.rating) || 0,
          comment: review.comment || '',
          customer: review.customer || { name: review.customerName || 'Customer' },
        }))
      : [],
  }
}

function seedDemoUsers() {
  const users = seedWorkers.map(worker => ({
    id: String(worker.id),
    phone: worker.phone,
    name: worker.name,
    role: 'WORKER',
    workerProfile: {
      id: `profile-${worker.id}`,
      category: worker.category,
      location: worker.location,
      dailyRate: worker.rate,
      experience: worker.experience,
      bio: worker.bio,
      available: worker.available,
      ratingAvg: worker.rating,
      reviewCount: worker.reviews,
      photoUrl: null,
    },
    initials: worker.initials,
    avatarBg: worker.avatarBg,
    avatarColor: worker.avatarColor,
  }))

  if (!Array.isArray(readStore(DEMO_KEYS.users, null))) {
    writeStore(DEMO_KEYS.users, users)
  }

  return readStore(DEMO_KEYS.users, users)
}

function getDemoState() {
  return {
    users: readStore(DEMO_KEYS.users, null) || seedDemoUsers(),
    jobs: readStore(DEMO_KEYS.jobs, []),
    otps: readStore(DEMO_KEYS.otps, {}),
  }
}

function saveDemoState(state) {
  writeStore(DEMO_KEYS.users, state.users)
  writeStore(DEMO_KEYS.jobs, state.jobs)
  writeStore(DEMO_KEYS.otps, state.otps)
}

function getStoredUser() {
  return safeJSONParse(localStorage.getItem('mc_user'), null)
}

function setDemoSession(token, user) {
  localStorage.setItem('mc_token', token)
  localStorage.setItem('mc_user', JSON.stringify(user))
}

function getCurrentDemoUser(state = getDemoState()) {
  const session = getStoredUser()
  if (!session) return null
  return state.users.find(user => String(user.id) === String(session.id)) || session
}

function setUserInState(state, user) {
  const index = state.users.findIndex(entry => String(entry.id) === String(user.id))
  if (index >= 0) state.users[index] = user
  else state.users.push(user)
}

function buildError(message) {
  return { error: message }
}

function currentToken() {
  return localStorage.getItem('mc_token')
}

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(currentToken() && { Authorization: `Bearer ${currentToken()}` }),
      ...options.headers,
    },
    ...options,
  }

  if (!USE_BACKEND || String(currentToken() || '').startsWith('demo.')) {
    const fallback = await mockRequest(endpoint, config)
    if (fallback && fallback.error) {
      throw new Error(fallback.error)
    }
    return fallback
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config)
    const text = await response.text()
    const data = text ? safeJSONParse(text, {}) : {}

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong')
    }

    return data
  } catch {
    const fallback = await mockRequest(endpoint, config)
    if (fallback && fallback.error) {
      throw new Error(fallback.error)
    }
    return fallback
  }
}

async function mockRequest(endpoint, options = {}) {
  const state = getDemoState()
  const method = String(options.method || 'GET').toUpperCase()
  const body = options.body ? safeJSONParse(options.body, {}) : {}
  const sessionUser = getCurrentDemoUser(state)

  if (endpoint === '/auth/send-otp' && method === 'POST') {
    const phone = normalizePhone(body.phone)
    if (phone.length < 10) return buildError('Please enter a valid phone number')
    const otp = '1234'
    state.otps[phone] = otp
    saveDemoState(state)
    return { message: `OTP sent to +91${phone}`, dev_otp: otp }
  }

  if (endpoint === '/auth/register/worker' && method === 'POST') {
    const phone = normalizePhone(body.phone)
    if ((state.otps[phone] || '1234') !== String(body.otp || '')) return buildError('Invalid OTP')
    if (state.users.some(user => normalizePhone(user.phone) === phone)) return buildError('This phone number is already registered. Please login.')

    const user = {
      id: makeId('worker'),
      phone: `+91${phone}`,
      name: body.name,
      role: 'WORKER',
      workerProfile: {
        id: makeId('profile'),
        category: body.category,
        location: body.location,
        dailyRate: Number(body.dailyRate) || 0,
        experience: Number(body.experience) || 0,
        bio: body.bio || '',
        available: body.available ?? true,
        ratingAvg: 0,
        reviewCount: 0,
        photoUrl: null,
      },
    }

    setUserInState(state, user)
    saveDemoState(state)
    const token = `demo.${makeId('token')}`
    setDemoSession(token, user)
    return { message: 'Registration successful!', token, user }
  }

  if (endpoint === '/auth/register/customer' && method === 'POST') {
    const phone = normalizePhone(body.phone)
    if ((state.otps[phone] || '1234') !== String(body.otp || '')) return buildError('Invalid OTP')
    if (state.users.some(user => normalizePhone(user.phone) === phone)) return buildError('Phone already registered. Please login.')

    const user = {
      id: makeId('customer'),
      phone: `+91${phone}`,
      name: body.name,
      role: 'CUSTOMER',
    }

    setUserInState(state, user)
    saveDemoState(state)
    const token = `demo.${makeId('token')}`
    setDemoSession(token, user)
    return { message: 'Registration successful!', token, user }
  }

  if (endpoint === '/auth/login' && method === 'POST') {
    const phone = normalizePhone(body.phone)
    if ((state.otps[phone] || '1234') !== String(body.otp || '')) return buildError('Invalid OTP')
    const user = state.users.find(entry => normalizePhone(entry.phone) === phone)
    if (!user) return buildError('Phone not registered. Please sign up first.')

    const token = `demo.${makeId('token')}`
    setDemoSession(token, user)
    return { message: 'Login successful!', token, user }
  }

  if (endpoint === '/auth/me' && method === 'GET') {
    const user = getCurrentDemoUser(state)
    if (!user) return buildError('No token provided. Please login.')
    return { user }
  }

  if (endpoint.startsWith('/workers') && method === 'GET') {
    const [path, queryString] = endpoint.split('?')
    const query = Object.fromEntries(new URLSearchParams(queryString || ''))

    if (path === '/workers') {
      const workers = state.users
        .filter(user => user.role === 'WORKER')
        .map(normalizeWorkerList)
        .filter(worker => {
          if (query.category && worker.category !== query.category) return false
          if (query.location && !worker.location.toLowerCase().includes(String(query.location).toLowerCase())) return false
          if (query.available === 'true' && !worker.available) return false
          if (query.available === 'false' && worker.available) return false
          if (query.minRate && worker.rate < Number(query.minRate)) return false
          if (query.maxRate && worker.rate > Number(query.maxRate)) return false
          if (query.search) {
            const search = String(query.search).toLowerCase()
            const haystack = `${worker.name} ${worker.category} ${worker.location}`.toLowerCase()
            if (!haystack.includes(search)) return false
          }
          return true
        })

      return {
        workers,
        pagination: {
          total: workers.length,
          page: 1,
          limit: workers.length || 20,
          pages: 1,
        },
      }
    }

    const workerId = path.split('/').pop()
    const worker = state.users.find(user => String(user.id) === String(workerId) && user.role === 'WORKER')
    if (!worker) return buildError('Worker not found.')

    const reviewJobs = (state.jobs || []).filter(job => String(job.workerId) === String(workerId) && job.review)
    const reviews = reviewJobs.map(job => ({
      id: job.review.id,
      rating: job.review.rating,
      comment: job.review.comment,
      customer: { name: job.review.customerName || 'Customer' },
    }))

    return {
      worker: {
        ...normalizeWorkerProfile(worker),
        reviews,
        reviewCount: reviews.length || worker.workerProfile?.reviewCount || 0,
        ratingAvg: worker.workerProfile?.ratingAvg ?? worker.rating ?? 0,
      },
    }
  }

  if (endpoint === '/workers/profile' && method === 'PATCH') {
    if (!sessionUser || sessionUser.role !== 'WORKER') return buildError('Only workers can access this.')
    const user = state.users.find(entry => String(entry.id) === String(sessionUser.id))
    if (!user) return buildError('Worker not found.')

    user.workerProfile = {
      ...user.workerProfile,
      ...body,
      dailyRate: body.dailyRate != null ? Number(body.dailyRate) : user.workerProfile.dailyRate,
      experience: body.experience != null ? Number(body.experience) : user.workerProfile.experience,
    }

    saveDemoState(state)
    setDemoSession(currentToken() || `demo.${makeId('token')}`, user)
    return { message: 'Profile updated!', profile: user.workerProfile }
  }

  if (endpoint === '/workers/availability' && method === 'PATCH') {
    if (!sessionUser || sessionUser.role !== 'WORKER') return buildError('Only workers can access this.')
    const user = state.users.find(entry => String(entry.id) === String(sessionUser.id))
    if (!user) return buildError('Worker not found.')

    user.workerProfile.available = !user.workerProfile.available
    saveDemoState(state)
    setDemoSession(currentToken() || `demo.${makeId('token')}`, user)
    return {
      available: user.workerProfile.available,
      message: user.workerProfile.available ? 'You are now open to work!' : 'You are now marked as engaged.',
    }
  }

  if (endpoint === '/jobs' && method === 'POST') {
    if (!sessionUser || sessionUser.role !== 'CUSTOMER') return buildError('Only customers can access this.')
    const worker = state.users.find(user => String(user.id) === String(body.workerId) && user.role === 'WORKER')
    if (!worker) return buildError('Worker not found.')

    const job = {
      id: makeId('job'),
      title: body.title,
      description: body.description || '',
      agreedRate: body.agreedRate != null ? Number(body.agreedRate) : worker.workerProfile.dailyRate,
      scheduledAt: body.scheduledAt || null,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      customerId: sessionUser.id,
      workerId: worker.id,
      customer: { name: sessionUser.name, phone: sessionUser.phone },
      worker: { user: { name: worker.name, phone: worker.phone } },
    }

    state.jobs.unshift(job)
    saveDemoState(state)
    return { message: 'Job request sent!', job }
  }

  if (endpoint === '/jobs/my' && method === 'GET') {
    if (!sessionUser) return buildError('No token provided. Please login.')
    const jobs = (state.jobs || []).filter(job => String(job.customerId) === String(sessionUser.id) || String(job.workerId) === String(sessionUser.id))
      .map(job => {
        if (sessionUser.role === 'CUSTOMER' && String(job.customerId) === String(sessionUser.id)) {
          return {
            ...job,
            worker: job.worker || { user: { name: state.users.find(user => String(user.id) === String(job.workerId))?.name || 'Worker' } },
          }
        }

        if (sessionUser.role === 'WORKER' && String(job.workerId) === String(sessionUser.id)) {
          return {
            ...job,
            customer: job.customer || { name: state.users.find(user => String(user.id) === String(job.customerId))?.name || 'Customer' },
          }
        }

        return job
      })

    return { jobs }
  }

  if (endpoint.startsWith('/jobs/') && endpoint.endsWith('/status') && method === 'PATCH') {
    if (!sessionUser || sessionUser.role !== 'WORKER') return buildError('Only workers can access this.')
    const jobId = endpoint.split('/')[2]
    const job = state.jobs.find(entry => String(entry.id) === String(jobId))
    if (!job) return buildError('Job not found.')
    if (String(job.workerId) !== String(sessionUser.id)) return buildError('Not authorized to update this job.')

    job.status = body.status
    if (body.status === 'COMPLETED') job.completedAt = new Date().toISOString()
    saveDemoState(state)
    return { message: 'Job status updated!', job }
  }

  if (endpoint === '/jobs/reviews' && method === 'POST') {
    if (!sessionUser || sessionUser.role !== 'CUSTOMER') return buildError('Only customers can access this.')
    const job = state.jobs.find(entry => String(entry.id) === String(body.jobId))
    if (!job) return buildError('Job not found.')
    if (String(job.customerId) !== String(sessionUser.id)) return buildError('Not your job.')

    const review = {
      id: makeId('review'),
      rating: Number(body.rating) || 0,
      comment: body.comment || '',
      customerName: sessionUser.name,
    }

    job.review = review
    job.status = 'COMPLETED'

    const worker = state.users.find(user => String(user.id) === String(job.workerId) && user.role === 'WORKER')
    if (worker) {
      const ratings = state.jobs.filter(entry => String(entry.workerId) === String(worker.id) && entry.review).map(entry => entry.review.rating)
      const avg = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      worker.workerProfile.ratingAvg = Math.round((avg || 0) * 10) / 10
      worker.workerProfile.reviewCount = ratings.length
    }

    saveDemoState(state)
    return { message: 'Review submitted. Thank you!', review }
  }

  return buildError('Demo API route not supported yet.')
}

// ── Auth API ──────────────────────────────────────────────
export const authAPI = {

  // Step 1: Send OTP to phone
  sendOTP: (phone) =>
    request('/auth/send-otp', {
      method: 'POST',
      body:   JSON.stringify({ phone }),
    }),

  // Step 2a: Register as worker (with OTP verification)
  registerWorker: (formData) =>
    request('/auth/register/worker', {
      method: 'POST',
      body:   JSON.stringify(formData),
    }),

  // Step 2b: Register as customer
  registerCustomer: (formData) =>
    request('/auth/register/customer', {
      method: 'POST',
      body:   JSON.stringify(formData),
    }),

  // Login existing user
  login: (phone, otp) =>
    request('/auth/login', {
      method: 'POST',
      body:   JSON.stringify({ phone, otp }),
    }),

  // Get the currently logged-in user's info
  getMe: () => request('/auth/me'),
}

// ── Workers API ───────────────────────────────────────────
export const workersAPI = {

  // Get all workers (with optional filters as URL query params)
  // Usage: workersAPI.getAll({ category: 'Electrician', available: true })
  getAll: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ''))
    )
    return request(`/workers?${params}`).then(res => ({
      ...res,
      workers: (res.workers || []).map(normalizeWorkerList),
    }))
  },

  // Get one worker by ID
  getById: (id) => request(`/workers/${id}`).then(res => ({
    ...res,
    worker: normalizeWorkerProfile(res.worker),
  })),

  // Update own worker profile
  updateProfile: (data) =>
    request('/workers/profile', {
      method: 'PATCH',
      body:   JSON.stringify(data),
    }),

  // Toggle availability on/off
  toggleAvailability: () =>
    request('/workers/availability', { method: 'PATCH' }),
}

// ── Jobs API ──────────────────────────────────────────────
export const jobsAPI = {

  // Customer creates a job request for a worker
  create: (jobData) =>
    request('/jobs', {
      method: 'POST',
      body:   JSON.stringify(jobData),
    }),

  // Get current user's jobs (works for both worker and customer)
  getMy: () => request('/jobs/my'),

  // Worker updates job status
  updateStatus: (jobId, status) =>
    request(`/jobs/${jobId}/status`, {
      method: 'PATCH',
      body:   JSON.stringify({ status }),
    }),

  // Customer submits a review
  submitReview: (reviewData) =>
    request('/jobs/reviews', {
      method: 'POST',
      body:   JSON.stringify(reviewData),
    }),
}

// ── Auth helpers ──────────────────────────────────────────
// Save token and user after login/register
export function saveSession(token, user) {
  localStorage.setItem('mc_token', token)
  localStorage.setItem('mc_user',  JSON.stringify(user))
}

// Clear everything on logout
export function clearSession() {
  localStorage.removeItem('mc_token')
  localStorage.removeItem('mc_user')
}

// Read the saved user (avoids an API call on page refresh)
export function getSavedUser() {
  const raw = localStorage.getItem('mc_user')
  return raw ? JSON.parse(raw) : null
}

// Check if user is logged in
export function isLoggedIn() {
  return !!localStorage.getItem('mc_token')
}
