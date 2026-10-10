import { Link } from 'react-router-dom'
export function NotFoundPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Page not found</h1>
      <Link className="underline" to="/">
        Return home
      </Link>
    </div>
  )
}
