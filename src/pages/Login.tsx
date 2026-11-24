import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { ErrorNote } from '../components/Feedback'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/feed'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in.')
    } finally {
      setLoading(false)
    }
  }

  const useDemo = async () => {
    setEmail('meera@pocket.dev')
    setPassword('demo1234')
    setError('')
    setLoading(true)
    try {
      await login('meera@pocket.dev', 'demo1234')
      navigate('/feed', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign you in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your pocket of mentors."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="link font-medium">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
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
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input"
            placeholder="••••••••"
            required
          />
        </div>

        <ErrorNote message={error} />

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <button type="button" onClick={useDemo} disabled={loading} className="btn-ghost w-full">
          Sign in as the demo mentor
        </button>
      </form>

      <div className="mt-6 border-t border-ink/15 pt-3 text-[11.5px] leading-relaxed text-inksoft">
        <p className="text-ink">Demo accounts, all with the password demo1234</p>
        <p className="mt-1">meera@pocket.dev, a mentor in tech</p>
        <p>arjun@pocket.dev, a mentor in finance</p>
        <p>kabir@pocket.dev, a junior in tech</p>
      </div>
    </AuthShell>
  )
}
