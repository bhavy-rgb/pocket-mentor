import type { ReactNode } from 'react'

export function EmptyState({
  title,
  hint,
  action,
  icon = '◎',
}: {
  title: string
  hint?: string
  action?: ReactNode
  icon?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-ink/20 px-6 py-12 text-center">
      <div>
        <p className="font-serif text-[1.1rem] text-ink">{title}</p>
        {hint ? (
          <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-inksoft">{hint}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null
  return (
    <p className="rounded-[3px] border border-pen/30 bg-pen/5 px-3 py-2 text-[13px] text-pen">
      {message}
    </p>
  )
}
