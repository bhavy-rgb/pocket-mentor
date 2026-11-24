/**
 * Thin wrapper over anime.js that works with v3 (`anime({...})`) and
 * v4 (`animate(targets, {...})`) so the UI never breaks on a version bump.
 */
import * as animeNamespace from 'animejs'

type Bag = Record<string, any>
const mod = animeNamespace as unknown as Bag

export function animate(targets: any, params: Bag = {}): any {
  const v4 = mod.animate as ((t: any, p: any) => any) | undefined
  if (typeof v4 === 'function') return v4(targets, params)
  const v3 = (mod.default ?? mod) as any
  if (typeof v3 === 'function') return v3({ targets, ...params })
  return null
}

export function stagger(value: number, options: Bag = {}): any {
  const v4 = mod.stagger as ((v: any, o?: any) => any) | undefined
  if (typeof v4 === 'function') return v4(value, options)
  const v3 = (mod.default ?? mod) as any
  if (v3 && typeof v3.stagger === 'function') return v3.stagger(value, options)
  return value
}

/** Fade + rise for elements marked with [data-reveal] inside a container. */
export function revealChildren(container: HTMLElement | null, delayStep = 65): void {
  if (!container) return
  const items = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal]'))
  if (!items.length) return
  items.forEach((el) => {
    el.style.opacity = '0'
  })
  animate(items, {
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 620,
    delay: stagger(delayStep),
    ease: 'outQuad',
  })
}

/** Small pop used for likes and confirmations. */
export function pop(target: HTMLElement | null): void {
  if (!target) return
  animate(target, { scale: [1, 1.28, 1], duration: 420, ease: 'outBack' })
}

export function countUp(target: HTMLElement | null, to: number, duration = 1100): void {
  if (!target) return
  const from = 0
  const start = performance.now()
  const tick = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    target.textContent = String(Math.round(from + (to - from) * eased))
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
