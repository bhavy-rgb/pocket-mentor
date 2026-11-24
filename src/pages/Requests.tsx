import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DomainBadge, RoleBadge } from '../components/Badges'
import { EmptyState, ErrorNote } from '../components/Feedback'
import { Icon } from '../components/Icon'
import { LoadingBlock } from '../components/Spinner'
import { api } from '../lib/api'
import { timeAgo } from '../lib/format'
import type { MentorRequest } from '../types'

type Box = 'incoming' | 'outgoing'

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-inksoft',
  accepted: 'text-ink-finance',
  declined: 'text-pen',
}

export default function Requests() {
  const navigate = useNavigate()
  const [box, setBox] = useState<Box>('incoming')
  const [requests, setRequests] = useState<MentorRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api<{ requests: MentorRequest[] }>(`/requests?box=${box}`)
      setRequests(data.requests)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load requests.')
    } finally {
      setLoading(false)
    }
  }, [box])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
  }, [loading, requests.length, box])

  const answer = async (request: MentorRequest, status: 'accepted' | 'declined') => {
    setBusyId(request.id)
    setError('')
    try {
      const data = await api<{ request: MentorRequest }>(`/requests/${request.id}`, {
        method: 'PATCH',
        body: { status },
      })
      setRequests((current) =>
        current.map((row) => (row.id === request.id ? data.request : row)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the request.')
    } finally {
      setBusyId(null)
    }
  }

  const openThread = async (personId: string) => {
    try {
      const data = await api<{ conversation: { id: string } }>('/dm/conversations', {
        method: 'POST',
        body: { userId: personId },
      })
      navigate(`/messages/${data.conversation.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the conversation.')
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-[1.7rem] leading-tight text-ink">Mentorship requests</h1>
          <p className="mt-0.5 text-[13px] text-inksoft">
            {box === 'incoming'
              ? 'Juniors asking for your time. Accepting opens a private thread.'
              : 'Requests you have sent. Accepted ones move to Messages.'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'incoming', label: 'Incoming' },
              { id: 'outgoing', label: 'Sent' },
            ] as { id: Box; label: string }[]
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setBox(option.id)}
              className={`tab ${box === option.id ? 'is-on' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <ErrorNote message={error} />

      {loading ? (
        <LoadingBlock label="Loading requests…" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon="⇄"
          title={box === 'incoming' ? 'No requests yet' : 'You have not asked anyone yet'}
          hint={
            box === 'incoming'
              ? 'When a junior sends you a request it lands here, with their question attached.'
              : 'Find a senior in your domain and send one specific question.'
          }
          action={
            <Link to="/people" className="btn-ghost">
              Browse mentors
            </Link>
          }
        />
      ) : (
        <div ref={listRef} className="space-y-3">
          {requests.map((request) => {
            const person = box === 'incoming' ? request.from : request.to
            return (
              <article key={request.id} className="sheet p-4">
                <div className="flex items-start gap-3">
                  {person ? (
                    <Link to={`/profile/${person.id}`}>
                      <Avatar name={person.name} avatar={person.avatar} size="md" />
                    </Link>
                  ) : (
                    <Avatar name="Member" size="md" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        to={person ? `/profile/${person.id}` : '/feed'}
                        className="text-sm font-semibold text-ink hover:text-ink"
                      >
                        {person?.name ?? 'Member'}
                      </Link>
                      {person ? <RoleBadge role={person.role} years={person.years} /> : null}
                      {person ? <DomainBadge domain={person.domain} /> : null}
                      <span
                        className={`stamp stamp-flat ml-auto ${STATUS_STYLES[request.status] ?? 'text-inksoft'}`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-inksoft">
                      {person?.headline}. Sent {timeAgo(request.createdAt)}.
                    </p>
                  </div>
                </div>

                <blockquote className="mt-2 pl-4 font-serif text-[14.5px] leading-[1.6] text-ink/85">
                  {request.message}
                </blockquote>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {box === 'incoming' && request.status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        disabled={busyId === request.id}
                        onClick={() => answer(request, 'accepted')}
                        className="btn-primary !px-3 !py-1.5 !text-[12px]"
                      >
                        <Icon name="check" size={13} />
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={busyId === request.id}
                        onClick={() => answer(request, 'declined')}
                        className="btn-ghost !px-3 !py-1.5 !text-[12px]"
                      >
                        Decline
                      </button>
                    </>
                  ) : null}

                  {request.status === 'accepted' && person ? (
                    <button
                      type="button"
                      onClick={() => openThread(person.id)}
                      className="btn-ghost !px-3 !py-1.5 !text-[12px]"
                    >
                      <Icon name="chat" size={13} />
                      Open messages
                    </button>
                  ) : null}

                  {person ? (
                    <Link
                      to={`/profile/${person.id}`}
                      className="btn-quiet ml-auto !text-[12px]"
                    >
                      View profile
                    </Link>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
