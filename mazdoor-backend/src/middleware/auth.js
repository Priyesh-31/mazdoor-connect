// src/middleware/auth.js
// This middleware runs BEFORE protected route handlers.
// It checks the token, finds the user, and adds them to req.user.
// Any route that needs login just adds "authenticate" as middleware.

import { verifyToken } from '../services/tokenService.js'
import prisma          from '../config/db.js'

export async function authenticate(req, res, next) {
  // Token comes in the Authorization header as: "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please login.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verify signature and expiry
    const payload = verifyToken(token)

    // Fetch fresh user from DB (catches deleted/banned users)
    const user = await prisma.user.findUnique({
      where:   { id: payload.userId },
      include: { workerProfile: true },  // attach worker profile if exists
    })

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' })
    }

    // Attach user to request — now any controller can access req.user
    req.user = user
    next()  // proceed to the actual route handler

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please login again.' })
    }
    return res.status(401).json({ error: 'Invalid token.' })
  }
}

// Additional middleware — only allows workers through
export function workerOnly(req, res, next) {
  if (req.user.role !== 'WORKER') {
    return res.status(403).json({ error: 'Only workers can access this.' })
  }
  next()
}

// Additional middleware — only allows customers through
export function customerOnly(req, res, next) {
  if (req.user.role !== 'CUSTOMER') {
    return res.status(403).json({ error: 'Only customers can access this.' })
  }
  next()
}
