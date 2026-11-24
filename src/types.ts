export type Domain = 'tech' | 'finance' | 'law' | 'news'
export type Role = 'junior' | 'senior'
export type PostKind = 'experience' | 'question' | 'resource'
export type RequestStatus = 'pending' | 'accepted' | 'declined'

export interface User {
  id: string
  name: string
  email?: string
  role: Role
  domain: Domain
  headline: string
  bio: string
  years: number
  company: string
  avatar: string
  createdAt: string
  followers?: number
  following?: number
  postCount?: number
  isFollowing?: boolean
}

export interface Author {
  id: string
  name: string
  avatar: string
  role: Role
  domain: Domain
  headline: string
  years: number
  company: string
}

export interface Post {
  id: string
  authorId: string
  title: string
  body: string
  domain: Domain
  kind: PostKind
  tags: string[]
  createdAt: string
  likeCount: number
  liked: boolean
  commentCount: number
  author: Author | null
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  body: string
  createdAt: string
  author: Author | null
}

export interface MentorRequest {
  id: string
  fromId: string
  toId: string
  message: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
  from: Author | null
  to: Author | null
}

export interface ConversationSummary {
  id: string
  peer: Author | null
  lastMessage: { body: string; senderId: string; createdAt: string } | null
  unread: number
  updatedAt: string
}

export interface ChatMessage {
  id: string
  body: string
  senderId: string
  createdAt: string
  mine: boolean
  sender: Author | null
}

export interface ActivityRow {
  id: string
  type: 'post' | 'comment' | 'request' | 'accepted' | 'follow' | 'signup'
  text: string
  createdAt: string
  actor: Author | null
  postTitle: string | null
  postId: string | null
}

export interface Stats {
  totals: {
    members: number
    mentors: number
    juniors: number
    posts: number
    suggestions: number
    connections: number
    pending: number
  }
  postsPerDomain: { domain: Domain; posts: number; mentors: number }[]
  last7Days: { label: string; count: number }[]
}

export const DOMAIN_META: Record<
  Domain,
  { label: string; ink: string; tint: string; dot: string }
> = {
  tech: {
    label: 'Tech',
    ink: 'text-ink-tech',
    tint: 'text-ink-tech border-ink-tech/45 bg-ink-tech/[0.06]',
    dot: 'bg-ink-tech',
  },
  finance: {
    label: 'Finance',
    ink: 'text-ink-finance',
    tint: 'text-ink-finance border-ink-finance/45 bg-ink-finance/[0.06]',
    dot: 'bg-ink-finance',
  },
  law: {
    label: 'Law',
    ink: 'text-ink-law',
    tint: 'text-ink-law border-ink-law/45 bg-ink-law/[0.06]',
    dot: 'bg-ink-law',
  },
  news: {
    label: 'News',
    ink: 'text-ink-news',
    tint: 'text-ink-news border-ink-news/45 bg-ink-news/[0.06]',
    dot: 'bg-ink-news',
  },
}

export const DOMAINS: Domain[] = ['tech', 'finance', 'law', 'news']

export const KIND_META: Record<PostKind, { label: string }> = {
  experience: { label: 'Experience' },
  question: { label: 'Question' },
  resource: { label: 'Notes' },
}
