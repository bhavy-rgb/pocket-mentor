import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from './auth.js'
import { getDB } from './store.js'

export interface AuthedRequest extends Request {
  userId?: string
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) return header.slice(7).trim()
  return null
}

function resolveUser(req: Request): string | null {
  const token = readToken(req)
  if (!token) return null
  const userId = verifyToken(token)
  if (!userId) return null
  return getDB().users.some((u) => u.id === userId) ? userId : null
}

/** Blocks the request with 401 unless a valid bearer token is present. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = resolveUser(req)
  if (!userId) {
    res.status(401).json({ error: 'Please sign in to continue.' })
    return
  }
  ;(req as AuthedRequest).userId = userId
  next()
}

/** Attaches the user when a token is present, but never blocks. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const userId = resolveUser(req)
  if (userId) (req as AuthedRequest).userId = userId
  next()
}

export function currentUserId(req: Request): string | undefined {
  return (req as AuthedRequest).userId
}
