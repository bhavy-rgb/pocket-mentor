import { DOMAIN_META, type Domain, type PostKind, type Role } from '../types'

/** A rubber stamp for the room a post belongs to. */
export function DomainBadge({ domain, flat = true }: { domain: Domain; flat?: boolean }) {
  const meta = DOMAIN_META[domain]
  return <span className={`stamp ${flat ? 'stamp-flat' : ''} ${meta.ink}`}>{meta.label}</span>
}

/** Kinds read as a mark in the margin, not a chip. */
export function KindBadge({ kind }: { kind: PostKind }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-inksoft">
      <span className="h-2.5 w-[2px] bg-ink/25" aria-hidden="true" />
      {kind === 'question' ? 'Question' : kind === 'resource' ? 'Notes' : 'Experience'}
    </span>
  )
}

export function RoleBadge({ role, years }: { role: Role; years?: number }) {
  if (role === 'senior') {
    return (
      <span className="text-[11.5px] font-semibold text-pen">
        Mentor{years ? `, ${years} ${years === 1 ? 'year' : 'years'}` : ''}
      </span>
    )
  }
  return <span className="text-[11.5px] text-inksoft">Junior</span>
}
