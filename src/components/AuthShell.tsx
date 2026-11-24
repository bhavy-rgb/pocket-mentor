import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DOMAINS, DOMAIN_META } from '../types'

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      <div className="relative hidden flex-col justify-between p-10 lg:flex">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="mt-1 inline-block h-2 w-2 rotate-45 bg-pen" aria-hidden="true" />
          <span className="font-serif text-[17px] font-medium tracking-tight text-ink">
            Pocket Mentor
          </span>
        </Link>

        <div className="max-w-sm">
          <p className="font-serif text-[1.5rem] leading-[1.32] text-ink">
            Four rooms, one page, and someone two years ahead reading it.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-inksoft">
            Post a question in tech, finance, law or news. Read the suggestions under it. Ask one
            senior for mentorship if you want a private thread.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {DOMAINS.map((domain) => (
            <span key={domain} className={`stamp ${DOMAIN_META[domain].ink}`}>
              {DOMAIN_META[domain].label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-baseline gap-2 lg:hidden">
            <span className="mt-1 inline-block h-2 w-2 rotate-45 bg-pen" aria-hidden="true" />
            <span className="font-serif text-[17px] font-medium tracking-tight text-ink">
              Pocket Mentor
            </span>
          </Link>
          <h1 className="font-serif text-[1.7rem] leading-tight text-ink">{title}</h1>
          <p className="mt-1 text-[13.5px] leading-relaxed text-inksoft">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <div className="mt-6 text-[13px] text-inksoft">{footer}</div>
        </div>
      </div>
    </div>
  )
}
