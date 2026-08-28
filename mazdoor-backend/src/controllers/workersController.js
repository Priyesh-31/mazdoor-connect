// src/controllers/workersController.js
import prisma from '../config/db.js'
import { z }  from 'zod'

// GET /api/workers — list all workers with filters
export async function getWorkers(req, res) {
  try {
    const { category, location, available, minRate, maxRate, search, page = 1, limit = 20 } = req.query

    // Build Prisma where clause dynamically based on query params
    const where = {
      // always exclude workers without profiles
      workerProfile: { isNot: null },
    }

    if (category)  where.workerProfile = { ...where.workerProfile, category }
    if (location)  where.workerProfile = { ...where.workerProfile, location: { contains: location, mode: 'insensitive' } }
    if (available) where.workerProfile = { ...where.workerProfile, available: available === 'true' }
    if (minRate)   where.workerProfile = { ...where.workerProfile, dailyRate: { gte: parseInt(minRate) } }
    if (maxRate)   where.workerProfile = { ...where.workerProfile, dailyRate: { ...where.workerProfile?.dailyRate, lte: parseInt(maxRate) } }
    if (search)    where.name = { contains: search, mode: 'insensitive' }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Run count + data query in parallel for efficiency
    const [total, workers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: { workerProfile: true },
        skip,
        take: parseInt(limit),
        orderBy: { workerProfile: { ratingAvg: 'desc' } },  // best rated first
      })
    ])

    res.json({
      workers: workers.map(formatWorker),
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      }
    })

  } catch (err) {
    console.error('getWorkers error:', err)
    res.status(500).json({ error: 'Failed to fetch workers.' })
  }
}

// GET /api/workers/:id — single worker profile
export async function getWorkerById(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where:   { id: req.params.id },
      include: {
        workerProfile: true,
        reviewsReceived: {
          include:  { customer: { select: { name: true } } },
          orderBy:  { createdAt: 'desc' },
          take: 10,
        }
      }
    })

    if (!user || !user.workerProfile) {
      return res.status(404).json({ error: 'Worker not found.' })
    }

    res.json({ worker: { ...formatWorker(user), reviews: user.reviewsReceived } })

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch worker.' })
  }
}

// PATCH /api/workers/profile — update own profile (worker only)
export async function updateProfile(req, res) {
  try {
    const schema = z.object({
      category:   z.string().optional(),
      location:   z.string().optional(),
      bio:        z.string().max(500).optional(),
      dailyRate:  z.number().int().min(100).optional(),
      experience: z.number().int().min(0).optional(),
      available:  z.boolean().optional(),
    })

    const data = schema.parse(req.body)

    const profile = await prisma.workerProfile.update({
      where: { userId: req.user.id },
      data,
    })

    res.json({ message: 'Profile updated!', profile })

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    res.status(500).json({ error: 'Update failed.' })
  }
}

// PATCH /api/workers/availability — quick toggle
export async function toggleAvailability(req, res) {
  try {
    const profile = await prisma.workerProfile.findUnique({
      where: { userId: req.user.id }
    })

    const updated = await prisma.workerProfile.update({
      where: { userId: req.user.id },
      data:  { available: !profile.available },
    })

    res.json({ available: updated.available, message: updated.available ? 'You are now open to work!' : 'You are now marked as engaged.' })

  } catch (err) {
    res.status(500).json({ error: 'Failed to update availability.' })
  }
}

// Helper: shape the worker object for API responses
function formatWorker(user) {
  return {
    id:       user.id,
    name:     user.name,
    phone:    user.phone,
    category: user.workerProfile?.category,
    location: user.workerProfile?.location,
    bio:      user.workerProfile?.bio,
    dailyRate:   user.workerProfile?.dailyRate,
    experience:  user.workerProfile?.experience,
    available:   user.workerProfile?.available,
    photoUrl:    user.workerProfile?.photoUrl,
    ratingAvg:   user.workerProfile?.ratingAvg,
    reviewCount: user.workerProfile?.reviewCount,
  }
}
