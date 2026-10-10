export function PageLoading() {
  return (
    <main className="workspace" aria-busy="true">
      <section className="panel empty-state">
        <h1>KasuwaVoice</h1>
        <p role="status">Getting your workspace ready…</p>
      </section>
    </main>
  )
}
