export type Domain = 'tech' | 'finance' | 'law' | 'news'
export type Role = 'junior' | 'senior'
export type PostKind = 'experience' | 'question' | 'resource'
export type RequestStatus = 'pending' | 'accepted' | 'declined'

export const DOMAINS: Domain[] = ['tech', 'finance', 'law', 'news']

export const DOMAIN_LABEL: Record<Domain, string> = {
  tech: 'Tech',
  finance: 'Finance',
  law: 'Law',
  news: 'News',
}

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: Role
  domain: Domain
  headline: string
  bio: string
  years: number
  company: string
  avatar: string
  createdAt: string
}

export interface Post {
  id: string
  authorId: string
  title: string
  body: string
  domain: Domain
  kind: PostKind
  tags: string[]
  likes: string[]
  createdAt: string
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  body: string
  createdAt: string
}

export interface MentorRequest {
  id: string
  fromId: string
  toId: string
  message: string
  status: RequestStatus
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  members: string[]
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
  /** ids of members who have seen this message */
  readBy?: string[]
}

export interface Follow {
  followerId: string
  followingId: string
  createdAt: string
}

export type ActivityType = 'post' | 'comment' | 'request' | 'accepted' | 'follow' | 'signup'

export interface Activity {
  id: string
  type: ActivityType
  actorId: string
  postId?: string
  targetUserId?: string
  text: string
  createdAt: string
}

export interface DB {
  users: User[]
  posts: Post[]
  comments: Comment[]
  requests: MentorRequest[]
  conversations: Conversation[]
  messages: Message[]
  follows: Follow[]
  activities: Activity[]
}

/** Shape of a user as sent to the browser (no password hash). */
export interface PublicUser {
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
