import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { DOMAINS, DOMAIN_META, KIND_META, type Domain, type Post, type PostKind } from '../types'
import { Avatar } from './Avatar'
import { ErrorNote } from './Feedback'
import { Icon } from './Icon'

const KINDS: PostKind[] = ['experience', 'question', 'resource']

/** Writing a new entry: a blank ruled space at the top of the page. */
export default function Composer({ onPosted }: { onPosted: (post: Post) => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<PostKind>('experience')
  const [domain, setDomain] = useState<Domain>(user?.domain ?? 'tech')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setTitle('')
    setBody('')
    setTags('')
    setKind('experience')
    setError('')
    setOpen(false)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const data = await api<{ post: Post }>('/posts', {
        method: 'POST',
        body: {
          title,
          body,
          domain,
          kind,
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
      })
      onPosted(data.post)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish your post.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  if (!open) {
    return (
      <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-3 sm:px-5">
        <Avatar name={user.name} avatar={user.avatar} size="sm" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="min-w-0 flex-1 truncate text-left font-serif text-[15px] italic text-inksoft transition-colors hover:text-ink"
        >
          <span className="hidden sm:inline">
            Start a new entry: a question, a lesson, or your notes.
          </span>
          <span className="sm:hidden">Start a new entry</span>
        </button>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary shrink-0">
          <Icon name="plus" size={13} />
          <span className="hidden sm:inline">Write</span>
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="border-b border-ink/10 px-4 py-4 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center gap-x-1 gap-y-1">
        {KINDS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setKind(option)}
            className={`tab ${kind === option ? 'is-on' : ''}`}
            aria-current={kind === option}
          >
            {KIND_META[option].label}
          </button>
        ))}
        <button type="button" onClick={reset} className="btn-quiet ml-auto">
          Cancel
        </button>
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="w-full border-0 border-b border-ink/15 bg-transparent pb-2 font-serif text-[1.4rem] leading-tight text-ink outline-none placeholder:text-inksoft/60 focus:border-pen/50"
        placeholder="Give it a title"
        maxLength={160}
        required
      />

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="ruled mt-3 min-h-[140px] w-full resize-y border-0 bg-transparent font-serif text-[16px] leading-[28px] text-ink outline-none placeholder:text-inksoft/60"
        placeholder="Write the thing you wish someone had told you a year ago."
        maxLength={6000}
        required
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-[150px_1fr]">
        <div>
          <label className="label" htmlFor="composer-domain">
            Room
          </label>
          <select
            id="composer-domain"
            value={domain}
            onChange={(event) => setDomain(event.target.value as Domain)}
            className="input"
          >
            {DOMAINS.map((option) => (
              <option key={option} value={option}>
                {DOMAIN_META[option].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="composer-tags">
            Tags, separated by commas
          </label>
          <input
            id="composer-tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className="input"
            placeholder="resume, interviews, backend"
          />
        </div>
      </div>

      <ErrorNote message={error} />

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] text-inksoft">
          {body.trim().length} of 6000 characters
        </p>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Publishing…' : 'Publish'}
          <Icon name="send" size={13} />
        </button>
      </div>
    </form>
  )
}
