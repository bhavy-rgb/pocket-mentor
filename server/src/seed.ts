import { hashPassword } from './auth.js'
import type {
  Activity,
  Comment,
  Conversation,
  DB,
  Follow,
  MentorRequest,
  Message,
  Post,
  User,
} from './types.js'

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/**
 * Demo dataset: five people, four mentors (one per room) and one junior.
 * Every seeded account uses the password: demo1234
 * Delete server/data/db.json (npm run reset:data) to start clean.
 */
export function buildSeed(): DB {
  const t = Date.now()
  const ago = (ms: number) => new Date(t - ms).toISOString()
  const pw = hashPassword('demo1234')

  const users: User[] = [
    {
      id: 'u_meera',
      name: 'Meera Raghavan',
      email: 'meera@pocket.dev',
      passwordHash: pw,
      role: 'senior',
      domain: 'tech',
      headline: 'Staff Engineer at Razorpay, ex-Flipkart',
      bio: 'Backend and payments infra. I review resumes and run mock system-design rounds on weekends. Ask me the dumb question first, it is usually the important one.',
      years: 9,
      company: 'Razorpay',
      avatar: 'mint',
      createdAt: ago(120 * DAY),
    },
    {
      id: 'u_arjun',
      name: 'Arjun Deshpande',
      email: 'arjun@pocket.dev',
      passwordHash: pw,
      role: 'senior',
      domain: 'finance',
      headline: 'Chartered Accountant, ex-EY, now in FP&A',
      bio: 'I cleared CA in the first attempt and spent four years in audit. Happy to look at your articleship CV, or explain how a P&L actually talks to a cash-flow statement.',
      years: 7,
      company: 'Zerodha',
      avatar: 'amber',
      createdAt: ago(110 * DAY),
    },
    {
      id: 'u_fatima',
      name: 'Fatima Sheikh',
      email: 'fatima@pocket.dev',
      passwordHash: pw,
      role: 'senior',
      domain: 'law',
      headline: 'Advocate, Bombay High Court, corp and tech contracts',
      bio: 'Litigation for six years, now mostly commercial contracts and data-protection work. I will tell you honestly whether law is the right fit before you spend three years on it.',
      years: 8,
      company: 'Independent practice',
      avatar: 'violet',
      createdAt: ago(95 * DAY),
    },
    {
      id: 'u_ravi',
      name: 'Ravi Menon',
      email: 'ravi@pocket.dev',
      passwordHash: pw,
      role: 'senior',
      domain: 'news',
      headline: 'Business editor, markets and policy desk',
      bio: 'Fifteen years across wire agencies and a business daily. I read drafts, teach you to find the number behind the headline, and explain what a desk actually wants from a fresher.',
      years: 15,
      company: 'Business daily',
      avatar: 'sky',
      createdAt: ago(150 * DAY),
    },
    {
      id: 'u_kabir',
      name: 'Kabir Singh',
      email: 'kabir@pocket.dev',
      passwordHash: pw,
      role: 'junior',
      domain: 'tech',
      headline: 'Third year CSE, NIT Trichy, learning backend',
      bio: 'Building small things in Node and Go. Currently stuck on distributed systems basics and looking for someone to sanity-check my roadmap.',
      years: 0,
      company: 'NIT Trichy',
      avatar: 'lime',
      createdAt: ago(40 * DAY),
    },
  ]

  const posts: Post[] = [
    {
      id: 'p_1',
      authorId: 'u_meera',
      title: 'What I actually look for when I screen a backend resume',
      body: 'I have read a lot of intern and junior resumes in three years. The ones that survive the first 20 seconds almost always do the same three things.\n\nFirst, one project described with a number. "Built a URL shortener" tells me nothing. "Built a URL shortener handling 4k redirects a day on a single t3.micro, with a Redis cache that cut p99 from 90ms to 12ms" tells me you can measure. Second, the stack list is short and every item is defensible. If I ask about it and you go quiet, that line hurt you. Third, no "team player, hardworking" paragraph. That space is better spent on what broke and how you found it.\n\nIf you are a second or third year student: one deployed project beats five tutorials. I will read a slightly ugly repo with a real README over a perfect one nobody can run.',
      domain: 'tech',
      kind: 'experience',
      tags: ['resume', 'hiring', 'backend'],
      likes: ['u_kabir', 'u_arjun', 'u_fatima'],
      createdAt: ago(2 * DAY),
    },
    {
      id: 'p_2',
      authorId: 'u_kabir',
      title: 'Is this the right order for a distributed systems roadmap?',
      body: 'I have done DS Algo, basic OS, and I can build a CRUD API in Node without help. Now I want to actually understand why systems fall over at scale, not just repeat "use Kafka" in interviews.\n\nMy plan: (1) read DDIA chapters 1 to 5 slowly, (2) rebuild a small key-value store with a write-ahead log, (3) add replication, (4) then a queue. Roughly three months at eight hours a week.\n\nSeniors, is this the right order? Is there something I should do before DDIA that I am skipping?',
      domain: 'tech',
      kind: 'question',
      tags: ['distributed-systems', 'roadmap'],
      likes: ['u_meera', 'u_ravi'],
      createdAt: ago(26 * HOUR),
    },
    {
      id: 'p_3',
      authorId: 'u_arjun',
      title: 'Audit vs FP&A for a CA fresher: the honest trade-off',
      body: 'Everyone says "start with audit, you will learn the business". That is true and also incomplete.\n\nAudit teaches you how numbers are tested, how controls break, and how to talk to a client who does not want to give you the file. It is brutal from January to March and it makes you very good at detail. FP&A teaches you how a business is steered: budgets, variance, the monthly deck the CFO actually reads. You learn modelling faster, but you can end up as a spreadsheet person who has never closed a book.\n\nMy take: if you want a controllership or CFO track, two years of audit is worth the pain. If you want to move into strategy or a startup finance role in three years, going straight into FP&A is not the mistake people warn you about. What you should not do is pick based on which one sounds more prestigious in your family group chat.',
      domain: 'finance',
      kind: 'experience',
      tags: ['articleship', 'career', 'CA'],
      likes: ['u_kabir', 'u_fatima'],
      createdAt: ago(3 * DAY),
    },
    {
      id: 'p_4',
      authorId: 'u_arjun',
      title: 'How to read an annual report without drowning',
      body: 'A student asked me this last week and I wrote the answer out, so here it is properly.\n\nStart with the cash-flow statement, not the P&L. Then read three notes to accounts: revenue recognition, related-party transactions, contingent liabilities. Then the auditor report, in full, because whatever they were uncomfortable signing is usually the story.\n\nOne test that has never failed me: if operating cash flow and PAT diverge for three years running, stop and read every note before you form an opinion. The company is telling you something and it is not in the chairman letter.',
      domain: 'finance',
      kind: 'resource',
      tags: ['annual-report', 'equity-research'],
      likes: ['u_ravi', 'u_kabir'],
      createdAt: ago(30 * HOUR),
    },
    {
      id: 'p_5',
      authorId: 'u_fatima',
      title: 'Drafting your first contract: the four clauses that actually matter',
      body: 'Interns spend days on formatting and skip the parts that cost money. In almost every commercial dispute I have seen, the fight was about four things.\n\nScope: exactly what is being delivered, described so a third party could verify it. Payment and the consequence of delay: a due date without a remedy is a wish. Termination and transition: can either side walk, and what happens to data and handover. Liability cap and indemnity: who pays if it all goes wrong, and how much. Everything else is negotiable polish.\n\nA tip that took me years: read the draft out loud as the angriest person on the other side. Wherever you cannot answer "and then what?", that is your missing clause.',
      domain: 'law',
      kind: 'resource',
      tags: ['contracts', 'drafting', 'internship'],
      likes: ['u_kabir', 'u_ravi'],
      createdAt: ago(4 * DAY),
    },
    {
      id: 'p_6',
      authorId: 'u_fatima',
      title: 'Is a litigation-first start still worth it in 2026?',
      body: 'Students ask me this every month, and the honest answer is: not for everyone, and not in the way it is usually sold.\n\nTwo years in a district court will teach you how a matter actually moves, how to read a judge, and how to get a clerk to help you. That is craft you cannot buy later. But it pays badly, and the people who romanticise it usually have a family practice to fall back on.\n\nMy advice, and I say it as someone who did it: if you have loans, take the firm job, save for eighteen months, then decide with a cushion. Court craft is a skill you can learn at 27. Debt at nine per cent is not a personality trait.',
      domain: 'law',
      kind: 'experience',
      tags: ['litigation', 'career'],
      likes: ['u_kabir', 'u_arjun'],
      createdAt: ago(50 * HOUR),
    },
    {
      id: 'p_7',
      authorId: 'u_ravi',
      title: 'What a business desk wants from a fresher (and it is not good writing)',
      body: 'I hire two or three reporters a year. The ones who last are not the best prose stylists. They are the ones who can find a number nobody else has and then explain why it moved.\n\nPractical version: pick one sector. Read its quarterly filings for two quarters. Keep a running note of every figure that surprised you. When a story breaks, you will have the context that a generalist reporter does not. That is how you get your first byline in month two instead of month nine.\n\nAlso, learn to call people. A fresher who can get an investor-relations officer on the phone is worth more than one who can write a beautiful lede but is scared of the phone.',
      domain: 'news',
      kind: 'experience',
      tags: ['journalism', 'beat-reporting'],
      likes: ['u_arjun', 'u_kabir'],
      createdAt: ago(5 * DAY),
    },
    {
      id: 'p_8',
      authorId: 'u_meera',
      title: 'Notes: the backend interview loop, decoded',
      body: 'Three rounds, three different muscles, and people prepare for them in the wrong order.\n\nCoding is not puzzle trivia, it is "can you hold a data structure in your head while you talk". Systems is not "draw boxes", it is "what happens when one of these dies". Craft is not a Gantt chart, it is what you cut when the deadline does not move.\n\nThe one-page template I use for prep is in the comments. The three questions I ask myself before any answer: what is the constraint, what am I trading away, and how would I know I was wrong?',
      domain: 'tech',
      kind: 'resource',
      tags: ['interviews', 'system-design', 'notes'],
      likes: ['u_kabir', 'u_arjun', 'u_fatima'],
      createdAt: ago(20 * HOUR),
    },
    {
      id: 'p_9',
      authorId: 'u_ravi',
      title: 'What the RBI holding rates means if you are job hunting in BFSI',
      body: 'The MPC kept the repo rate unchanged for the fourth meeting. For students this is not abstract: flat rates plus a slow credit cycle usually means banks hire carefully and NBFCs hire in bursts.\n\nIf you are interviewing in BFSI this quarter, expect questions on credit cost and NPAs rather than on growth. Read the last two quarterly investor decks of any lender you are interviewing with. They will tell you exactly what the interviewer is worried about.',
      domain: 'news',
      kind: 'experience',
      tags: ['RBI', 'policy', 'BFSI'],
      likes: ['u_arjun'],
      createdAt: ago(8 * HOUR),
    },
  ]

  const comments: Comment[] = [
    {
      id: 'c_1',
      postId: 'p_2',
      authorId: 'u_meera',
      body: 'Order is fine, one change: do the key-value store before DDIA chapter 5, not after. Chapter 5 on replication reads very differently once you have tried to add a second node yourself and watched it go wrong.',
      createdAt: ago(22 * HOUR),
    },
    {
      id: 'c_2',
      postId: 'p_1',
      authorId: 'u_arjun',
      body: 'The "one project with a number" rule holds in finance too. "Built a model" is noise. "Rebuilt the monthly forecast so close took two days instead of nine" is a hiring argument.',
      createdAt: ago(44 * HOUR),
    },
    {
      id: 'c_3',
      postId: 'p_4',
      authorId: 'u_ravi',
      body: 'Journalist version of the same trick: read the auditor report first. Whatever they were uncomfortable signing is usually the story.',
      createdAt: ago(20 * HOUR),
    },
    {
      id: 'c_4',
      postId: 'p_1',
      authorId: 'u_kabir',
      body: 'The "one project with a number" line is brutal and correct. I rewrote my resume last night and cut four bullets. Thank you.',
      createdAt: ago(40 * HOUR),
    },
    {
      id: 'c_5',
      postId: 'p_1',
      authorId: 'u_fatima',
      body: '"Every item is defensible" is the same test in law. Nobody believes a list of statutes you cannot explain, and interviewers can hear it in one question.',
      createdAt: ago(36 * HOUR),
    },
    {
      id: 'c_6',
      postId: 'p_8',
      authorId: 'u_kabir',
      body: 'Saved. "What am I trading away" is the question I never ask, and it is the one my mock interviews keep dying on.',
      createdAt: ago(16 * HOUR),
    },
    {
      id: 'c_7',
      postId: 'p_6',
      authorId: 'u_ravi',
      body: 'Every court reporter I know learned the trade in a district court, and every one of them had a cushion first. The ones who did not burned out inside two years.',
      createdAt: ago(46 * HOUR),
    },
    {
      id: 'c_8',
      postId: 'p_9',
      authorId: 'u_arjun',
      body: 'Adding one: ask what their credit cost assumption is for next year. If they cannot answer, they are hoping, not planning.',
      createdAt: ago(5 * HOUR),
    },
    {
      id: 'c_9',
      postId: 'p_5',
      authorId: 'u_kabir',
      body: 'The "read it as the angriest person on the other side" test is going into my notes. I am reviewing an internship offer letter this week and it has exactly the vague scope clause you describe.',
      createdAt: ago(70 * HOUR),
    },
  ]

  const requests: MentorRequest[] = [
    {
      id: 'r_1',
      fromId: 'u_kabir',
      toId: 'u_meera',
      message: 'I am in third year at NIT Trichy and working through your distributed systems advice. Would you have 20 minutes this month to sanity-check my roadmap?',
      status: 'accepted',
      createdAt: ago(6 * DAY),
      updatedAt: ago(5 * DAY),
    },
    {
      id: 'r_2',
      fromId: 'u_kabir',
      toId: 'u_arjun',
      message: 'I am a CSE student but I am considering an analytics role at a bank. Could I ask two questions about how finance teams actually hire?',
      status: 'pending',
      createdAt: ago(2 * DAY),
      updatedAt: ago(2 * DAY),
    },
    {
      id: 'r_3',
      fromId: 'u_kabir',
      toId: 'u_fatima',
      message: 'I have an internship offer letter with an IP clause I do not understand. Would you be open to looking at one page of it?',
      status: 'pending',
      createdAt: ago(30 * HOUR),
      updatedAt: ago(30 * HOUR),
    },
  ]

  const conversations: Conversation[] = [
    {
      id: 'cv_1',
      members: ['u_kabir', 'u_meera'],
      createdAt: ago(5 * DAY),
      updatedAt: ago(3 * HOUR),
    },
  ]

  const messages: Message[] = [
    {
      id: 'm_1',
      conversationId: 'cv_1',
      senderId: 'u_meera',
      body: 'Accepted your request, happy to help. Send me the roadmap doc when it is ready.',
      createdAt: ago(5 * DAY),
    },
    {
      id: 'm_2',
      conversationId: 'cv_1',
      senderId: 'u_kabir',
      body: 'Thank you. Here it is in short: DDIA 1 to 5, then a small KV store with a WAL, then replication, then a queue. About three months at eight hours a week.',
      createdAt: ago(4 * DAY),
    },
    {
      id: 'm_3',
      conversationId: 'cv_1',
      senderId: 'u_meera',
      body: 'Good shape. Move the KV store before chapter 5, replication lands much harder once you have broken a node yourself. And keep a one-page note per chapter.',
      createdAt: ago(3 * HOUR),
    },
  ]

  const follows: Follow[] = [
    { followerId: 'u_kabir', followingId: 'u_meera', createdAt: ago(6 * DAY) },
    { followerId: 'u_kabir', followingId: 'u_arjun', createdAt: ago(2 * DAY) },
    { followerId: 'u_kabir', followingId: 'u_fatima', createdAt: ago(3 * DAY) },
    { followerId: 'u_meera', followingId: 'u_ravi', createdAt: ago(20 * DAY) },
    { followerId: 'u_arjun', followingId: 'u_ravi', createdAt: ago(30 * DAY) },
  ]

  const activities: Activity[] = [
    {
      id: 'a_1',
      type: 'post',
      actorId: 'u_ravi',
      postId: 'p_9',
      text: 'published a market note in News',
      createdAt: ago(8 * HOUR),
    },
    {
      id: 'a_2',
      type: 'post',
      actorId: 'u_meera',
      postId: 'p_8',
      text: 'shared interview notes in Tech',
      createdAt: ago(20 * HOUR),
    },
    {
      id: 'a_3',
      type: 'comment',
      actorId: 'u_meera',
      postId: 'p_2',
      text: 'answered a roadmap question',
      createdAt: ago(22 * HOUR),
    },
    {
      id: 'a_4',
      type: 'request',
      actorId: 'u_kabir',
      targetUserId: 'u_fatima',
      text: 'sent a mentorship request',
      createdAt: ago(30 * HOUR),
    },
    {
      id: 'a_5',
      type: 'comment',
      actorId: 'u_arjun',
      postId: 'p_9',
      text: 'added a suggestion on credit cost',
      createdAt: ago(5 * HOUR),
    },
    {
      id: 'a_6',
      type: 'accepted',
      actorId: 'u_meera',
      targetUserId: 'u_kabir',
      text: 'accepted a mentorship request',
      createdAt: ago(5 * DAY),
    },
    {
      id: 'a_7',
      type: 'signup',
      actorId: 'u_kabir',
      text: 'joined Pocket Mentor as a junior',
      createdAt: ago(40 * DAY),
    },
  ]

  return { users, posts, comments, requests, conversations, messages, follows, activities }
}
