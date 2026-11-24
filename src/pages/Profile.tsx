import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DomainBadge, RoleBadge } from '../components/Badges'
import { ErrorNote } from '../components/Feedback'
import PostCard from '../components/PostCard'
import RequestMentorModal from '../components/RequestMentorModal'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import type { Post, RequestStatus, User } from '../types'

export default function Profile() {
  const { id } = useParams()
  const { user: me } = useAuth()
  const navigate = useNavigate()

  const [person, setPerson] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const data = await api<{ user: User; posts: Post[]; requestStatus: RequestStatus | null }>(
        `/users/${id}`,
      )
      setPerson(data.user)
      setPosts(data.posts)
      setRequestStatus(data.requestStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this profile.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const toggleFollow = async () => {
    if (!person) return
    const before = person.isFollowing
    setPerson({
      ...person,
      isFollowing: !before,
      followers: (person.followers ?? 0) + (before ? -1 : 1),
    })
    try {
      await api(`/users/${person.id}/follow`, { method: 'POST' })
    } catch {
      setPerson(person)
    }
  }

  const toggleLike = async (post: Post) => {
    setPosts((current) =>
      current.map((row) =>
        row.id === post.id
          ? { ...row, liked: !row.liked, likeCount: row.likeCount + (row.liked ? -1 : 1) }
          : row,
      ),
    )
    try {
      await api(`/posts/${post.id}/like`, { method: 'POST' })
    } catch {
      setPosts((current) => current.map((row) => (row.id === post.id ? post : row)))
    }
  }

  const openThread = async () => {
    if (!person) return
    try {
      const data = await api<{ conversation: { id: string } }>('/dm/conversations', {
        method: 'POST',
        body: { userId: person.id },
      })
      navigate(`/messages/${data.conversation.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the conversation.')
    }
  }

  if (loading) return <p className="py-20 text-center text-[13px] text-inksoft">Opening the file…</p>

  if (!person) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="font-serif text-[1.3rem] text-ink">No such person here</p>
        <p className="mt-1 text-[13px] text-inksoft">
          {error || 'They may have left Pocket Mentor.'}
        </p>
        <Link to="/people" className="btn-ghost mt-4">
          Browse people
        </Link>
      </div>
    )
  }

  const isMe = person.id === me?.id
  const joined = new Date(person.createdAt).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/people" className="text-[12.5px] text-inksoft hover:text-ink">
        All people
      </Link>

      <section className="sheet mt-3 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={person.name} avatar={person.avatar} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <h1 className="font-serif text-[1.7rem] leading-tight text-ink">{person.name}</h1>
              <RoleBadge role={person.role} years={person.years} />
              <DomainBadge domain={person.domain} />
            </div>
            <p className="mt-0.5 font-serif text-[14.5px] text-ink/85">{person.headline}</p>
            <p className="mt-0.5 text-[11.5px] text-inksoft">
              {person.company ? `${person.company}. ` : ''}Joined {joined}.
            </p>
          </div>
        </div>

        {person.bio ? (
          <p className="measure mt-4 font-serif text-[15.5px] leading-[1.62] text-ink/85">
            {person.bio}
          </p>
        ) : null}

        <p className="mt-4 text-[12px] text-inksoft">
          {person.postCount ?? posts.length} {(person.postCount ?? posts.length) === 1 ? 'entry' : 'entries'},{' '}
          {person.followers ?? 0} {(person.followers ?? 0) === 1 ? 'follower' : 'followers'},{' '}
          {person.following ?? 0} following.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
          {isMe ? (
            <Link to="/feed" className="btn-primary">
              Write an entry
            </Link>
          ) : (
            <>
              <button type="button" onClick={toggleFollow} className="btn-primary">
                {person.isFollowing ? 'Following' : 'Follow'}
              </button>
              <button type="button" onClick={openThread} className="btn-ghost">
                Message
              </button>
              {person.role === 'senior' ? (
                <button
                  type="button"
                  onClick={() => setRequestOpen(true)}
                  className="btn-pen"
                  disabled={requestStatus === 'pending' || requestStatus === 'accepted'}
                >
                  {requestStatus === 'pending'
                    ? 'Request pending'
                    : requestStatus === 'accepted'
                      ? 'Connected'
                      : 'Ask for mentorship'}
                </button>
              ) : null}
            </>
          )}
        </div>

        <ErrorNote message={error} />
      </section>

      <h2 className="mt-6 font-serif text-[1.15rem] text-ink">
        {isMe ? 'Your entries' : `Entries by ${person.name.split(' ')[0]}`}
      </h2>

      <div className="sheet mt-2 overflow-hidden">
        {posts.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] italic text-inksoft">
            {isMe ? 'Your first entry is the hard one.' : 'Nothing written here yet.'}
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} onLike={toggleLike} compact />)
        )}
      </div>

      <RequestMentorModal
        mentor={person}
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        onSent={() => setRequestStatus('pending')}
      />
    </div>
  )
}
