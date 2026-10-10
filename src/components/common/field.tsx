import { useId, type ReactNode } from 'react'
export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: (props: {
    id: string
    'aria-describedby'?: string
    'aria-invalid': boolean
  }) => ReactNode
}) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        'aria-describedby': error || hint ? `${id}-note` : undefined,
        'aria-invalid': !!error,
      })}
      {(error || hint) && (
        <p
          id={`${id}-note`}
          className={error ? 'field-error' : 'field-hint'}
          role={error ? 'alert' : undefined}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}
