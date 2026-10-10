import type { ReactNode } from 'react'
import { Inbox, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { startPreview } from '@/features/preview/preview-slice'
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  )
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Inbox size={26} />
      </span>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {action}
    </div>
  )
}
export function PreviewGate() {
  const enabled = useAppSelector((state) => state.preview.enabled)
  const dispatch = useAppDispatch()
  if (enabled) return null
  return (
    <section className="service-notice" aria-label="Service availability">
      <ShieldCheck size={24} />
      <div>
        <h2>Your real records will appear here.</h2>
        <p>
          Business services are not connected yet. Explore sample records in an explicitly labelled
          preview. Preview changes last until you leave or reload.
        </p>
      </div>
      <Button variant="outline" onClick={() => dispatch(startPreview({ sampleData: true }))}>
        Explore UI preview
      </Button>
    </section>
  )
}
