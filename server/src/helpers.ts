import { getDB, nowISO, uid } from './store.js'
import type { Activity, ActivityType, Post, PublicUser, User } from './types.js'

/** Small helper for reading a single string out of req.query / req.body. */
export function q(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

export function toPublicUser(user: User, viewerId?: string): PublicUser {
  const db = getDB()
  const { passwordHash: _hash, ...rest } = user
  return {
    ...rest,
    followers: db.follows.filter((f) => f.followingId === user.id).length,
    following: db.follows.filter((f) => f.followerId === user.id).length,
    postCount: db.posts.filter((p) => p.authorId === user.id).length,
    isFollowing: viewerId
      ? db.follows.some((f) => f.followerId === viewerId && f.followingId === user.id)
      : false,
  }
}

/** Compact author card embedded in a post or message. */
export function authorSummary(user: User) {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    domain: user.domain,
    headline: user.headline,
    years: user.years,
    company: user.company,
  }
}

export function decoratePost(post: Post, viewerId?: string) {
  const db = getDB()
  const author = db.users.find((u) => u.id === post.authorId)
  return {
    ...post,
    likeCount: post.likes.length,
    liked: viewerId ? post.likes.includes(viewerId) : false,
    commentCount: db.comments.filter((c) => c.postId === post.id).length,
    author: author ? authorSummary(author) : null,
  }
}

export function decorateComment(commentId: string) {
  const db = getDB()
  const comment = db.comments.find((c) => c.id === commentId)
  if (!comment) return null
  const author = db.users.find((u) => u.id === comment.authorId)
  return { ...comment, author: author ? authorSummary(author) : null }
}

export function logActivity(input: {
  type: ActivityType
  actorId: string
  text: string
  postId?: string
  targetUserId?: string
}): Activity {
  const db = getDB()
  const activity: Activity = {
    id: uid(),
    type: input.type,
    actorId: input.actorId,
    postId: input.postId,
    targetUserId: input.targetUserId,
    text: input.text,
    createdAt: nowISO(),
  }
  db.activities.unshift(activity)
  if (db.activities.length > 300) db.activities.length = 300
  return activity
}

export function findConversationBetween(a: string, b: string) {
  return getDB().conversations.find(
    (c) => c.members.length === 2 && c.members.includes(a) && c.members.includes(b),
  )
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}
