import type { ReactNode } from 'react'

const PATHS: Record<string, ReactNode> = {
  feed: (
    <>
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h10" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5" />
      <path d="M17.5 14.6A5 5 0 0 1 21 20" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-8 8H8l-4 3v-4.6A8 8 0 1 1 21 12Z" />,
  inbox: (
    <>
      <path d="M4 13h4l1.6 3h4.8L16 13h4" />
      <path d="M5 5h14l2 8v6H3v-6l2-8Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  send: <path d="M4 12l16-8-6 16-2.6-6.2L4 12Z" />,
  heart: (
    <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z" />
  ),
  comment: <path d="M20 12a7 7 0 0 1-7 7H9l-4 2.5V12a7 7 0 0 1 7-7h1a7 7 0 0 1 7 7Z" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  check: <path d="m5 13 4.5 4.5L19 7" />,
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
}

export function Icon({
  name,
  size = 18,
  className = '',
  filled = false,
}: {
  name: keyof typeof PATHS | string
  size?: number
  className?: string
  filled?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? PATHS.spark}
    </svg>
  )
}
