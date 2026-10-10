import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, AudioLines, Check, ShieldCheck } from 'lucide-react'
import { Brand } from '@/components/layout/app-layout'
import { Field } from '@/components/common/field'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/hooks/store'
import { startPreview } from '@/features/preview/preview-slice'
export function LoginPage() {
  return <AuthPage mode="login" />
}
export function RegistrationPage() {
  return <AuthPage mode="register" />
}
export function ForgotPasswordPage() {
  return <AuthPage mode="forgot" />
}
export function AuthPage({ mode }: { mode: 'login' | 'register' | 'forgot' }) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [notice, setNotice] = useState('')
  const schema = z
    .object({
      fullName: z.string(),
      email: z.email('Enter a valid email address.').max(254),
      password: z.string().max(128),
      confirmPassword: z.string(),
    })
    .superRefine((values, context) => {
      if (mode === 'register' && values.fullName.trim().length < 2)
        context.addIssue({ code: 'custom', path: ['fullName'], message: 'Enter your full name.' })
      if (mode !== 'forgot' && values.password.length < (mode === 'register' ? 8 : 1))
        context.addIssue({
          code: 'custom',
          path: ['password'],
          message: mode === 'register' ? 'Use at least 8 characters.' : 'Enter your password.',
        })
      if (mode === 'register' && values.password !== values.confirmPassword)
        context.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'Passwords do not match.',
        })
    })
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })
  const heading =
    mode === 'register'
      ? 'Your next chapter starts here.'
      : mode === 'forgot'
        ? 'Let’s help you get back in.'
        : 'Welcome back.'
  return (
    <div className="auth-shell">
      <aside className="auth-story">
        <Brand light />
        <div className="auth-story-body">
          <span className="hero-kicker">BUILT FOR THE WAY YOU TRADE</span>
          <h2>
            Your hands are busy.
            <br />
            Let your voice
            <br />
            <em>do the recording.</em>
          </h2>
          <p>
            From the first customer to the last sale.
            <br />
            Keep your business close, and your records closer.
          </p>
          <div className="market-illustration" aria-hidden="true">
            <div className="market-roof" />
            <div className="market-awning" />
            <div className="market-body">
              <div className="market-window">
                <AudioLines size={58} />
              </div>
              <div className="market-crates">
                <i />
                <i />
                <i />
              </div>
            </div>
            <span>YOUR EVERYDAY BUSINESS COMPANION</span>
          </div>
          <p className="auth-tagline">Speak It. Record It. Grow Your Business.</p>
        </div>
        <span className="auth-footer">
          <ShieldCheck size={17} />
          You review every record. You stay in control.
        </span>
      </aside>
      <main className="auth-main">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <Link className="back-link" to="/">
          ← Back to workspace
        </Link>
        <div className="auth-form-wrap">
          <p className="eyebrow">KASUWAVOICE</p>
          <h1>{heading}</h1>
          <p className="muted">
            {mode === 'register'
              ? 'A simpler way to keep your business moving.'
              : mode === 'forgot'
                ? 'Password recovery will be available when account services are connected.'
                : 'A clear view of your business is waiting.'}
          </p>
          <div className="note auth-note">
            <strong>Interface preview.</strong> Account services are not connected. Credentials are
            never sent or saved by this interface.
          </div>
          <form
            className="form-stack"
            noValidate
            onSubmit={handleSubmit((values) => {
              if (mode === 'register') {
                dispatch(
                  startPreview({
                    sampleData: false,
                    profile: { fullName: values.fullName.trim(), email: values.email },
                  }),
                )
                navigate('/onboarding')
              } else {
                setNotice(
                  mode === 'forgot'
                    ? 'Email format is valid. No reset email was sent: password recovery is not connected.'
                    : 'The form is valid, but sign-in is unavailable until authentication services are connected. No credentials were sent.',
                )
                resetField('password')
                resetField('confirmPassword')
              }
            })}
          >
            {mode === 'register' && (
              <Field label="Full name" error={errors.fullName?.message}>
                {(props) => (
                  <input
                    {...props}
                    {...register('fullName')}
                    autoComplete="name"
                    placeholder="Your full name"
                    maxLength={100}
                  />
                )}
              </Field>
            )}
            <Field label="Email address" error={errors.email?.message}>
              {(props) => (
                <input
                  {...props}
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              )}
            </Field>
            {mode !== 'forgot' && (
              <Field
                label="Password"
                error={errors.password?.message}
                hint={
                  mode === 'register'
                    ? 'At least 8 characters. Use a sample password for this preview.'
                    : undefined
                }
              >
                {(props) => (
                  <input
                    {...props}
                    {...register('password')}
                    type="password"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    placeholder="Enter your password"
                    maxLength={128}
                  />
                )}
              </Field>
            )}
            {mode === 'register' && (
              <Field label="Confirm password" error={errors.confirmPassword?.message}>
                {(props) => (
                  <input
                    {...props}
                    {...register('confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                  />
                )}
              </Field>
            )}
            {mode === 'login' && (
              <Link className="text-link auth-forgot" to="/forgot-password">
                Forgot password?
              </Link>
            )}
            {notice && (
              <p className="note" role="status">
                {notice}
              </p>
            )}
            <Button type="submit" className="full-width">
              {mode === 'register'
                ? 'Preview business setup'
                : mode === 'forgot'
                  ? 'Check email format'
                  : 'Sign in'}
              <ArrowRight size={18} />
            </Button>
            {mode === 'forgot' && (
              <Button type="button" disabled variant="outline">
                Send reset email · unavailable
              </Button>
            )}
          </form>
          <p className="auth-switch">
            {mode === 'register' ? (
              <>
                Already have an account? <Link to="/login">Sign in</Link>
              </>
            ) : mode === 'forgot' ? (
              <Link to="/login">Return to sign in</Link>
            ) : (
              <>
                New to KasuwaVoice? <Link to="/register">Get started</Link>
              </>
            )}
          </p>
          <div className="auth-divider">
            <span>or take a look around</span>
          </div>
          <Button
            variant="outline"
            className="full-width"
            onClick={() => {
              dispatch(startPreview({ sampleData: true }))
              navigate('/')
            }}
          >
            Explore with sample records
          </Button>
          <p className="auth-assurance">
            <Check size={15} />
            No real account or financial records are created.
          </p>
        </div>
      </main>
    </div>
  )
}
