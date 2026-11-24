/**
 * Screenshot + console-error check against the running app.
 *   node scripts/shots.mjs http://localhost:4000
 */
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = process.argv[2] ?? 'http://localhost:4000'
const OUT = '/scratch/work/shots'
fs.mkdirSync(OUT, { recursive: true })

const errors = []

const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/local/bin/chromium',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
})
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
page.on('requestfailed', (request) => {
  const url = request.url()
  if (!url.includes('fonts.googleapis') && !url.includes('fonts.gstatic')) {
    errors.push(`requestfailed: ${url} — ${request.failure()?.errorText}`)
  }
})

const settle = (ms = 1100) => new Promise((resolve) => setTimeout(resolve, ms))

await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' })
await settle(1400)
await page.screenshot({ path: `${OUT}/01-landing.png` })

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
await settle(600)
await page.screenshot({ path: `${OUT}/02-login.png` })

await page.goto(`${BASE}/terms`, { waitUntil: 'networkidle2' })
await settle(500)
await page.screenshot({ path: `${OUT}/02c-terms.png` })

await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle2' })
await settle(700)
await page.screenshot({ path: `${OUT}/02b-signup.png` })

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' })
await settle(500)

await page.evaluate(() => {
  const button = [...document.querySelectorAll('button')].find((node) =>
    node.textContent?.includes('demo mentor'),
  )
  if (button) button.click()
})
await page.waitForFunction(() => window.location.pathname === '/feed', { timeout: 20000 })
await settle(1600)
await page.screenshot({ path: `${OUT}/03-feed.png` })

await page.goto(`${BASE}/post/p_1`, { waitUntil: 'networkidle2' })
await settle(1200)
await page.screenshot({ path: `${OUT}/04-post.png`, fullPage: false })

await page.goto(`${BASE}/people`, { waitUntil: 'networkidle2' })
await settle(1200)
await page.screenshot({ path: `${OUT}/05-people.png` })

// mentor-request modal
await page.goto(`${BASE}/people`, { waitUntil: 'networkidle2' })
await settle(1000)
await page.evaluate(() => {
  const button = [...document.querySelectorAll('button')].find((node) =>
    node.textContent?.includes('Ask for mentorship'),
  )
  if (button) button.click()
})
await settle(900)
await page.screenshot({ path: `${OUT}/05b-request-modal.png` })
await page.evaluate(() => {
  const close = [...document.querySelectorAll('button')].find((node) => node.textContent?.trim() === '✕')
  if (close) close.click()
})

await page.goto(`${BASE}/messages/cv_1`, { waitUntil: 'networkidle2' })
await settle(1200)
await page.screenshot({ path: `${OUT}/06-messages.png` })

await page.goto(`${BASE}/requests`, { waitUntil: 'networkidle2' })
await settle(1200)
await page.screenshot({ path: `${OUT}/07-requests.png` })

await page.goto(`${BASE}/profile/u_kabir`, { waitUntil: 'networkidle2' })
await settle(1200)
await page.screenshot({ path: `${OUT}/08-profile.png` })

// mobile pass
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
await page.goto(`${BASE}/feed`, { waitUntil: 'networkidle2' })
await settle(1500)
await page.screenshot({ path: `${OUT}/09-feed-mobile.png` })

// sanity: did the feed actually render posts?
await page.setViewport({ width: 1440, height: 900 })
await page.goto(`${BASE}/feed`, { waitUntil: 'networkidle2' })
await settle(1200)
const report = await page.evaluate(() => ({
  path: window.location.pathname,
  articles: document.querySelectorAll('article').length,
  navLinks: document.querySelectorAll('nav a').length,
  hasComposer: document.body.innerText.includes('Share an experience'),
  bodyLength: document.body.innerText.length,
}))
console.log('PAGE REPORT', JSON.stringify(report))
console.log('ERRORS', errors.length ? JSON.stringify(errors, null, 1) : 'none')

await browser.close()
