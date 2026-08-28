// src/controllers/authController.js
// Controllers handle the actual business logic for each route.
// They use services (OTP, token) and the database (Prisma).

import prisma               from '../config/db.js'
import { sendOTP, verifyOTP } from '../services/otpService.js'
import { createToken }      from '../services/tokenService.js'
import { z }                from 'zod'

// ── Input validation schemas (Zod) ────────────────────────
// Zod checks the request body before we do anything with it.
// This prevents bad/malicious data from reaching the database.

const phoneSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number too short')
    .max(15, 'Phone number too long')
    .regex(/^\+?[0-9]+$/, 'Invalid phone number format'),
})

const registerWorkerSchema = z.object({
  phone:      z.string().min(10).max(15),
  name:       z.string().min(2, 'Name too short').max(100),
  otp:        z.string().length(4, 'OTP must be 4 digits'),
  category:   z.string().min(2),
  location:   z.string().min(2),
  dailyRate:  z.number().int().min(100).max(10000),
  experience: z.number().int().min(0).max(60).optional(),
  bio:        z.string().max(500).optional(),
  available:  z.boolean().optional(),
})

const registerCustomerSchema = z.object({
  phone:    z.string().min(10).max(15),
  name:     z.string().min(2).max(100),
  otp:      z.string().length(4),
  location: z.string().min(2).optional(),
})

const loginSchema = z.object({
  phone: z.string().min(10).max(15),
  otp:   z.string().length(4),
})

// ── STEP 1: Send OTP ──────────────────────────────────────
// POST /api/auth/send-otp
// Body: { phone: "+919876543210" }
export async function sendOTPHandler(req, res) {
  try {
    const { phone } = phoneSchema.parse(req.body)

    const result = await sendOTP(phone)

    // In dev mode, return the OTP in response for easy testing
    // In production, only return { message: "OTP sent" }
    res.json({
      message: `OTP sent to ${phone}`,
      ...(process.env.NODE_ENV === 'development' && { dev_otp: result.dev_otp }),
    })

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('sendOTP error:', err)
    res.status(500).json({ error: 'Failed to send OTP. Try again.' })
  }
}

// ── STEP 2a: Register as Worker ───────────────────────────
// POST /api/auth/register/worker
export async function registerWorker(req, res) {
  try {
    const data = registerWorkerSchema.parse({
      ...req.body,
      dailyRate:  parseInt(req.body.dailyRate),
      experience: parseInt(req.body.experience) || 0,
    })

    // Verify OTP first
    const otpResult = await verifyOTP(data.phone, data.otp)
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.reason })
    }

    // Check if phone already registered
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } })
    if (existing) {
      return res.status(409).json({ error: 'This phone number is already registered. Please login.' })
    }

    // Create User + WorkerProfile in one transaction
    // A transaction means: either BOTH succeed, or NEITHER saves.
    // No partial data in the database.
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phone: data.phone,
          name:  data.name,
          role:  'WORKER',
          workerProfile: {
            create: {
              category:   data.category,
              location:   data.location,
              dailyRate:  data.dailyRate,
              experience: data.experience || 0,
              bio:        data.bio,
              available:  data.available ?? true,
            }
          }
        },
        include: { workerProfile: true }
      })
      return newUser
    })

    const token = createToken(user)

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id:   user.id,
        name: user.name,
        role: user.role,
        workerProfile: user.workerProfile,
      }
    })

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('registerWorker error:', err)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
}

// ── STEP 2b: Register as Customer ────────────────────────
// POST /api/auth/register/customer
export async function registerCustomer(req, res) {
  try {
    const data = registerCustomerSchema.parse(req.body)

    const otpResult = await verifyOTP(data.phone, data.otp)
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.reason })
    }

    const existing = await prisma.user.findUnique({ where: { phone: data.phone } })
    if (existing) {
      return res.status(409).json({ error: 'Phone already registered. Please login.' })
    }

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        name:  data.name,
        role:  'CUSTOMER',
      }
    })

    const token = createToken(user)

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { id: user.id, name: user.name, role: user.role }
    })

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('registerCustomer error:', err)
    res.status(500).json({ error: 'Registration failed.' })
  }
}

// ── LOGIN (for existing users) ────────────────────────────
// POST /api/auth/login
// Body: { phone, otp }
export async function login(req, res) {
  try {
    const { phone, otp } = loginSchema.parse(req.body)

    const otpResult = await verifyOTP(phone, otp)
    if (!otpResult.valid) {
      return res.status(400).json({ error: otpResult.reason })
    }

    const user = await prisma.user.findUnique({
      where:   { phone },
      include: { workerProfile: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'Phone not registered. Please sign up first.' })
    }

    const token = createToken(user)

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id:   user.id,
        name: user.name,
        role: user.role,
        workerProfile: user.workerProfile,
      }
    })

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    console.error('login error:', err)
    res.status(500).json({ error: 'Login failed.' })
  }
}

// ── GET CURRENT USER (me) ─────────────────────────────────
// GET /api/auth/me  (requires token)
export async function getMe(req, res) {
  // req.user is set by the authenticate middleware
  res.json({
    user: {
      id:   req.user.id,
      name: req.user.name,
      role: req.user.role,
      phone: req.user.phone,
      workerProfile: req.user.workerProfile,
    }
  })
}
