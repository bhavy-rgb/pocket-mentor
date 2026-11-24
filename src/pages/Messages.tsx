import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { EmptyState, ErrorNote } from '../components/Feedback'
import { Icon } from '../components/Icon'
import { LoadingBlock } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { clockTime, timeAgo } from '../lib/format'
import type { ChatMessage, ConversationSummary } from '../types'

export default function Messages() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [peer, setPeer] = useState<ConversationSummary['peer']>(null)
  const [draft, setDraft] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingThread, setLoadingThread] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    try {
      const data = await api<{ conversations: ConversationSummary[] }>('/dm/conversations')
      setConversations(data.conversations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your inbox.')
    } finally {
      setLoadingList(false)
    }
  }, [])

  const loadThread = useCallback(
    async (conversationId: string) => {
      setLoadingThread(true)
      try {
        const data = await api<{ conversation: { id: string; peer: ConversationSummary['peer'] }; messages: ChatMessage[] }>(
          `/dm/conversations/${conversationId}/messages`,
        )
        setMessages(data.messages)
        setPeer(data.conversation.peer)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not open that conversation.')
      } finally {
        setLoadingThread(false)
      }
    },
    [],
  )

  useEffect(() => {
    void loadConversations()
    const timer = window.setInterval(() => void loadConversations(), 8000)
    return () => window.clearInterval(timer)
  }, [loadConversations])

  useEffect(() => {
    if (!id) {
      setMessages([])
      setPeer(null)
      return
    }
    void loadThread(id)
    const timer = window.setInterval(() => void loadThread(id), 5000)
    return () => window.clearInterval(timer)
  }, [id, loadThread])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  const send = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id || !draft.trim()) return
    const body = draft.trim()
    setDraft('')
    try {
      const data = await api<{ message: ChatMessage }>(`/dm/conversations/${id}/messages`, {
        method: 'POST',
        body: { body },
      })
      setMessages((current) => [...current, data.message])
      void loadConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message did not send.')
      setDraft(body)
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-ink">Messages</h1>
        <p className="mt-0.5 text-[13px] text-inksoft">
          Private threads with mentors who accepted your request.
        </p>
      </header>

      <ErrorNote message={error} />

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <section className={`sheet overflow-hidden ${id ? 'hidden lg:block' : ''}`}>
          <div className="border-b border-ink/10 px-4 py-3">
            <p className="font-serif text-[14px] text-ink">
              Inbox
              <span className="ml-1.5 text-[11.5px] text-inksoft">
                {conversations.length} {conversations.length === 1 ? 'thread' : 'threads'}
              </span>
            </p>
          </div>
          {loadingList ? (
            <div className="px-4 py-8 text-center text-xs text-inksoft">Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-inksoft">
                No threads yet. Send a mentor request and it opens here when accepted.
              </p>
              <Link to="/people" className="btn-ghost mt-3 !py-1.5 !text-[12px]">
                Find a mentor
              </Link>
            </div>
          ) : (
            <ul className="max-h-[65vh] overflow-y-auto">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    to={`/messages/${conversation.id}`}
                    className={`flex items-start gap-2.5 border-b border-ink/10 px-3.5 py-3 transition hover:bg-ink/4 ${
                      id === conversation.id ? 'bg-ink/[0.06]' : ''
                    }`}
                  >
                    <Avatar
                      name={conversation.peer?.name ?? 'Member'}
                      avatar={conversation.peer?.avatar}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13px] font-medium text-ink">
                          {conversation.peer?.name ?? 'Member'}
                        </p>
                        {conversation.unread > 0 ? (
                          <span className="ml-auto rounded-full bg-pen px-1.5 py-0.5 text-[10px] font-semibold text-paper">
                            {conversation.unread}
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-[11.5px] text-inksoft">
                        {conversation.lastMessage
                          ? `${conversation.lastMessage.senderId === user?.id ? 'You: ' : ''}${conversation.lastMessage.body}`
                          : 'No messages yet'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-inksoft">
                        {conversation.lastMessage ? timeAgo(conversation.lastMessage.createdAt) : ''}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="sheet flex min-h-[60vh] flex-col overflow-hidden">
          {!id ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon="✉"
                title="Pick a conversation"
                hint="Your accepted mentor threads appear on the left."
              />
            </div>
          ) : loadingThread && !messages.length ? (
            <LoadingBlock label="Opening thread…" />
          ) : (
            <>
              <div className="flex items-center gap-2.5 border-b border-ink/10 px-4 py-3">
                <Link to="/messages" className="btn-quiet lg:hidden" aria-label="Back to inbox">
                  <span className="rotate-180">
                    <Icon name="arrow" size={14} />
                  </span>
                </Link>
                <Avatar name={peer?.name ?? 'Member'} avatar={peer?.avatar} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">
                    {peer?.name ?? 'Member'}
                  </p>
                  <p className="truncate text-[11px] text-inksoft">{peer?.headline}</p>
                </div>
                {peer ? (
                  <Link
                    to={`/profile/${peer.id}`}
                    className="btn-quiet ml-auto"
                    aria-label="Open profile"
                  >
                    <Icon name="user" size={14} />
                  </Link>
                ) : null}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ maxHeight: '55vh' }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${message.mine ? 'justify-end' : 'justify-start'}`}
                  >
                    {!message.mine ? (
                      <Avatar
                        name={message.sender?.name ?? 'Member'}
                        avatar={message.sender?.avatar}
                        size="xs"
                      />
                    ) : null}
                    <div
                      className={`max-w-[78%] rounded-[3px] px-3.5 py-2.5 font-serif text-[14px] leading-[1.55] ${
                        message.mine
                          ? 'bg-mark/45 text-ink'
                          : 'border border-[var(--paper-edge)] bg-paper2/70 text-ink/90'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.body}</p>
                      <p
                        className={`mt-1 text-[10px] ${message.mine ? 'text-ink/60' : 'text-inksoft'}`}
                      >
                        {clockTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {!messages.length ? (
                  <p className="py-10 text-center text-xs text-inksoft">
                    Say hello. A specific question gets a faster reply.
                  </p>
                ) : null}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="flex items-center gap-2 border-t border-ink/10 p-3">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="input"
                  placeholder="Write a message…"
                  aria-label="Message"
                />
                <button type="submit" disabled={!draft.trim()} className="btn-primary !px-3.5">
                  <Icon name="send" size={16} />
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
