// src/routes/auth.js
import { Router } from 'express'
import {
  sendOTPHandler, registerWorker, registerCustomer, login, getMe
} from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Public routes — no token needed
router.post('/send-otp',          sendOTPHandler)
router.post('/register/worker',   registerWorker)
router.post('/register/customer', registerCustomer)
router.post('/login',             login)

// Protected route — token required
router.get('/me', authenticate, getMe)

export default router
