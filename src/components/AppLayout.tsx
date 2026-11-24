import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './Avatar'
import { Icon } from './Icon'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  if (!user) return null

  const links = [
    { to: '/feed', label: 'The page', short: 'Page', icon: 'feed' },
    { to: '/people', label: 'People', short: 'People', icon: 'people' },
    { to: '/messages', label: 'Messages', short: 'Messages', icon: 'chat' },
    { to: '/requests', label: 'Requests', short: 'Requests', icon: 'inbox' },
    { to: `/profile/${user.id}`, label: 'Your profile', short: 'Profile', icon: 'user' },
  ]

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault()
    navigate(`/feed?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-ink/15 bg-desk">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link to="/feed" className="flex items-baseline gap-2">
            <span className="mt-1 inline-block h-2 w-2 rotate-45 bg-pen" aria-hidden="true" />
            <span className="font-serif text-[17px] font-medium tracking-tight text-ink">
              Pocket Mentor
            </span>
          </Link>

          <form onSubmit={submitSearch} className="ml-2 hidden max-w-xs flex-1 md:block">
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-inksoft">
                <Icon name="search" size={14} />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the page"
                className="input !py-1.5 !pl-8 text-[13px]"
                aria-label="Search posts and people"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/feed" className="btn-primary hidden !py-1.5 sm:inline-flex">
              <Icon name="plus" size={13} />
              New entry
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-[3px] border border-ink/20 bg-paper/70 py-0.5 pl-0.5 pr-2 transition-colors hover:bg-paper"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Avatar name={user.name} avatar={user.avatar} size="sm" />
                <span className="hidden text-[12px] font-medium text-ink sm:block">
                  {user.name.split(' ')[0]}
                </span>
              </button>
              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-[4px] border border-[var(--paper-edge)] bg-paper p-1 shadow-[0_18px_30px_-18px_rgba(27,42,68,0.5)]"
                >
                  <div className="border-b border-ink/10 px-3 py-2">
                    <p className="truncate font-serif text-[14px] text-ink">{user.name}</p>
                    <p className="truncate text-[11px] text-inksoft">{user.headline}</p>
                  </div>
                  <Link
                    to={`/profile/${user.id}`}
                    className="block px-3 py-1.5 text-[13px] text-ink hover:bg-ink/5"
                  >
                    Your profile
                  </Link>
                  <Link
                    to="/requests"
                    className="block px-3 py-1.5 text-[13px] text-ink hover:bg-ink/5"
                  >
                    Mentorship requests
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                    className="block w-full px-3 py-1.5 text-left text-[13px] text-pen hover:bg-pen/5"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-7">
        <aside className="hidden w-44 shrink-0 lg:block">
          <nav className="sticky top-24">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 py-1.5 text-[13px] transition-colors ${
                    isActive ? 'font-semibold text-ink' : 'text-inksoft hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 ${isActive ? 'bg-pen' : 'bg-transparent'}`}
                      aria-hidden="true"
                    />
                    <Icon name={link.icon} size={15} />
                    {link.label}
                  </>
                )}
              </NavLink>
            ))}

            <p className="pen-note mt-7 pl-0">
              {user.role === 'senior'
                ? 'Answer one question a week. That is enough to change someone’s semester.'
                : 'Ask something specific, send one good request, then follow up.'}
            </p>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-ink/15 px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1.5 text-[11px] text-inksoft sm:flex-row">
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

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--paper-edge)] bg-paper lg:hidden">
        <div className="flex items-stretch justify-around">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
                  isActive ? 'text-pen' : 'text-inksoft'
                }`
              }
            >
              <Icon name={link.icon} size={17} />
              {link.short}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
