import { Router } from 'express'
import { hashPassword, signToken, verifyPassword } from '../auth.js'
import { isValidEmail, logActivity, toPublicUser } from '../helpers.js'
import { currentUserId, requireAuth } from '../middleware.js'
import { getDB, nowISO, save, uid } from '../store.js'
import { DOMAINS, type Domain, type Role, type User } from '../types.js'

export const authRouter = Router()

const AVATARS = ['mint', 'amber', 'violet', 'sky', 'rose', 'lime']

authRouter.post('/signup', (req, res) => {
  const { name, email, password, role, domain, headline, company, years } = req.body ?? {}

  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Please enter your full name.' })
  }
  if (typeof email !== 'string' || !isValidEmail(email.trim())) {
    return res.status(400).json({ error: 'That email address does not look right.' })
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password needs at least 8 characters.' })
  }
  const safeRole: Role = role === 'senior' ? 'senior' : 'junior'
  const safeDomain: Domain = DOMAINS.includes(domain) ? (domain as Domain) : 'tech'

  const db = getDB()
  const exists = db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (exists) {
    return res.status(409).json({ error: 'An account with this email already exists. Try signing in.' })
  }

  const user: User = {
    id: uid(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    role: safeRole,
    domain: safeDomain,
    headline:
      typeof headline === 'string' && headline.trim()
        ? headline.trim()
        : safeRole === 'senior'
          ? `Senior mentor in ${safeDomain}`
          : `Learning ${safeDomain}`,
    bio: '',
    years: Number.isFinite(Number(years)) ? Math.max(0, Math.min(40, Number(years))) : 0,
    company: typeof company === 'string' ? company.trim() : '',
    avatar: AVATARS[db.users.length % AVATARS.length],
    createdAt: nowISO(),
  }

  db.users.push(user)
  logActivity({
    type: 'signup',
    actorId: user.id,
    text: `joined Pocket Mentor as a ${safeRole}`,
  })
  save()

  res.status(201).json({ token: signToken(user.id), user: toPublicUser(user, user.id) })
})

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' })
  }
  const db = getDB()
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Email or password is incorrect.' })
  }
  res.json({ token: signToken(user.id), user: toPublicUser(user, user.id) })
})

authRouter.get('/me', requireAuth, (req, res) => {
  const db = getDB()
  const user = db.users.find((u) => u.id === currentUserId(req))
  if (!user) return res.status(404).json({ error: 'Account not found.' })
  res.json({ user: toPublicUser(user, user.id) })
})

authRouter.patch('/me', requireAuth, (req, res) => {
  const db = getDB()
  const user = db.users.find((u) => u.id === currentUserId(req))
  if (!user) return res.status(404).json({ error: 'Account not found.' })

  const { name, headline, bio, domain, years, company, role } = req.body ?? {}
  if (typeof name === 'string' && name.trim().length >= 2) user.name = name.trim()
  if (typeof headline === 'string') user.headline = headline.trim().slice(0, 160)
  if (typeof bio === 'string') user.bio = bio.trim().slice(0, 1200)
  if (typeof company === 'string') user.company = company.trim().slice(0, 80)
  if (DOMAINS.includes(domain)) user.domain = domain as Domain
  if (role === 'junior' || role === 'senior') user.role = role
  if (years !== undefined && Number.isFinite(Number(years))) {
    user.years = Math.max(0, Math.min(40, Number(years)))
  }
  save()
  res.json({ user: toPublicUser(user, user.id) })
})
