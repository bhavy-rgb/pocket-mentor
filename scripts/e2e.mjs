/**
 * End-to-end check against a running API.
 *   npm run dev:api        (in one terminal)
 *   node scripts/e2e.mjs   (in another)
 * Exits non-zero if any step fails.
 */
const BASE = process.env.PM_BASE ?? 'http://localhost:4000'

let passed = 0
let failed = 0

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1
    console.log(`  ok   ${name}`)
  } else {
    failed += 1
    console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

async function call(path, { method = 'GET', body, token } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  return { status: response.status, data }
}

const stamp = Date.now().toString().slice(-6)

async function main() {
  console.log(`\nPocket Mentor e2e → ${BASE}\n`)

  const health = await call('/health')
  check('health endpoint answers', health.status === 200 && health.data?.ok === true)
  check('seed data is present', (health.data?.posts ?? 0) > 0, `posts=${health.data?.posts}`)

  const signup = await call('/auth/signup', {
    method: 'POST',
    body: {
      name: `Test Junior ${stamp}`,
      email: `junior${stamp}@test.dev`,
      password: 'testpass123',
      role: 'junior',
      domain: 'tech',
      years: 0,
      headline: 'e2e test account',
    },
  })
  check('signup returns a token', signup.status === 201 && Boolean(signup.data?.token), JSON.stringify(signup.data))
  const junior = signup.data
  const juniorToken = junior?.token
  const juniorId = junior?.user?.id

  const dupe = await call('/auth/signup', {
    method: 'POST',
    body: {
      name: 'Dupe',
      email: `junior${stamp}@test.dev`,
      password: 'testpass123',
      role: 'junior',
      domain: 'tech',
    },
  })
  check('duplicate email is rejected with 409', dupe.status === 409)

  const badLogin = await call('/auth/login', {
    method: 'POST',
    body: { email: `junior${stamp}@test.dev`, password: 'wrong-password' },
  })
  check('wrong password is rejected with 401', badLogin.status === 401)

  const me = await call('/auth/me', { token: juniorToken })
  check('token identifies the new user', me.data?.user?.id === juniorId)

  const post = await call('/posts', {
    method: 'POST',
    token: juniorToken,
    body: {
      title: 'E2E: how do I pick my first backend project?',
      body: 'I know Node and SQL basics. Should I build a small URL shortener or a job queue first? Looking for a concrete order.',
      domain: 'tech',
      kind: 'question',
      tags: ['backend', 'projects'],
    },
  })
  check('post is created', post.status === 201 && Boolean(post.data?.post?.id), JSON.stringify(post.data))
  const postId = post.data?.post?.id

  const shortPost = await call('/posts', {
    method: 'POST',
    token: juniorToken,
    body: { title: 'ok', body: 'too short', domain: 'tech' },
  })
  check('a too-short post is rejected with 400', shortPost.status === 400)

  const feed = await call('/posts?domain=tech&sort=recent')
  check('feed contains the new post', feed.data?.posts?.some((row) => row.id === postId))

  const filtered = await call('/posts?domain=law')
  check(
    'domain filter only returns that domain',
    filtered.data?.posts?.every((row) => row.domain === 'law'),
  )

  const search = await call(`/posts?q=${encodeURIComponent('first backend project')}`)
  check('search finds the post', search.data?.posts?.some((row) => row.id === postId))

  const like = await call(`/posts/${postId}/like`, { method: 'POST', token: juniorToken })
  check('like toggles on', like.data?.liked === true && like.data?.likeCount >= 1)
  const unlike = await call(`/posts/${postId}/like`, { method: 'POST', token: juniorToken })
  check('like toggles off', unlike.data?.liked === false)

  const mentorLogin = await call('/auth/login', {
    method: 'POST',
    body: { email: 'meera@pocket.dev', password: 'demo1234' },
  })
  const mentorToken = mentorLogin.data?.token
  check('seeded mentor can sign in', Boolean(mentorToken))

  const comment = await call(`/posts/${postId}/comments`, {
    method: 'POST',
    token: mentorToken,
    body: { body: 'Build the URL shortener first — it forces you to think about caching and p99 latency.' },
  })
  check('suggestion is added', comment.status === 201 && Boolean(comment.data?.comment?.id))

  const comments = await call(`/posts/${postId}/comments`)
  check('suggestion shows on the post', comments.data?.comments?.length === 1)
  check('suggestion carries its author', comments.data?.comments?.[0]?.author?.name === 'Meera Raghavan')

  const detail = await call(`/posts/${postId}`, { token: mentorToken })
  check('post detail counts the suggestion', detail.data?.post?.commentCount === 1)

  const request = await call('/requests', {
    method: 'POST',
    token: juniorToken,
    body: { toId: 'u_meera', message: 'Could you sanity-check my first-project plan? I am a 3rd year student.' },
  })
  check('mentor request is created', request.status === 201 && request.data?.request?.status === 'pending', JSON.stringify(request.data))
  const requestId = request.data?.request?.id

  const duplicateRequest = await call('/requests', {
    method: 'POST',
    token: juniorToken,
    body: { toId: 'u_meera', message: 'Sending the same request again to check the guard.' },
  })
  check('duplicate request is rejected with 409', duplicateRequest.status === 409)

  const incoming = await call('/requests?box=incoming', { token: mentorToken })
  check('mentor sees the request in their inbox', incoming.data?.requests?.some((row) => row.id === requestId))

  const forbidden = await call(`/requests/${requestId}`, {
    method: 'PATCH',
    token: juniorToken,
    body: { status: 'accepted' },
  })
  check('only the mentor can answer (403)', forbidden.status === 403)

  const accept = await call(`/requests/${requestId}`, {
    method: 'PATCH',
    token: mentorToken,
    body: { status: 'accepted' },
  })
  check('mentor accepts the request', accept.data?.request?.status === 'accepted')

  const conversations = await call('/dm/conversations', { token: juniorToken })
  const conversation = conversations.data?.conversations?.find((row) => row.peer?.id === 'u_meera')
  check('accepting opens a DM thread', Boolean(conversation), JSON.stringify(conversations.data?.conversations?.map((c) => c.peer?.name)))
  check('thread starts with the mentor message', Boolean(conversation?.lastMessage?.body))

  const message = await call(`/dm/conversations/${conversation?.id}/messages`, {
    method: 'POST',
    token: juniorToken,
    body: { body: 'Thank you — starting with the URL shortener tonight.' },
  })
  check('junior can reply in the thread', message.status === 201 && message.data?.message?.mine === true)

  const thread = await call(`/dm/conversations/${conversation?.id}/messages`, { token: mentorToken })
  check('mentor sees both messages', thread.data?.messages?.length >= 2)
  const mentorOwn = thread.data?.messages?.find((row) => row.senderId === 'u_meera')
  const juniorReply = thread.data?.messages?.find((row) => row.senderId === juniorId)
  check('mentor sees their own message as mine', mentorOwn?.mine === true)
  check("mentor sees the junior's reply as not mine", juniorReply?.mine === false)

  const outsider = await call(`/dm/conversations/${conversation?.id}/messages`, {
    token: (await call('/auth/login', { method: 'POST', body: { email: 'kabir@pocket.dev', password: 'demo1234' } })).data?.token,
  })
  check('a non-member cannot read the thread (404)', outsider.status === 404)

  const follow = await call('/users/u_meera/follow', { method: 'POST', token: juniorToken })
  check('follow toggles on', follow.data?.following === true)
  const unfollow = await call('/users/u_meera/follow', { method: 'POST', token: juniorToken })
  check('follow toggles off', unfollow.data?.following === false)

  const people = await call('/users?role=senior')
  check('people list returns mentors only', people.data?.users?.every((row) => row.role === 'senior'))

  const stats = await call('/activity/stats')
  check('stats endpoint returns totals', (stats.data?.totals?.members ?? 0) >= 8)
  check('stats returns 7 days of bars', stats.data?.last7Days?.length === 7)

  const activity = await call('/activity?limit=5')
  check('activity feed returns rows', (activity.data?.activity?.length ?? 0) > 0)

  const noAuth = await call('/posts', { method: 'POST', body: { title: 'x', body: 'y'.repeat(30), domain: 'tech' } })
  check('posting without a token is 401', noAuth.status === 401)

  console.log(`\n${passed} passed, ${failed} failed\n`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error('e2e crashed:', error)
  process.exit(1)
})
