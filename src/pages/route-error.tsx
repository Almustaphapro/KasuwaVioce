import { Link } from 'react-router-dom'
export function RouteErrorPage() {
  return (
    <main className="workspace">
      <section className="panel empty-state">
        <h1>Something interrupted this page.</h1>
        <p>
          Please return to the workspace and try again. Reloading clears any local preview edits.
        </p>
        <Link className="text-link" to="/">
          Return to workspace
        </Link>
        <button className="kv-button" onClick={() => window.location.reload()}>
          Reload the application
        </button>
      </section>
    </main>
  )
}
