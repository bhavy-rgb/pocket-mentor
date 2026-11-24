import { Router } from 'express'
import { authorSummary, findConversationBetween, logActivity, q } from '../helpers.js'
import { currentUserId, requireAuth } from '../middleware.js'
import { getDB, nowISO, save, uid } from '../store.js'
import type { Conversation, Message, MentorRequest } from '../types.js'

export const requestsRouter = Router()

function decorate(request: MentorRequest) {
  const db = getDB()
  const from = db.users.find((u) => u.id === request.fromId)
  const to = db.users.find((u) => u.id === request.toId)
  return {
    ...request,
    from: from ? authorSummary(from) : null,
    to: to ? authorSummary(to) : null,
  }
}

/** POST /api/requests — a junior asks a senior for mentorship. */
requestsRouter.post('/', requireAuth, (req, res) => {
  const db = getDB()
  const userId = currentUserId(req)!
  const { toId, message } = req.body ?? {}

  if (typeof toId !== 'string') return res.status(400).json({ error: 'Pick someone to ask.' })
  if (toId === userId) return res.status(400).json({ error: 'You cannot request yourself.' })

  const target = db.users.find((u) => u.id === toId)
  if (!target) return res.status(404).json({ error: 'That person is not on Pocket Mentor.' })
  if (target.role !== 'senior') {
    return res.status(400).json({ error: 'Mentor requests go to senior members only.' })
  }
  if (typeof message !== 'string' || message.trim().length < 15) {
    return res.status(400).json({ error: 'Write a short note (15+ characters) about what you need help with.' })
  }

  const existing = db.requests.find(
    (r) => r.fromId === userId && r.toId === toId && r.status !== 'declined',
  )
  if (existing) {
    return res.status(409).json({
      error:
        existing.status === 'accepted'
          ? 'You are already connected with this mentor. Open your messages.'
          : 'You already have a pending request with this mentor.',
    })
  }

  const request: MentorRequest = {
    id: uid(),
    fromId: userId,
    toId,
    message: message.trim().slice(0, 1000),
    status: 'pending',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }
  db.requests.unshift(request)
  logActivity({
    type: 'request',
    actorId: userId,
    targetUserId: toId,
    text: `sent a mentorship request to ${target.name}`,
  })
  save()

  res.status(201).json({ request: decorate(request) })
})

/** GET /api/requests?box=incoming|outgoing */
requestsRouter.get('/', requireAuth, (req, res) => {
  const db = getDB()
  const userId = currentUserId(req)!
  const box = q(req.query.box) ?? 'incoming'
  const rows = db.requests
    .filter((r) => (box === 'outgoing' ? r.fromId === userId : r.toId === userId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(decorate)
  res.json({ requests: rows })
})

/** PATCH /api/requests/:id — accept or decline (recipient only). */
requestsRouter.patch('/:id', requireAuth, (req, res) => {
  const db = getDB()
  const userId = currentUserId(req)!
  const request = db.requests.find((r) => r.id === req.params.id)
  if (!request) return res.status(404).json({ error: 'That request no longer exists.' })
  if (request.toId !== userId) {
    return res.status(403).json({ error: 'Only the mentor can answer this request.' })
  }

  const status = req.body?.status
  if (status !== 'accepted' && status !== 'declined') {
    return res.status(400).json({ error: 'Status must be accepted or declined.' })
  }

  request.status = status
  request.updatedAt = nowISO()

  if (status === 'accepted') {
    const junior = db.users.find((u) => u.id === request.fromId)
    let conversation: Conversation | undefined = findConversationBetween(request.fromId, request.toId)
    if (!conversation) {
      conversation = {
        id: uid(),
        members: [request.fromId, request.toId],
        createdAt: nowISO(),
        updatedAt: nowISO(),
      }
      db.conversations.push(conversation)
    }
    const opener: Message = {
      id: uid(),
      conversationId: conversation.id,
      senderId: request.toId,
      body: `Accepted your request${junior ? `, ${junior.name.split(' ')[0]}` : ''}. Happy to help. What would you like to start with?`,
      createdAt: nowISO(),
      readBy: [request.toId],
    }
    db.messages.push(opener)
    conversation.updatedAt = nowISO()
    logActivity({
      type: 'accepted',
      actorId: request.toId,
      targetUserId: request.fromId,
      text: 'accepted a mentorship request',
    })
  }

  save()
  res.json({ request: decorate(request) })
})
