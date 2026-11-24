import { Router } from 'express'
import { decoratePost, logActivity, q, toPublicUser } from '../helpers.js'
import { currentUserId, optionalAuth, requireAuth } from '../middleware.js'
import { getDB, nowISO, save } from '../store.js'
import { DOMAINS, type Domain, type Role } from '../types.js'

export const usersRouter = Router()

/** GET /api/users — browse people. */
usersRouter.get('/', optionalAuth, (req, res) => {
  const db = getDB()
  const viewer = currentUserId(req)
  const role = q(req.query.role)
  const domain = q(req.query.domain)
  const search = q(req.query.q)?.toLowerCase()
  const limit = Math.min(Number(q(req.query.limit) ?? 60) || 60, 100)

  let users = db.users.slice()
  if (role === 'senior' || role === 'junior') users = users.filter((u) => u.role === (role as Role))
  if (domain && DOMAINS.includes(domain as Domain)) {
    users = users.filter((u) => u.domain === (domain as Domain))
  }
  if (search) {
    users = users.filter((u) =>
      [u.name, u.headline, u.company, u.domain].join(' ').toLowerCase().includes(search),
    )
  }
  if (viewer) users = users.filter((u) => u.id !== viewer)

  const people = users
    .map((u) => toPublicUser(u, viewer))
    .sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0) || b.years - a.years)

  res.json({ users: people.slice(0, limit) })
})

/** GET /api/users/suggested — mentors to reach out to. */
usersRouter.get('/suggested', optionalAuth, (req, res) => {
  const db = getDB()
  const viewer = currentUserId(req)
  const people = db.users
    .filter((u) => u.role === 'senior' && u.id !== viewer)
    .filter((u) => !viewer || !db.follows.some((f) => f.followerId === viewer && f.followingId === u.id))
    .map((u) => toPublicUser(u, viewer))
    .sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0))
  res.json({ users: people.slice(0, 4) })
})

/** GET /api/users/:id — profile plus their posts. */
usersRouter.get('/:id', optionalAuth, (req, res) => {
  const db = getDB()
  const viewer = currentUserId(req)
  const user = db.users.find((u) => u.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'That person is not on Pocket Mentor.' })

  const posts = db.posts
    .filter((p) => p.authorId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((p) => decoratePost(p, viewer))

  const requestStatus = viewer
    ? (db.requests.find(
        (r) =>
          (r.fromId === viewer && r.toId === user.id) || (r.fromId === user.id && r.toId === viewer),
      )?.status ?? null)
    : null

  res.json({ user: toPublicUser(user, viewer), posts, requestStatus })
})

/** POST /api/users/:id/follow — toggle follow. */
usersRouter.post('/:id/follow', requireAuth, (req, res) => {
  const db = getDB()
  const viewer = currentUserId(req)!
  const target = db.users.find((u) => u.id === req.params.id)
  if (!target) return res.status(404).json({ error: 'That person is not on Pocket Mentor.' })
  if (target.id === viewer) return res.status(400).json({ error: 'You cannot follow yourself.' })

  const existing = db.follows.find((f) => f.followerId === viewer && f.followingId === target.id)
  if (existing) {
    db.follows = db.follows.filter(
      (f) => !(f.followerId === viewer && f.followingId === target.id),
    )
    save()
    return res.json({ following: false, followers: db.follows.filter((f) => f.followingId === target.id).length })
  }

  db.follows.push({ followerId: viewer, followingId: target.id, createdAt: nowISO() })
  logActivity({
    type: 'follow',
    actorId: viewer,
    targetUserId: target.id,
    text: `started following ${target.name}`,
  })
  save()
  res.json({ following: true, followers: db.follows.filter((f) => f.followingId === target.id).length })
})
