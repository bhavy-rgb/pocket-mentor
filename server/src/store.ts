import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import type { DB } from './types.js'
import { buildSeed } from './seed.js'

const DATA_DIR = process.env.PM_DATA_DIR
  ? path.resolve(process.env.PM_DATA_DIR)
  : path.join(process.cwd(), 'server', 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

let cache: DB | null = null

export function uid(): string {
  return crypto.randomUUID()
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function getDB(): DB {
  if (cache) return cache
  fs.mkdirSync(DATA_DIR, { recursive: true })
  if (fs.existsSync(DB_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) as DB
      return cache
    } catch {
      console.warn('[store] db.json was unreadable, reseeding')
    }
  }
  cache = buildSeed()
  save()
  return cache
}

export function save(): void {
  if (!cache) return
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const tmp = `${DB_FILE}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(cache, null, 2))
  fs.renameSync(tmp, DB_FILE)
}

export function resetDB(): DB {
  cache = buildSeed()
  save()
  return cache
}

export function dbPath(): string {
  return DB_FILE
}
