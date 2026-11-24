import { Router } from 'express'
import { authorSummary } from '../helpers.js'
import { currentUserId, requireAuth } from '../middleware.js'
import { getDB, nowISO, save, uid } from '../store.js'
import type { Conversation, Message } from '../types.js'

export const dmRouter = Router()

function peerOf(conversation: Conversation, me: string) {
  const db = getDB()
  const peerId = conversation.members.find((m) => m !== me) ?? conversation.members[0]
  const user = db.users.find((u) => u.id === peerId)
  return user ? authorSummary(user) : null
}

/** GET /api/dm/conversations — inbox, newest first. */
dmRouter.get('/conversations', requireAuth, (req, res) => {
  const db = getDB()
  const me = currentUserId(req)!

  const rows = db.conversations
    .filter((c) => c.members.includes(me))
    .map((c) => {
      const messages = db.messages
        .filter((m) => m.conversationId === c.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      const last = messages[messages.length - 1]
      return {
        id: c.id,
        peer: peerOf(c, me),
        lastMessage: last ? { body: last.body, senderId: last.senderId, createdAt: last.createdAt } : null,
        unread: messages.filter((m) => m.senderId !== me && !(m.readBy ?? []).includes(me)).length,
        updatedAt: last?.createdAt ?? c.updatedAt,
      }
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  res.json({ conversations: rows })
})

/** POST /api/dm/conversations — open (or reuse) a thread with someone. */
dmRouter.post('/conversations', requireAuth, (req, res) => {
  const db = getDB()
  const me = currentUserId(req)!
  const { userId } = req.body ?? {}
  if (typeof userId !== 'string') return res.status(400).json({ error: 'Pick someone to message.' })
  if (userId === me) return res.status(400).json({ error: 'You cannot message yourself.' })
  if (!db.users.some((u) => u.id === userId)) {
    return res.status(404).json({ error: 'That person is not on Pocket Mentor.' })
  }

  let conversation = db.conversations.find(
    (c) => c.members.length === 2 && c.members.includes(me) && c.members.includes(userId),
  )
  if (!conversation) {
    conversation = { id: uid(), members: [me, userId], createdAt: nowISO(), updatedAt: nowISO() }
    db.conversations.push(conversation)
    save()
  }
  res.json({ conversation: { id: conversation.id, peer: peerOf(conversation, me) } })
})

/** GET /api/dm/conversations/:id/messages — also marks the thread read. */
dmRouter.get('/conversations/:id/messages', requireAuth, (req, res) => {
  const db = getDB()
  const me = currentUserId(req)!
  const conversation = db.conversations.find((c) => c.id === req.params.id)
  if (!conversation || !conversation.members.includes(me)) {
    return res.status(404).json({ error: 'Conversation not found.' })
  }

  const messages = db.messages
    .filter((m) => m.conversationId === conversation.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((m) => {
      const sender = db.users.find((u) => u.id === m.senderId)
      return {
        id: m.id,
        body: m.body,
        senderId: m.senderId,
        createdAt: m.createdAt,
        mine: m.senderId === me,
        sender: sender ? authorSummary(sender) : null,
      }
    })

  let changed = false
  for (const m of db.messages) {
    if (m.conversationId === conversation.id && m.senderId !== me) {
      if (!(m.readBy ?? []).includes(me)) {
        m.readBy = [...(m.readBy ?? []), me]
        changed = true
      }
    }
  }
  if (changed) save()

  res.json({ conversation: { id: conversation.id, peer: peerOf(conversation, me) }, messages })
})

/** POST /api/dm/conversations/:id/messages */
dmRouter.post('/conversations/:id/messages', requireAuth, (req, res) => {
  const db = getDB()
  const me = currentUserId(req)!
  const conversation = db.conversations.find((c) => c.id === req.params.id)
  if (!conversation || !conversation.members.includes(me)) {
    return res.status(404).json({ error: 'Conversation not found.' })
  }

  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : ''
  if (!body) return res.status(400).json({ error: 'Type a message first.' })

  const message: Message = {
    id: uid(),
    conversationId: conversation.id,
    senderId: me,
    body: body.slice(0, 4000),
    createdAt: nowISO(),
    readBy: [me],
  }
  db.messages.push(message)
  conversation.updatedAt = message.createdAt
  save()

  const sender = db.users.find((u) => u.id === me)
  res.status(201).json({
    message: {
      id: message.id,
      body: message.body,
      senderId: me,
      createdAt: message.createdAt,
      mine: true,
      sender: sender ? authorSummary(sender) : null,
    },
  })
})
