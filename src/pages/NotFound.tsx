import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-serif text-6xl italic text-pen">404</p>
      <h1 className="text-xl font-semibold text-ink">This page is not in the pocket</h1>
      <p className="max-w-sm text-sm text-inksoft">
        The link may be old, or the post may have been deleted by its author.
      </p>
      <div className="flex gap-2">
        <Link to="/feed" className="btn-primary">
          Go to the feed
        </Link>
        <Link to="/" className="btn-ghost">
          Home
        </Link>
      </div>
      <p className="mt-6 text-[10px] text-inksoft/70">build {__BUILD_STAMP__}</p>
    </div>
  )
}
