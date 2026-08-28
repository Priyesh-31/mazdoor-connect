// src/routes/workers.js
import { Router } from 'express'
import {
  getWorkers, getWorkerById, updateProfile, toggleAvailability
} from '../controllers/workersController.js'
import { authenticate, workerOnly } from '../middleware/auth.js'

const router = Router()

// Public — anyone can browse workers
router.get('/',    getWorkers)
router.get('/:id', getWorkerById)

// Protected — only logged-in workers
router.patch('/profile',      authenticate, workerOnly, updateProfile)
router.patch('/availability', authenticate, workerOnly, toggleAvailability)

export default router
