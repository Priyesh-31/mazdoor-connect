// src/services/otpService.js
// ALL OTP logic lives here — generation, SMS sending, verification.
// Controllers call this service. They never touch Twilio directly.

import twilio    from 'twilio'
import bcrypt    from 'bcryptjs'
import prisma    from '../config/db.js'

// Twilio client — only created once
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// ── 1. Generate a random N-digit OTP ──────────────────────
function generateOTP(length = 4) {
  const min = Math.pow(10, length - 1)      // 1000
  const max = Math.pow(10, length) - 1      // 9999
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

// ── 2. Send OTP via SMS using Twilio ──────────────────────
export async function sendOTP(phone) {
  const otpLength  = parseInt(process.env.OTP_LENGTH)         || 4
  const expiryMins = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10

  const code      = generateOTP(otpLength)
  const expiresAt = new Date(Date.now() + expiryMins * 60 * 1000)

  // Hash the OTP before storing — same reason you hash passwords
  // Even if the database is compromised, raw OTPs aren't exposed
  const hashedCode = await bcrypt.hash(code, 10)

  // Invalidate any previous unused OTPs for this phone
  await prisma.oTP.updateMany({
    where: { phone, used: false },
    data:  { used: true },
  })

  // Store the new hashed OTP
  await prisma.oTP.create({
    data: { phone, code: hashedCode, expiresAt },
  })

  // In development: skip SMS, just log the OTP to terminal
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n🔐 OTP for ${phone}: ${code}\n`)
    return { success: true, dev_otp: code }
  }

  // In production: send real SMS via Twilio
  await twilioClient.messages.create({
    body: `Your MazdoorConnect OTP is: ${code}. Valid for ${expiryMins} minutes. Do not share with anyone.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to:   phone,
  })

  return { success: true }
}

// ── 3. Verify OTP entered by user ─────────────────────────
export async function verifyOTP(phone, enteredCode) {
  // Find the most recent unused, unexpired OTP for this phone
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      phone,
      used:      false,
      expiresAt: { gt: new Date() },   // gt = greater than (not expired)
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otpRecord) {
    return { valid: false, reason: 'OTP expired or not found. Please request a new one.' }
  }

  // Compare entered code against the hashed stored code
  const isMatch = await bcrypt.compare(enteredCode, otpRecord.code)

  if (!isMatch) {
    return { valid: false, reason: 'Incorrect OTP. Please try again.' }
  }

  // Mark OTP as used so it can't be reused
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data:  { used: true },
  })

  return { valid: true }
}
