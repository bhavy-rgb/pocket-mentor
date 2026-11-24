export function Spinner({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-ink/20 border-t-pen"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="card flex items-center justify-center gap-3 py-16 text-sm text-inksoft">
      <Spinner />
      {label}
    </div>
  )
}
