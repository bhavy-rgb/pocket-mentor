import { initials } from '../lib/format'

/** Ink pads for the initials tabs — one per persona, not per role. */
export const AVATAR_INKS: Record<string, string> = {
  mint: 'text-ink-finance',
  amber: 'text-[#9a6512]',
  violet: 'text-ink-law',
  sky: 'text-ink-tech',
  rose: 'text-ink-news',
  lime: 'text-ink-finance',
}

const SIZES: Record<string, string> = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-[11px]',
  lg: 'h-12 w-12 text-[13px]',
  xl: 'h-16 w-16 text-[17px]',
}

/**
 * An initials tab, the way a name is written on the tab of a folder:
 * a small paper square with an inked edge, not a photo placeholder.
 */
export function Avatar({
  name,
  avatar = 'mint',
  size = 'md',
  className = '',
}: {
  name: string
  avatar?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const ink = AVATAR_INKS[avatar] ?? AVATAR_INKS.mint
  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-[3px] border border-current/25 bg-paper2 font-sans font-semibold tracking-[0.02em] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ${ink} ${SIZES[size]} ${className}`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  )
}
