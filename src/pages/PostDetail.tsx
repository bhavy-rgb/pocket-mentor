import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { DomainBadge, KindBadge, RoleBadge } from '../components/Badges'
import { ErrorNote } from '../components/Feedback'
import { Icon } from '../components/Icon'
import RequestMentorModal from '../components/RequestMentorModal'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { timeAgo } from '../lib/format'
import { pop } from '../lib/motion'
import { DOMAIN_META, type Comment, type Post } from '../types'

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const heartRef = useRef<HTMLSpanElement>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const [postData, commentData] = await Promise.all([
        api<{ post: Post }>(`/posts/${id}`),
        api<{ comments: Comment[] }>(`/posts/${id}/comments`),
      ])
      setPost(postData.post)
      setComments(commentData.comments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load this entry.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const toggleLike = async () => {
    if (!post) return
    pop(heartRef.current)
    setPost({ ...post, liked: !post.liked, likeCount: post.likeCount + (post.liked ? -1 : 1) })
    try {
      await api(`/posts/${post.id}/like`, { method: 'POST' })
    } catch {
      setPost(post)
    }
  }

  const addComment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!post || draft.trim().length < 2) return
    setPosting(true)
    setError('')
    try {
      const data = await api<{ comment: Comment }>(`/posts/${post.id}/comments`, {
        method: 'POST',
        body: { body: draft },
      })
      setComments((current) => [...current, data.comment])
      setPost({ ...post, commentCount: post.commentCount + 1 })
      setDraft('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add your suggestion.')
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return <p className="py-20 text-center text-[13px] text-inksoft">Turning the page…</p>
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="font-serif text-[1.3rem] text-ink">This entry is gone</p>
        <p className="mt-1 text-[13px] text-inksoft">{error || 'The author may have deleted it.'}</p>
        <Link to="/feed" className="btn-ghost mt-4">
          Back to the page
        </Link>
      </div>
    )
  }

  const author = post.author
  const canRequest = author?.role === 'senior' && author.id !== user?.id
  const meta = DOMAIN_META[post.domain]

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/feed" className="text-[12.5px] text-inksoft hover:text-ink">
        Back to the page
      </Link>

      <article className="sheet mt-3 overflow-hidden">
        <div className="grid grid-cols-[52px_minmax(0,1fr)] sm:grid-cols-[74px_minmax(0,1fr)]">
          <div className="border-r border-[rgba(178,58,44,0.38)] px-1.5 pb-4 pt-5 sm:px-2.5">
            <span className={`stamp stamp-flat hidden sm:inline-flex ${meta.ink}`}>
              {meta.label}
            </span>
            <p className="mt-2.5 text-[10px] leading-snug text-inksoft">{timeAgo(post.createdAt)}</p>
          </div>

          <div className="px-5 pb-6 pt-5 sm:px-6">
            <div className="flex items-start gap-3">
              {author ? (
                <Link to={`/profile/${author.id}`}>
                  <Avatar name={author.name} avatar={author.avatar} size="md" />
                </Link>
              ) : (
                <Avatar name="Former member" size="md" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  {author ? (
                    <Link
                      to={`/profile/${author.id}`}
                      className="font-serif text-[15.5px] font-medium text-ink hover:text-pen"
                    >
                      {author.name}
                    </Link>
                  ) : null}
                  {author ? <RoleBadge role={author.role} years={author.years} /> : null}
                </div>
                <p className="text-[11.5px] text-inksoft">{author?.headline}</p>
              </div>
              <span className={`stamp stamp-flat shrink-0 sm:hidden ${meta.ink}`}>{meta.label}</span>
            </div>

            <h1 className="mt-4 text-balance font-serif text-[1.75rem] leading-[1.2] text-ink">
              {post.title}
            </h1>

            <div className="measure mt-3 space-y-3.5 font-serif text-[16.5px] leading-[1.68] text-ink/90">
              {post.body
                .split('\n')
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <KindBadge kind={post.kind} />
              {post.tags.map((tag) => (
                <span key={tag} className="text-[11.5px] text-inksoft">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3 border-t border-ink/10 pt-3">
              <button
                type="button"
                onClick={toggleLike}
                className={`btn-quiet -ml-1.5 ${post.liked ? '!text-pen' : ''}`}
                aria-pressed={post.liked}
              >
                <span ref={heartRef} className="inline-flex">
                  <Icon name="heart" size={15} filled={post.liked} />
                </span>
                {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
              </button>
              <span className="text-[11.5px] text-inksoft">
                {post.commentCount} {post.commentCount === 1 ? 'suggestion' : 'suggestions'}
              </span>
            </div>
          </div>
        </div>
      </article>

      {canRequest && author ? (
        <section className="sheet mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-t-pen px-5 py-4">
          <div className="min-w-0">
            <p className="font-serif text-[15px] text-ink">
              Want {author.name.split(' ')[0]} as your mentor?
            </p>
            <p className="text-[12.5px] text-inksoft">
              Send one specific question. If they accept, a private thread opens between you.
            </p>
          </div>
          <button type="button" onClick={() => setRequestOpen(true)} className="btn-pen">
            Ask for mentorship
          </button>
        </section>
      ) : null}

      <section className="sheet mt-4 px-5 py-5 sm:px-6">
        <h2 className="font-serif text-[1.15rem] text-ink">
          Suggestions{' '}
          <span className="text-[13px] font-normal text-inksoft">({comments.length})</span>
        </h2>
        <p className="mt-0.5 text-[12px] text-inksoft">
          Concrete advice beats encouragement. Say what worked for you.
        </p>

        <div className="mt-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-t border-ink/10 py-3 first:border-t-0 first:pt-0">
              <div className="flex items-baseline gap-2">
                {comment.author ? (
                  <Link
                    to={`/profile/${comment.author.id}`}
                    className="font-serif text-[14px] font-medium text-ink hover:text-pen"
                  >
                    {comment.author.name}
                  </Link>
                ) : (
                  <span className="font-serif text-[14px] text-ink">Member</span>
                )}
                {comment.author ? (
                  <RoleBadge role={comment.author.role} years={comment.author.years} />
                ) : null}
                <span className="ml-auto text-[10.5px] text-inksoft">
                  {timeAgo(comment.createdAt)}
                </span>
              </div>
              <p className="measure mt-1 font-serif text-[15px] leading-[1.6] text-ink/85">
                {comment.body}
              </p>
            </div>
          ))}
          {!comments.length ? (
            <p className="border-t border-ink/10 pt-3 text-[13px] italic text-inksoft">
              No suggestions yet. Yours can be the first.
            </p>
          ) : null}
        </div>

        <form onSubmit={addComment} className="mt-4 border-t border-ink/10 pt-4">
          <label className="label" htmlFor="suggestion">
            Add a suggestion
          </label>
          <textarea
            id="suggestion"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="ruled w-full resize-y border-0 bg-transparent font-serif text-[16px] leading-[28px] text-ink outline-none placeholder:text-inksoft/60"
            placeholder="What would you tell them to do differently?"
            maxLength={2000}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-inksoft">{draft.trim().length} of 2000</span>
            <button
              type="submit"
              disabled={posting || draft.trim().length < 2}
              className="btn-primary !py-1.5"
            >
              {posting ? 'Adding…' : 'Add suggestion'}
            </button>
          </div>
        </form>

        <ErrorNote message={error} />
      </section>

      {author ? (
        <RequestMentorModal
          mentor={author}
          open={requestOpen}
          onClose={() => setRequestOpen(false)}
        />
      ) : null}
    </div>
  )
}
