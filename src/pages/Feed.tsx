import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ActivityRail from '../components/ActivityRail'
import Composer from '../components/Composer'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { DOMAINS, DOMAIN_META, type Domain, type Post } from '../types'

type Sort = 'recent' | 'top' | 'discussed'

const SORTS: { id: Sort; label: string }[] = [
  { id: 'recent', label: 'Newest' },
  { id: 'top', label: 'Most liked' },
  { id: 'discussed', label: 'Most discussed' },
]

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Feed() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const [domain, setDomain] = useState<'all' | Domain>('all')
  const [sort, setSort] = useState<Sort>('recent')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (domain !== 'all') params.set('domain', domain)
      if (q) params.set('q', q)
      params.set('sort', sort)
      const data = await api<{ posts: Post[] }>(`/posts?${params.toString()}`)
      setPosts(data.posts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the page.')
    } finally {
      setLoading(false)
    }
  }, [domain, q, sort])

  useEffect(() => {
    void load()
  }, [load])

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
      setPosts((current) =>
        current.map((row) => (row.id === post.id ? { ...row, liked: post.liked, likeCount: post.likeCount } : row)),
      )
    }
  }

  const onPosted = (post: Post) => {
    setPosts((current) => [post, ...current])
    setDomain('all')
    setSort('recent')
    if (q) setSearchParams({})
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_252px]">
      <div className="min-w-0">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-[1.7rem] leading-tight text-ink">
              {greeting()}, {user?.name.split(' ')[0]}
            </h1>
            <p className="mt-1 max-w-md text-[13px] leading-relaxed text-inksoft">
              {q
                ? `${posts.length} ${posts.length === 1 ? 'entry matches' : 'entries match'} “${q}”.`
                : 'Ask something specific. Someone two years ahead is reading.'}
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-[11.5px]">
            {SORTS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSort(option.id)}
                className={`transition-colors ${
                  sort === option.id
                    ? 'font-semibold text-ink underline decoration-pen decoration-2 underline-offset-4'
                    : 'text-inksoft hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        <div className="flex flex-wrap items-end gap-1 pl-1" role="tablist" aria-label="Rooms">
          <button
            type="button"
            role="tab"
            aria-selected={domain === 'all'}
            onClick={() => setDomain('all')}
            className={`tab ${domain === 'all' ? 'is-on' : ''}`}
          >
            All rooms
          </button>
          {DOMAINS.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={domain === option}
              onClick={() => setDomain(option)}
              className={`tab ${domain === option ? 'is-on' : ''}`}
            >
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${DOMAIN_META[option].dot}`} />
              {DOMAIN_META[option].label}
            </button>
          ))}
          {q ? (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="tab !text-pen"
            >
              Clear search
            </button>
          ) : null}
        </div>

        <div className="sheet -mt-px overflow-hidden">
          <Composer onPosted={onPosted} />

          {error ? (
            <p className="border-b border-ink/10 bg-pen/5 px-5 py-3 text-[13px] text-pen">{error}</p>
          ) : null}

          {loading ? (
            <>
              <EntrySkeleton />
              <EntrySkeleton />
              <EntrySkeleton />
            </>
          ) : posts.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-serif text-[1.1rem] text-ink">
                {q ? 'Nothing on this page yet' : 'This room is empty'}
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-inksoft">
                {q
                  ? 'No entry matches that search. Try a broader word, or write the question you were hoping to find.'
                  : 'A question is a fine first entry. Write it above and someone will answer.'}
              </p>
              <Link to="/people" className="btn-ghost mt-4">
                Browse the mentors
              </Link>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} onLike={toggleLike} />)
          )}
        </div>
      </div>

      <div className="hidden xl:block">
        <div className="sticky top-20">
          <ActivityRail />
        </div>
      </div>
    </div>
  )
}

/** The page before the entries arrive: ruled lines where the writing will go. */
function EntrySkeleton() {
  return (
    <div className="grid grid-cols-[52px_minmax(0,1fr)] border-b border-ink/10 last:border-b-0 sm:grid-cols-[74px_minmax(0,1fr)]">
      <div className="border-r border-[rgba(178,58,44,0.38)] px-1.5 pt-4 sm:px-2.5">
        <div className="shimmer h-3 w-9 rounded-[2px]" />
        <div className="shimmer mt-2 h-2 w-6 rounded-[2px]" />
      </div>
      <div className="px-4 pb-5 pt-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="shimmer h-7 w-7 rounded-[3px]" />
          <div className="shimmer h-3 w-28 rounded-[2px]" />
          <div className="shimmer ml-auto h-3 w-12 rounded-[2px]" />
        </div>
        <div className="shimmer mt-3.5 h-4 w-3/4 rounded-[2px]" />
        <div className="shimmer mt-2.5 h-3 w-full rounded-[2px]" />
        <div className="shimmer mt-1.5 h-3 w-11/12 rounded-[2px]" />
        <div className="shimmer mt-1.5 h-3 w-2/3 rounded-[2px]" />
      </div>
    </div>
  )
}
