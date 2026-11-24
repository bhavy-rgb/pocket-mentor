import { Link } from 'react-router-dom'
import { DOMAIN_META, DOMAINS } from '../types'

const ROOMS = DOMAINS.map((domain) => ({
  domain,
  label: DOMAIN_META[domain].label,
  ink: DOMAIN_META[domain].ink,
  line:
    domain === 'tech'
      ? 'Resumes that survive a screen, system design without the hand-waving, the first dev job.'
      : domain === 'finance'
        ? 'Articleship, audit against FP&A, and how to read an annual report without drowning.'
        : domain === 'law'
          ? 'Drafting your first contract, litigation as a career, and what a tier-1 firm really wants.'
          : 'Finding a beat, sourcing a story, and the number behind the headline.',
}))

const STEPS = [
  {
    title: 'Post what you are stuck on',
    body: 'A question, a lesson you learned the hard way, or your notes. It goes in one of the four rooms.',
  },
  {
    title: 'Read the suggestions',
    body: 'Anyone can answer under your post. Advice stays attached to the question that produced it.',
  },
  {
    title: 'Ask one senior directly',
    body: 'Send a mentorship request with your question. If they accept, a private thread opens between you.',
  },
]

const EXTRAS = [
  {
    title: 'Requests, not cold messages',
    body: 'A request carries your question, so a senior can judge whether they can help before they accept.',
  },
  {
    title: 'Notes worth keeping',
    body: 'Posts are marked as a question, an experience, or notes, so you can go back and find the useful ones.',
  },
  {
    title: 'Four rooms, no noise',
    body: 'You follow the rooms you are in. A law student is not shown system design threads.',
  },
  {
    title: 'A record of who helped',
    body: 'Every accepted request stays in your messages, so the advice is still there in two years.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/15">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="mt-1 inline-block h-2 w-2 rotate-45 bg-pen" aria-hidden="true" />
            <span className="font-serif text-[17px] font-medium tracking-tight text-ink">
              Pocket Mentor
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <a href="#how" className="hidden text-[13px] text-inksoft hover:text-ink sm:block">
              How it works
            </a>
            <Link to="/login" className="text-[13px] text-ink hover:text-pen">
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary">
              Create an account
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div>
            <h1 className="text-balance font-serif text-[clamp(2.4rem,5.2vw,3.6rem)] font-normal leading-[1.03] tracking-[-0.022em] text-ink">
              Your senior already wrote the answer down.
            </h1>
            <p className="measure mt-5 font-serif text-[17px] leading-[1.62] text-ink/80">
              Pocket Mentor is where final year students trade the notes that actually helped: what
              belongs on a resume, which article to read before a CA interview, how to draft a first
              contract. You ask in the open, and someone two years ahead answers.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/signup" className="btn-primary">
                Create an account
              </Link>
              <Link to="/login" className="btn-ghost">
                Look around first
              </Link>
            </div>
            <p className="mt-5 text-[12.5px] leading-relaxed text-inksoft">
              Demo account: meera@pocket.dev, password demo1234.
            </p>
          </div>

          <figure className="sheet relative px-5 pb-4 pt-4 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-[15px] text-ink">Meera Raghavan</p>
                <p className="text-[11px] text-inksoft">Staff engineer, Razorpay. Mentor, 9 years.</p>
              </div>
              <span className="stamp animate-stamp shrink-0 text-ink-tech">Tech</span>
            </div>

            <h2 className="mt-3 font-serif text-[1.12rem] leading-[1.3] text-ink">
              What I look for when I screen a backend resume
            </h2>

            <p className="mt-2 font-serif text-[14.5px] leading-[1.62] text-ink/85">
              I have read about six hundred junior resumes. The ones that survive the first twenty
              seconds do three things. One: <span className="hl">a project described with a number</span>,
              not a project described with an adjective. Two: a stack list short enough that you can
              defend every line. Three: nothing about being a team player.
            </p>

            <p className="animate-pen pen-note mt-3 text-right">
              the number is the whole trick
            </p>

            <div className="mt-3 flex items-center gap-4 border-t border-ink/10 pt-2.5 text-[11.5px] text-inksoft">
              <span>34 liked this</span>
              <span>12 suggestions</span>
            </div>
          </figure>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14">
        <h2 className="font-serif text-[1.45rem] leading-tight text-ink">Four rooms, one notebook</h2>
        <p className="measure mt-1.5 text-[13.5px] leading-relaxed text-inksoft">
          Each room has its own seniors. You only see the one you are standing in.
        </p>
        <dl className="mt-5 border-t border-ink/15">
          {ROOMS.map((room) => (
            <div
              key={room.domain}
              className="grid grid-cols-[70px_minmax(0,1fr)] items-baseline gap-3 border-b border-ink/10 py-3"
            >
              <dt>
                <span className={`stamp stamp-flat ${room.ink}`}>{room.label}</span>
              </dt>
              <dd className="text-[13.5px] leading-relaxed text-ink/80">{room.line}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="how" className="mx-auto max-w-5xl px-4 pb-14">
        <h2 className="font-serif text-[1.45rem] leading-tight text-ink">How it works</h2>
        <ol className="mt-4 border-t border-ink/15">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[26px_minmax(0,1fr)] gap-3 border-b border-ink/10 py-3.5"
            >
              <span className="font-serif text-[15px] leading-6 text-pen">{index + 1}</span>
              <div>
                <h3 className="font-serif text-[15.5px] leading-snug text-ink">{step.title}</h3>
                <p className="measure mt-0.5 text-[13px] leading-relaxed text-inksoft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="font-serif text-[1.45rem] leading-tight text-ink">What you get</h2>
        <div className="mt-4 grid gap-x-10 sm:grid-cols-2">
          {EXTRAS.map((extra) => (
            <div key={extra.title} className="border-t border-ink/12 py-3">
              <h3 className="text-[13.5px] font-semibold text-ink">{extra.title}</h3>
              <p className="mt-0.5 text-[13px] leading-relaxed text-inksoft">{extra.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="sheet px-6 py-9 text-center sm:px-10">
          <h2 className="text-balance font-serif text-[1.6rem] leading-tight text-ink">
            Ask your first question tonight.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-inksoft">
            Making an account takes thirty seconds. A senior usually answers within a day.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="btn-primary">
              Create an account
            </Link>
            <Link to="/login" className="btn-ghost">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/15 px-4 py-5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-1.5 text-[11px] text-inksoft sm:flex-row">
          <div className="flex items-center gap-4">
            <p>Pocket Mentor</p>
            <Link to="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-ink">
              Privacy
            </Link>
          </div>
          <p>build {__BUILD_STAMP__}</p>
        </div>
      </footer>
    </div>
  )
}
