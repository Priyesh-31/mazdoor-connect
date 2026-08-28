// src/controllers/jobsController.js
import prisma from '../config/db.js'
import { z }  from 'zod'

// POST /api/jobs — customer creates a job request
export async function createJob(req, res) {
  try {
    const schema = z.object({
      workerId:    z.string(),
      title:       z.string().min(5).max(200),
      description: z.string().max(1000).optional(),
      agreedRate:  z.number().int().positive().optional(),
      scheduledAt: z.string().optional(),
    })

    const data = schema.parse(req.body)

    // Verify worker exists
    const worker = await prisma.workerProfile.findUnique({ where: { id: data.workerId } })
    if (!worker) return res.status(404).json({ error: 'Worker not found.' })

    const job = await prisma.job.create({
      data: {
        title:       data.title,
        description: data.description,
        agreedRate:  data.agreedRate,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        customerId:  req.user.id,
        workerId:    data.workerId,
      },
      include: {
        customer: { select: { name: true, phone: true } },
        worker:   { include: { user: { select: { name: true } } } },
      }
    })

    res.status(201).json({ message: 'Job request sent!', job })

  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    res.status(500).json({ error: 'Failed to create job.' })
  }
}

// GET /api/jobs/my — get current user's jobs
export async function getMyJobs(req, res) {
  try {
    let jobs

    if (req.user.role === 'CUSTOMER') {
      jobs = await prisma.job.findMany({
        where:   { customerId: req.user.id },
        include: { worker: { include: { user: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      // Worker sees jobs assigned to their profile
      jobs = await prisma.job.findMany({
        where:   { worker: { userId: req.user.id } },
        include: { customer: { select: { name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      })
    }

    res.json({ jobs })

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs.' })
  }
}

// PATCH /api/jobs/:id/status — worker updates job status
export async function updateJobStatus(req, res) {
  try {
    const { status } = z.object({
      status: z.enum(['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    }).parse(req.body)

    const job = await prisma.job.findUnique({
      where:   { id: req.params.id },
      include: { worker: true }
    })

    if (!job) return res.status(404).json({ error: 'Job not found.' })

    // Only the assigned worker can update status
    if (job.worker.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this job.' })
    }

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data:  {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      }
    })

    res.json({ message: 'Job status updated!', job: updated })

  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    res.status(500).json({ error: 'Update failed.' })
  }
}

// POST /api/reviews — customer submits review after job
export async function submitReview(req, res) {
  try {
    const schema = z.object({
      jobId:   z.string(),
      rating:  z.number().int().min(1).max(5),
      comment: z.string().max(500).optional(),
    })

    const { jobId, rating, comment } = schema.parse(req.body)

    const job = await prisma.job.findUnique({
      where:   { id: jobId },
      include: { worker: true }
    })

    if (!job) return res.status(404).json({ error: 'Job not found.' })
    if (job.customerId !== req.user.id) return res.status(403).json({ error: 'Not your job.' })
    if (job.status !== 'COMPLETED') return res.status(400).json({ error: 'Can only review completed jobs.' })

    // Create review and update worker's rating average in one transaction
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          rating, comment,
          jobId,
          workerId:   job.worker.userId,
          customerId: req.user.id,
        }
      })

      // Recalculate average rating for the worker
      const allReviews = await tx.review.findMany({
        where:  { workerId: job.worker.userId },
        select: { rating: true }
      })

      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

      await tx.workerProfile.update({
        where: { userId: job.worker.userId },
        data:  {
          ratingAvg:   Math.round(avg * 10) / 10,  // e.g. 4.7
          reviewCount: allReviews.length,
        }
      })

      return newReview
    })

    res.status(201).json({ message: 'Review submitted. Thank you!', review })

  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    res.status(500).json({ error: 'Failed to submit review.' })
  }
}
