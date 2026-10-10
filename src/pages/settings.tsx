import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { UserRound, Store, Bell, LockKeyhole, LogOut } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import {
  saveProfile,
  saveBusiness,
  saveNotifications,
  exitPreview,
} from '@/features/preview/preview-slice'
import { PageHeading, PreviewGate } from '@/components/common/page'
import { Field } from '@/components/common/field'
import { LanguageField } from '@/components/common/language-field'
import { Dialog } from '@/components/common/dialog'
import { Button } from '@/components/ui/button'
const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.').max(100),
  email: z.email('Enter a valid email address.'),
})
const businessSchema = z.object({
  name: z.string().trim().min(2, 'Enter a business name.').max(100),
  type: z.string().min(1, 'Choose a business type.'),
})
function SettingsForms() {
  const preview = useAppSelector((state) => state.preview)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [notice, setNotice] = useState('')
  const [leaving, setLeaving] = useState(false)
  const profile = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: preview.profile,
  })
  const business = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: preview.business,
  })
  return (
    <>
      {notice && (
        <p className="success-notice" role="status">
          {notice}
        </p>
      )}
      <div className="settings-grid">
        <section className="panel">
          <h2 className="icon-heading">
            <UserRound size={21} />
            Personal profile
          </h2>
          <p className="muted">The person behind the business.</p>
          <form
            className="form-stack"
            noValidate
            onSubmit={profile.handleSubmit((values) => {
              dispatch(saveProfile(values))
              setNotice('Profile updated in this preview only.')
            })}
          >
            <fieldset disabled={!preview.enabled}>
              <Field label="Full name" error={profile.formState.errors.fullName?.message}>
                {(props) => (
                  <input {...props} {...profile.register('fullName')} autoComplete="name" />
                )}
              </Field>
              <Field label="Email address" error={profile.formState.errors.email?.message}>
                {(props) => (
                  <input
                    {...props}
                    {...profile.register('email')}
                    type="email"
                    autoComplete="email"
                  />
                )}
              </Field>
              <Button type="submit">Save preview profile</Button>
            </fieldset>
          </form>
        </section>
        <section className="panel">
          <h2 className="icon-heading">
            <Store size={21} />
            Business information
          </h2>
          <p className="muted">Make your workspace your own.</p>
          <form
            className="form-stack"
            noValidate
            onSubmit={business.handleSubmit((values) => {
              dispatch(saveBusiness({ ...values, language: 'ha' }))
              setNotice('Business information updated in this preview only.')
            })}
          >
            <fieldset disabled={!preview.enabled}>
              <Field label="Business name" error={business.formState.errors.name?.message}>
                {(props) => <input {...props} {...business.register('name')} />}
              </Field>
              <Field label="Business type" error={business.formState.errors.type?.message}>
                {(props) => (
                  <select {...props} {...business.register('type')}>
                    <option value="">Choose a type</option>
                    {[
                      'General retail',
                      'Food & groceries',
                      'Fashion & textiles',
                      'Farm produce',
                      'Food service',
                      'Other',
                    ].map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                )}
              </Field>
              <LanguageField />
              <Button type="submit">Save preview business</Button>
            </fieldset>
          </form>
        </section>
        <section className="panel">
          <h2 className="icon-heading">
            <Bell size={21} />
            Notification preferences
          </h2>
          <p className="muted">Preview your preferences. No notifications are sent.</p>
          <div className="preference-list">
            {[
              {
                key: 'lowStock' as const,
                title: 'Low-stock reminders',
                text: 'A heads-up when products need restocking.',
              },
              {
                key: 'dailySummary' as const,
                title: 'Daily business summary',
                text: 'A little clarity at the end of the day.',
              },
            ].map((item) => (
              <label key={item.key}>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={preview.notifications[item.key]}
                  disabled={!preview.enabled}
                  onChange={(event) => {
                    dispatch(
                      saveNotifications({
                        ...preview.notifications,
                        [item.key]: event.target.checked,
                      }),
                    )
                    setNotice(
                      'Notification preference changed locally. No notifications will be sent.',
                    )
                  }}
                />
              </label>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2 className="icon-heading">
            <LockKeyhole size={21} />
            Password & security
          </h2>
          <p className="muted">
            Password changes are unavailable until authentication is connected.
          </p>
          <fieldset disabled className="form-stack">
            <Field label="Current password">
              {(props) => <input {...props} type="password" autoComplete="current-password" />}
            </Field>
            <Field label="New password">
              {(props) => <input {...props} type="password" autoComplete="new-password" />}
            </Field>
            <Button disabled>Change password · unavailable</Button>
          </fieldset>
        </section>
      </div>
      <section className="panel exit-panel">
        <div>
          <h2>{preview.enabled ? 'Finished exploring?' : 'Account services are not connected'}</h2>
          <p className="muted">
            {preview.enabled
              ? 'Leaving clears all preview records and edits from this session.'
              : 'Sign-out is unavailable because no authenticated session exists.'}
          </p>
        </div>
        <Button disabled={!preview.enabled} variant="outline" onClick={() => setLeaving(true)}>
          <LogOut size={18} />
          {preview.enabled ? 'Exit preview' : 'Sign out · unavailable'}
        </Button>
      </section>
      {leaving && (
        <Dialog title="Clear this preview and leave?" onClose={() => setLeaving(false)}>
          <p className="muted">
            Your preview edits will be discarded. No real account will be affected.
          </p>
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setLeaving(false)}>
              Stay here
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                dispatch(exitPreview())
                navigate('/login')
              }}
            >
              Leave and clear preview
            </Button>
          </div>
        </Dialog>
      )}
    </>
  )
}
export function SettingsPage() {
  const enabled = useAppSelector((state) => state.preview.enabled)
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title="Settings"
        description="Your profile, your business, and your preferences."
      />
      <PreviewGate />
      <SettingsForms key={String(enabled)} />
    </div>
  )
}
