import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { excerpt, timeAgo } from '../lib/format'
import { pop } from '../lib/motion'
import { DOMAIN_META, type Post } from '../types'
import { Avatar } from './Avatar'
import { KindBadge, RoleBadge } from './Badges'
import { Icon } from './Icon'

/**
 * One entry on the page. The left margin carries the classification
 * (which room, when) and a red rule separates it from the writing —
 * the way a marked-up notebook works. No card, no shadow: the sheet
 * around it does that job.
 */
export default function PostCard({
  post,
  onLike,
  compact = false,
}: {
  post: Post
  onLike?: (post: Post) => void
  compact?: boolean
}) {
  const { user } = useAuth()
  const heartRef = useRef<HTMLSpanElement>(null)
  const author = post.author
  const meta = DOMAIN_META[post.domain]

  return (
    <article className="group relative border-b border-ink/10 last:border-b-0">
      <div className="grid grid-cols-[52px_minmax(0,1fr)] sm:grid-cols-[74px_minmax(0,1fr)]">
        <div className="border-r border-[rgba(178,58,44,0.38)] px-1.5 pb-4 pt-4 sm:px-2.5">
          <span className={`stamp stamp-flat hidden sm:inline-flex ${meta.ink}`}>{meta.label}</span>
          <p className="mt-2 text-[10px] leading-snug text-inksoft sm:mt-2.5">
            {timeAgo(post.createdAt)}
          </p>
        </div>

        <div className="px-4 pb-5 pt-4 sm:px-5">
          <div className="flex items-start gap-2.5">
            {author ? (
              <Link to={`/profile/${author.id}`} className="mt-0.5">
                <Avatar name={author.name} avatar={author.avatar} size="sm" />
              </Link>
            ) : (
              <Avatar name="Former member" size="sm" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                {author ? (
                  <Link
                    to={`/profile/${author.id}`}
                    className="font-serif text-[15px] font-medium text-ink hover:text-pen"
                  >
                    {author.name}
                  </Link>
                ) : (
                  <span className="font-serif text-[15px] text-ink">Former member</span>
                )}
                {author ? <RoleBadge role={author.role} years={author.years} /> : null}
              </div>
              <p className="truncate text-[11.5px] text-inksoft">{author?.headline}</p>
            </div>
            <span className={`stamp stamp-flat shrink-0 sm:hidden ${meta.ink}`}>{meta.label}</span>
          </div>

          <Link to={`/post/${post.id}`} className="mt-3 block">
            <h3 className="text-balance font-serif text-[1.3rem] leading-[1.28] text-ink transition-colors group-hover:text-pen">
              {post.title}
            </h3>
            <p className="measure mt-1.5 font-serif text-[15.5px] leading-[1.62] text-ink/85">
              {excerpt(post.body, compact ? 120 : 210)}
            </p>
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <KindBadge kind={post.kind} />
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[11.5px] text-inksoft">
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                pop(heartRef.current)
                onLike?.(post)
              }}
              className={`btn-quiet -ml-1.5 ${post.liked ? '!text-pen' : ''}`}
              aria-pressed={post.liked}
              aria-label={post.liked ? 'Remove like' : 'Like this post'}
            >
              <span ref={heartRef} className="inline-flex">
                <Icon name="heart" size={14} filled={post.liked} />
              </span>
              {post.likeCount}
            </button>
            <Link to={`/post/${post.id}`} className="btn-quiet">
              <Icon name="comment" size={14} />
              {post.commentCount} {post.commentCount === 1 ? 'suggestion' : 'suggestions'}
            </Link>
            {author && author.role === 'senior' && author.id !== user?.id ? (
              <Link
                to={`/profile/${author.id}`}
                className="btn-quiet ml-auto !text-pen hover:!text-pen"
              >
                Ask for guidance
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
