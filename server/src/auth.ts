import crypto from 'node:crypto'

const SECRET = process.env.PM_SECRET || 'pocket-mentor-dev-secret-change-me'
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

/** scrypt hash, stored as "salt:key". */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const key = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${key}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const expected = Buffer.from(key, 'hex')
  const actual = crypto.scryptSync(password, salt, 64)
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

function sign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
}

/** Minimal HS256 JWT — no extra dependency needed. */
export function signToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, iat: Date.now(), exp: Date.now() + TOKEN_TTL_MS }),
  ).toString('base64url')
  return `${header}.${payload}.${sign(`${header}.${payload}`)}`
}

export function verifyToken(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, payload, signature] = parts
  const expected = sign(`${header}.${payload}`)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub?: string
      exp?: number
    }
    if (!parsed.sub) return null
    if (parsed.exp && Date.now() > parsed.exp) return null
    return parsed.sub
  } catch {
    return null
  }
}
