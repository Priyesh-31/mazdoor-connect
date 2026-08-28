// src/routes/jobs.js
import { Router } from 'express'
import {
  createJob, getMyJobs, updateJobStatus, submitReview
} from '../controllers/jobsController.js'
import { authenticate, customerOnly } from '../middleware/auth.js'

const router = Router()

// All job routes require login
router.post('/',               authenticate, customerOnly, createJob)
router.get('/my',              authenticate, getMyJobs)
router.patch('/:id/status',    authenticate, updateJobStatus)
router.post('/reviews',        authenticate, customerOnly, submitReview)

export default router
