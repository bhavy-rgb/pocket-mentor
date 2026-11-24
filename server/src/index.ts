import path from 'node:path'
import fs from 'node:fs'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { usersRouter } from './routes/users.js'
import { postsRouter } from './routes/posts.js'
import { requestsRouter } from './routes/requests.js'
import { dmRouter } from './routes/dm.js'
import { activityRouter } from './routes/activity.js'
import { dbPath, getDB } from './store.js'
import { DOMAINS, DOMAIN_LABEL } from './types.js'

const app = express()
const PORT = Number(process.env.PORT ?? 4000)

app.use(cors())
app.use(express.json({ limit: '256kb' }))

app.get('/api/health', (_req, res) => {
  const db = getDB()
  res.json({
    ok: true,
    service: 'pocket-mentor-api',
    members: db.users.length,
    posts: db.posts.length,
    dataFile: path.basename(dbPath()),
    uptime: Math.round(process.uptime()),
  })
})

app.get('/api/meta', (_req, res) => {
  res.json({
    domains: DOMAINS.map((domain) => ({ id: domain, label: DOMAIN_LABEL[domain] })),
    kinds: [
      { id: 'experience', label: 'Experience' },
      { id: 'question', label: 'Question' },
      { id: 'resource', label: 'Notes / resource' },
    ],
  })
})

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/posts', postsRouter)
app.use('/api/requests', requestsRouter)
app.use('/api/dm', dmRouter)
app.use('/api/activity', activityRouter)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Unknown API route.' })
})

// In production (`npm run build && npm start`) the API also serves the built client.
const webDir = path.join(process.cwd(), 'dist', 'web')
if (fs.existsSync(webDir)) {
  app.use(express.static(webDir))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDir, 'index.html'))
  })
}

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[api] unhandled error:', err.message)
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
})

app.listen(PORT, () => {
  getDB()
  console.log(`Pocket Mentor API listening on http://localhost:${PORT}`)
  console.log(`Data file: ${dbPath()}`)
})
