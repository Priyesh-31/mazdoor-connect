// src/index.js
// The main server file. Sets up Express, middleware, routes, and starts listening.

import 'dotenv/config'                    // loads .env file variables
import express      from 'express'
import cors         from 'cors'
import helmet       from 'helmet'
import morgan       from 'morgan'
import rateLimit    from 'express-rate-limit'

import authRoutes    from './routes/auth.js'
import workerRoutes  from './routes/workers.js'
import jobRoutes     from './routes/jobs.js'

const app  = express()
const PORT = process.env.PORT || 5000

// ── Security Middleware ────────────────────────────────────
// helmet adds secure HTTP headers automatically
app.use(helmet())

// CORS — only allow requests from your frontend URL
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

// Rate limiting — prevents abuse / brute force attacks
// OTP routes get stricter limits
const generalLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many requests. Try again later.' } })
const otpLimit     = rateLimit({ windowMs: 10 * 60 * 1000, max: 5,   message: { error: 'Too many OTP requests. Try again in 10 minutes.' } })

app.use(generalLimit)

// ── Standard Middleware ────────────────────────────────────
app.use(express.json())          // parse JSON request bodies
app.use(morgan('dev'))           // log all requests in terminal

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',    otpLimit,  authRoutes)    // stricter limit on auth
app.use('/api/workers',            workerRoutes)
app.use('/api/jobs',               jobRoutes)

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` })
})

// ── Global Error Handler ──────────────────────────────────
// Catches any unhandled errors from controllers/middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Something went wrong.'
      : err.message,
  })
})

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 MazdoorConnect API running on http://localhost:${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`)
})
