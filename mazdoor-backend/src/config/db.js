// src/config/db.js
// One Prisma client instance shared across the entire app.
// Importing this file anywhere gives you database access.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']  // show SQL queries in dev
    : ['error'],                   // only errors in production
})

export default prisma
