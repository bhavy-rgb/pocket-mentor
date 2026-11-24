import { Router } from 'express'
import { decorateComment, decoratePost, logActivity, q } from '../helpers.js'
import { currentUserId, optionalAuth, requireAuth } from '../middleware.js'
import { getDB, nowISO, save, uid } from '../store.js'
import { DOMAINS, type Domain, type Post, type PostKind } from '../types.js'

export const postsRouter = Router()

const KINDS: PostKind[] = ['experience', 'question', 'resource']

/** GET /api/posts — the feed, filterable by domain, kind, author and search. */
postsRouter.get('/', optionalAuth, (req, res) => {
  const db = getDB()
  const viewer = currentUserId(req)
  const domain = q(req.query.domain)
  const kind = q(req.query.kind)
  const authorId = q(req.query.authorId)
  const search = q(req.query.q)?.toLowerCase()
  const sort = q(req.query.sort) ?? 'recent'
  const limit = Math.min(Number(q(req.query.limit) ?? 50) || 50, 100)

  let posts = db.posts.slice()

  if (domain && DOMAINS.includes(domain as Domain)) posts = posts.filter((p) => p.domain === domain)
  if (kind && KINDS.includes(kind as PostKind)) posts = posts.filter((p) => p.kind === kind)
  if (authorId) posts = posts.filter((p) => p.authorId === authorId)
  if (search) {
    posts = posts.filter((p) =>
      [p.title, p.body, p.tags.join(' ')].join(' ').toLowerCase().includes(search),
    )
  }

  const decorated = posts.map((p) => decoratePost(p, viewer))

  if (sort === 'top') decorated.sort((a, b) => b.likeCount - a.likeCount)
  else if (sort === 'discussed') decorated.sort((a, b) => b.commentCount - a.commentCount)
  else decorated.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  res.json({ posts: decorated.slice(0, limit) })
})

/** GET /api/posts/:id */
postsRouter.get('/:id', optionalAuth, (req, res) => {
  const db = getDB()
  const post = db.posts.find((p) => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'That post no longer exists.' })
  res.json({ post: decoratePost(post, currentUserId(req)) })
})

/** POST /api/posts — publish an experience, question or resource. */
postsRouter.post('/', requireAuth, (req, res) => {
  const userId = currentUserId(req)!
  const { title, body, domain, kind, tags } = req.body ?? {}

  if (typeof title !== 'string' || title.trim().length < 4) {
    return res.status(400).json({ error: 'Give your post a title of at least 4 characters.' })
  }
  if (typeof body !== 'string' || body.trim().length < 20) {
    return res.status(400).json({ error: 'Add a little more detail — at least 20 characters.' })
  }
  if (!DOMAINS.includes(domain)) {
    return res.status(400).json({ error: 'Pick a domain: tech, finance, law or news.' })
  }

  const post: Post = {
    id: uid(),
    authorId: userId,
    title: title.trim().slice(0, 160),
    body: body.trim().slice(0, 6000),
    domain: domain as Domain,
    kind: KINDS.includes(kind) ? (kind as PostKind) : 'experience',
    tags: Array.isArray(tags)
      ? tags
          .filter((t): t is string => typeof t === 'string')
          .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
          .filter(Boolean)
          .slice(0, 5)
      : [],
    likes: [],
    createdAt: nowISO(),
  }

  getDB().posts.unshift(post)
  logActivity({
    type: 'post',
    actorId: userId,
    postId: post.id,
    text: `posted in ${post.domain}`,
  })
  save()

  res.status(201).json({ post: decoratePost(post, userId) })
})

/** DELETE /api/posts/:id — author only. */
postsRouter.delete('/:id', requireAuth, (req, res) => {
  const db = getDB()
  const post = db.posts.find((p) => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'That post no longer exists.' })
  if (post.authorId !== currentUserId(req)) {
    return res.status(403).json({ error: 'You can only delete your own posts.' })
  }
  db.posts = db.posts.filter((p) => p.id !== post.id)
  db.comments = db.comments.filter((c) => c.postId !== post.id)
  db.activities = db.activities.filter((a) => a.postId !== post.id)
  save()
  res.json({ ok: true })
})

/** POST /api/posts/:id/like — toggle. */
postsRouter.post('/:id/like', requireAuth, (req, res) => {
  const db = getDB()
  const userId = currentUserId(req)!
  const post = db.posts.find((p) => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'That post no longer exists.' })

  if (post.likes.includes(userId)) post.likes = post.likes.filter((id) => id !== userId)
  else post.likes.push(userId)
  save()

  res.json({ liked: post.likes.includes(userId), likeCount: post.likes.length })
})

/** GET /api/posts/:id/comments — suggestions on a post. */
postsRouter.get('/:id/comments', (req, res) => {
  const db = getDB()
  const comments = db.comments
    .filter((c) => c.postId === req.params.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((c) => decorateComment(c.id))
  res.json({ comments })
})

/** POST /api/posts/:id/comments — add a suggestion. */
postsRouter.post('/:id/comments', requireAuth, (req, res) => {
  const db = getDB()
  const userId = currentUserId(req)!
  const post = db.posts.find((p) => p.id === req.params.id)
  if (!post) return res.status(404).json({ error: 'That post no longer exists.' })

  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : ''
  if (body.length < 2) return res.status(400).json({ error: 'Write a suggestion first.' })

  const comment = {
    id: uid(),
    postId: post.id,
    authorId: userId,
    body: body.slice(0, 2000),
    createdAt: nowISO(),
  }
  db.comments.push(comment)
  logActivity({
    type: 'comment',
    actorId: userId,
    postId: post.id,
    text: 'added a suggestion',
  })
  save()

  res.status(201).json({ comment: decorateComment(comment.id) })
})
