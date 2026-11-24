import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { ErrorNote } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'
import { DOMAINS, DOMAIN_META, type Domain, type Role } from '../types'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState<Role>('junior')
  const [domain, setDomain] = useState<Domain>('tech')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [years, setYears] = useState('')
  const [headline, setHeadline] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        domain,
        years: Number(years) || 0,
        headline: headline.trim(),
      })
      navigate('/feed', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Tell us where you are, so the right people find you."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="link font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <span className="label">I am joining as</span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'junior', title: 'Junior', hint: 'I want a mentor' },
                { id: 'senior', title: 'Senior', hint: 'I want to mentor' },
              ] as { id: Role; title: string; hint: string }[]
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRole(option.id)}
                className={`rounded-[3px] border px-3 py-2.5 text-left transition ${
                  role === option.id
                    ? 'border-pen/50 bg-pen/[0.04]'
                    : 'border-ink/15 bg-paper hover:border-ink/30'
                }`}
              >
                <span
                  className={`block font-serif text-[15px] ${
                    role === option.id ? 'text-pen' : 'text-ink'
                  }`}
                >
                  {option.title}
                </span>
                <span className="block text-[11px] text-inksoft">{option.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input"
            placeholder="Ananya Iyer"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input"
            placeholder="you@college.edu"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password (8+ characters)
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input"
            placeholder="••••••••"
            minLength={8}
            required
          />
        </div>

        <div>
          <span className="label">Domain</span>
          <div className="flex flex-wrap gap-1.5">
            {DOMAINS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDomain(option)}
                className={`stamp cursor-pointer transition ${
                  domain === option
                    ? DOMAIN_META[option].ink
                    : 'text-inksoft opacity-55 hover:opacity-90'
                }`}
              >
                {DOMAIN_META[option].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[90px_1fr] gap-2">
          <div>
            <label className="label" htmlFor="years">
              Years
            </label>
            <input
              id="years"
              type="number"
              min={0}
              max={40}
              value={years}
              onChange={(event) => setYears(event.target.value)}
              className="input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="label" htmlFor="headline">
              Headline
            </label>
            <input
              id="headline"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              className="input"
              placeholder={role === 'senior' ? 'CA, ex-EY, now in FP&A' : 'Third year CSE, NIT Trichy'}
            />
          </div>
        </div>

        <ErrorNote message={error} />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  )
}
