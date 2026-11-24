import { Router } from 'express'
import { authorSummary, q } from '../helpers.js'
import { getDB } from '../store.js'
import { DOMAINS, type Domain } from '../types.js'

export const activityRouter = Router()

/** GET /api/activity — "what's happening" ticker. */
activityRouter.get('/', (req, res) => {
  const db = getDB()
  const limit = Math.min(Number(q(req.query.limit) ?? 12) || 12, 40)
  const rows = db.activities.slice(0, limit).map((a) => {
    const actor = db.users.find((u) => u.id === a.actorId)
    const post = a.postId ? db.posts.find((p) => p.id === a.postId) : undefined
    return {
      id: a.id,
      type: a.type,
      text: a.text,
      createdAt: a.createdAt,
      actor: actor ? authorSummary(actor) : null,
      postTitle: post?.title ?? null,
      postId: post?.id ?? null,
    }
  })
  res.json({ activity: rows })
})

/** GET /api/activity/stats — numbers for the animated charts. */
activityRouter.get('/stats', (_req, res) => {
  const db = getDB()
  const dayMs = 24 * 60 * 60 * 1000
  const now = Date.now()

  const postsPerDomain = DOMAINS.map((domain) => ({
    domain: domain as Domain,
    posts: db.posts.filter((p) => p.domain === domain).length,
    mentors: db.users.filter((u) => u.domain === domain && u.role === 'senior').length,
  }))

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const dayStart = now - (6 - index) * dayMs
    const label = new Date(dayStart).toLocaleDateString('en-IN', { weekday: 'short' })
    const count = db.posts.filter((p) => {
      const created = new Date(p.createdAt).getTime()
      return created >= dayStart - dayMs / 2 && created < dayStart + dayMs / 2
    }).length
    return { label, count }
  })

  res.json({
    totals: {
      members: db.users.length,
      mentors: db.users.filter((u) => u.role === 'senior').length,
      juniors: db.users.filter((u) => u.role === 'junior').length,
      posts: db.posts.length,
      suggestions: db.comments.length,
      connections: db.requests.filter((r) => r.status === 'accepted').length,
      pending: db.requests.filter((r) => r.status === 'pending').length,
    },
    postsPerDomain,
    last7Days,
  })
})
