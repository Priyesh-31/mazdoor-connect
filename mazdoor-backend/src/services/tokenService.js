// src/services/tokenService.js
// JWT = JSON Web Token. It's a signed string that proves who the user is.
// After login, we give the user a token. They send it with every request.
// We verify it to know who is making the request — no session/cookie needed.

import jwt from 'jsonwebtoken'

// Create a token with the user's id and role inside it
export function createToken(user) {
  return jwt.sign(
    // "Payload" — what we store inside the token
    {
      userId: user.id,
      phone:  user.phone,
      role:   user.role,
    },
    process.env.JWT_SECRET,         // secret key — only our server knows this
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Decode and verify a token — returns the payload or throws an error
export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
  // Throws JsonWebTokenError if tampered
  // Throws TokenExpiredError if expired
}
