import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { RoleBadge } from '../components/Badges'
import { EmptyState, ErrorNote } from '../components/Feedback'
import { Icon } from '../components/Icon'
import RequestMentorModal from '../components/RequestMentorModal'
import { LoadingBlock } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { excerpt } from '../lib/format'
import { DOMAINS, DOMAIN_META, type Domain, type User } from '../types'

type RoleFilter = 'all' | 'senior' | 'junior'

export default function People() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [role, setRole] = useState<RoleFilter>('senior')
  const [domain, setDomain] = useState<'all' | Domain>('all')
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [people, setPeople] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mentor, setMentor] = useState<User | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams()
        if (role !== 'all') params.set('role', role)
        if (domain !== 'all') params.set('domain', domain)
        if (query.trim()) params.set('q', query.trim())
        const data = await api<{ users: User[] }>(`/users?${params.toString()}`)
        setPeople(data.users)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load people.')
      } finally {
        setLoading(false)
      }
    }, 220)
    return () => window.clearTimeout(handle)
  }, [role, domain, query])

  useEffect(() => {
  }, [loading, people.length])

  const toggleFollow = async (person: User) => {
    setPeople((current) =>
      current.map((row) =>
        row.id === person.id ? { ...row, isFollowing: !row.isFollowing } : row,
      ),
    )
    try {
      await api(`/users/${person.id}/follow`, { method: 'POST' })
    } catch {
      setPeople((current) =>
        current.map((row) =>
          row.id === person.id ? { ...row, isFollowing: person.isFollowing } : row,
        ),
      )
    }
  }

  const openThread = async (person: User) => {
    try {
      const data = await api<{ conversation: { id: string } }>('/dm/conversations', {
        method: 'POST',
        body: { userId: person.id },
      })
      navigate(`/messages/${data.conversation.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open a conversation.')
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">People</h1>
          <p className="mt-0.5 text-[13px] text-inksoft">
            {role === 'senior'
              ? 'Seniors who have offered to answer questions.'
              : 'Everyone on Pocket Mentor in your domains.'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'senior', label: 'Mentors' },
              { id: 'junior', label: 'Juniors' },
              { id: 'all', label: 'Everyone' },
            ] as { id: RoleFilter; label: string }[]
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRole(option.id)}
              className={`tab ${role === option.id ? 'is-on' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className="sheet space-y-3 p-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-inksoft">
            <Icon name="search" size={16} />
          </span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              if (event.target.value) setSearchParams({ q: event.target.value })
              else setSearchParams({})
            }}
            className="input pl-9"
            placeholder="Search by name, company or domain…"
            aria-label="Search people"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setDomain('all')}
            className={`stamp cursor-pointer transition ${
              domain === 'all'
                ? 'text-ink'
                : 'text-inksoft opacity-55 hover:opacity-90'
            }`}
          >
            All domains
          </button>
          {DOMAINS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDomain(option)}
              className={`stamp cursor-pointer transition ${
                domain === option
                  ? DOMAIN_META[option].ink
                  : 'text-inksoft opacity-55 hover:opacity-90'
              }`}
            >
              {DOMAIN_META[option].label}
            </button>
          ))}
        </div>
      </div>

      <ErrorNote message={error} />

      {loading ? (
        <LoadingBlock label="Finding people…" />
      ) : people.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No one matches that"
          hint="Try a different domain, or clear the search."
          action={
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setQuery('')
                setDomain('all')
                setRole('all')
                setSearchParams({})
              }}
            >
              Reset filters
            </button>
          }
        />
      ) : (
        <div ref={listRef} className="grid gap-3 md:grid-cols-2">
          {people.map((person) => (
            <article key={person.id} className="index-card p-4">
              <div className="flex items-start gap-3">
                <Link to={`/profile/${person.id}`}>
                  <Avatar name={person.name} avatar={person.avatar} size="lg" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      to={`/profile/${person.id}`}
                      className="truncate text-sm font-semibold text-ink hover:text-ink"
                    >
                      {person.name}
                    </Link>
                    <RoleBadge role={person.role} years={person.years} />
                  </div>
                  <p className="truncate text-[12px] text-inksoft">{person.headline}</p>
                  <p className="mt-1 text-[11px] text-inksoft">
                    {person.company ? `${person.company}. ` : ''}
                    {person.followers ?? 0} {person.followers === 1 ? 'follower' : 'followers'},{' '}
                    {person.postCount ?? 0} {(person.postCount ?? 0) === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </div>

              {person.bio ? (
                <p className="mt-3 text-[12.5px] leading-relaxed text-inksoft">
                  {excerpt(person.bio, 130)}
                </p>
              ) : null}

              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                {person.role === 'senior' ? (
                  <button
                    type="button"
                    onClick={() => setMentor(person)}
                    className="btn-pen !px-3 !py-1.5 !text-[12px]"
                  >
                    Ask for mentorship
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => openThread(person)}
                  className="btn-ghost !px-3 !py-1.5 !text-[12px]"
                >
                  <Icon name="chat" size={13} />
                  Message
                </button>
                <button
                  type="button"
                  onClick={() => toggleFollow(person)}
                  className={`btn-quiet ml-auto ${person.isFollowing ? '!text-ink' : ''}`}
                >
                  {person.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <RequestMentorModal
        mentor={mentor}
        open={Boolean(mentor)}
        onClose={() => setMentor(null)}
        onSent={() => {
          if (user) setPeople((current) => current)
        }}
      />
    </div>
  )
}
