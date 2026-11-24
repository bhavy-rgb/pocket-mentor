import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link to="/" className="text-[12.5px] text-inksoft hover:text-ink">
        Back to Pocket Mentor
      </Link>
      <article className="sheet mt-3 px-6 py-7 sm:px-8">
        <h1 className="font-serif text-[1.8rem] leading-tight text-ink">{title}</h1>
        <p className="mt-1 text-[12px] text-inksoft">Last updated {updated}</p>
        <div className="measure mt-5 space-y-4 font-serif text-[15.5px] leading-[1.62] text-ink/90">
          {children}
        </div>
      </article>
    </div>
  )
}

export function Terms() {
  return (
    <LegalPage title="Terms of use" updated="24 November 2026">
      <p>
        Pocket Mentor is a small project, not a company. It exists so that students can ask seniors
        for advice. By making an account you agree to the points below.
      </p>
      <h2 className="font-serif text-[1.1rem] text-ink">Your account</h2>
      <p>
        One account per person, and you must be 13 or older. You are responsible for what is posted
        from your account, including in private messages. Keep your password to yourself; the demo
        accounts on the sign-in page are shared on purpose and hold no real data.
      </p>
      <h2 className="font-serif text-[1.1rem] text-ink">What you write</h2>
      <p>
        You keep ownership of your posts, notes and messages. Do not post anything confidential, or
        anything you do not have the right to share, such as an employer's internal documents. Do not
        post abuse, harassment, or other people's private information. Content that does can be
        removed and the account closed.
      </p>
      <h2 className="font-serif text-[1.1rem] text-ink">Advice is advice</h2>
      <p>
        Mentors here are volunteers answering from their own experience. Nothing on Pocket Mentor is
        legal, financial, medical or professional advice, and no mentor relationship creates a
        professional duty of care. Check anything important with a qualified person before you act on
        it.
      </p>
      <h2 className="font-serif text-[1.1rem] text-ink">No warranty</h2>
      <p>
        The service is provided as it is. It may be reset, changed, or taken offline without notice,
        and the demo dataset can be regenerated at any time. Do not use it as your only copy of
        anything you care about.
      </p>
      <h2 className="font-serif text-[1.1rem] text-ink">Questions</h2>
      <p>
        Write to the person who runs this instance. If you are running it yourself, that is you.
      </p>
    </LegalPage>
  )
}

export function Privacy() {
  return (
    <LegalPage title="Privacy" updated="24 November 2026">
      <p>
        This page describes exactly what this instance of Pocket Mentor stores, because it is a small
        app and the whole list fits on one page.
      </p>
      <h2 className="font-serif text-[1.1rem] text-ink">What is stored</h2>
      <p>
        Your name, email address, a scrypt hash of your password, your role and room, your headline
        and bio, the posts and suggestions you write, mentorship requests you send or receive, and the
        messages in your threads. Nothing else. There is no profile tracking, no advertising
        identifier, and no third-party analytics script anywhere in the app.
      </p>
      <h2 className="font-serif text-[1.1rem] text-ink">Where it is stored</h2>
      <p>
        In a single JSON file on the server that runs this instance, at
        <span className="font-mono text-[13px]"> server/data/db.json</span>. It is not sent to any
        external service. Fonts are served from the app itself rather than a font CDN.
      </p>
      <h2 className="font-serif text-[1.1rem] text-ink">What other people see</h2>
      <p>
        Your name, headline, room, bio, posts and suggestions are visible to other signed-in members.
        Your email address is never shown to anyone. Mentorship requests are visible only to the two
        people involved, and messages only to the members of that thread.
      </p>
      <h2 className="font-serif text-[1.1rem] text-ink">Cookies</h2>
      <p>
        None. The app keeps your sign-in token in your browser's local storage so you stay signed in,
        and clears it when you sign out.
      </p>
      <h2 className="font-serif text-[1.1rem] text-ink">Deleting your data</h2>
      <p>
        Ask the person running this instance to remove your account, which also removes your posts,
        suggestions and messages. If you run it yourself, delete the row from
        <span className="font-mono text-[13px]"> server/data/db.json</span> or delete that file to
        reset the whole instance.
      </p>
    </LegalPage>
  )
}
