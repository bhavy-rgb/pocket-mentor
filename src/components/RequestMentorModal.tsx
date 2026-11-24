import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Author, User } from '../types'
import { Avatar } from './Avatar'
import { ErrorNote } from './Feedback'
import Modal from './Modal'

type Mentor = Pick<User, 'id' | 'name' | 'avatar' | 'headline'> | Author

export default function RequestMentorModal({
  mentor,
  open,
  onClose,
  onSent,
}: {
  mentor: Mentor | null
  open: boolean
  onClose: () => void
  onSent?: () => void
}) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (open) {
      setDone(false)
      setError('')
      setMessage('')
    }
  }, [open, mentor?.id])

  if (!mentor) return null

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api('/requests', { method: 'POST', body: { toId: mentor.id, message } })
      setDone(true)
      onSent?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the request.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={done ? 'Request sent' : 'Ask for mentorship'}>
      {done ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-[3px] border border-ink/15 bg-paper2 p-3">
            <Avatar name={mentor.name} avatar={mentor.avatar} size="md" />
            <p className="text-sm text-ink">
              Your request is with {mentor.name.split(' ')[0]}. You will get a DM the moment they
              accept.
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-primary w-full">
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-3 rounded-[3px] border border-ink/15 bg-paper2 p-3">
            <Avatar name={mentor.name} avatar={mentor.avatar} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{mentor.name}</p>
              <p className="truncate text-xs text-inksoft">{mentor.headline}</p>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="request-message">
              What do you need help with?
            </label>
            <textarea
              id="request-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="input min-h-[110px] resize-y"
              placeholder="Be specific. One question and one sentence of context works better than a paragraph of background."
              maxLength={1000}
              required
            />
            <p className="mt-1.5 text-[11px] text-inksoft">
              {message.trim().length} of 1000 characters. At least 15.
            </p>
          </div>

          <ErrorNote message={error} />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={saving || message.trim().length < 15} className="btn-primary">
              {saving ? 'Sending…' : 'Send the request'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
