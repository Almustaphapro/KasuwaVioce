import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Store, AudioLines } from 'lucide-react'
import { Brand } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/common/field'
import { LanguageField } from '@/components/common/language-field'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { saveBusiness, startPreview } from '@/features/preview/preview-slice'
const schema = z.object({
  name: z.string().trim().min(2, 'Enter your business name.').max(100),
  type: z.string().min(1, 'Choose a business type.'),
})
const steps = ['Welcome', 'Business name', 'Business type', 'Language', 'Ready']
export function OnboardingPage() {
  const { enabled, profile } = useAppSelector((state) => state.preview)
  const dispatch = useAppDispatch()
  const [step, setStep] = useState(0)
  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: '' },
  })
  async function next() {
    if (step === 1 && !(await trigger('name'))) return
    if (step === 2 && !(await trigger('type'))) return
    if (!enabled) dispatch(startPreview({ sampleData: false }))
    if (step === 3) dispatch(saveBusiness({ ...getValues(), language: 'ha' }))
    setStep((value) => value + 1)
  }
  return (
    <main className="onboarding-shell">
      <header>
        <Brand />
        <Link className="text-link" to="/">
          Back to workspace
        </Link>
      </header>
      <div className="onboarding-wrap">
        <span className="badge preview">UI preview · no account is created</span>
        <ol className="setup-steps" aria-label="Setup progress">
          {steps.map((title, index) => (
            <li
              key={title}
              aria-current={step === index ? 'step' : undefined}
              className={index <= step ? 'reached' : ''}
            >
              <span>{index < step ? <Check size={15} /> : index + 1}</span>
              <small>{title}</small>
            </li>
          ))}
        </ol>
        <section className="panel setup-card">
          <div className="setup-icon">
            {step === 4 ? (
              <Check size={32} />
            ) : step === 3 ? (
              <AudioLines size={32} />
            ) : (
              <Store size={32} />
            )}
          </div>
          <h1>
            {
              [
                'Welcome to KasuwaVoice.',
                'What’s your business called?',
                'What kind of business is it?',
                'Your business. Your language.',
                'You’re ready to explore.',
              ][step]
            }
          </h1>
          <p className="muted">
            {
              [
                'Let’s make this space feel like your shop. Setup takes just a few small steps.',
                'Use the name your customers know and love.',
                'This helps us understand your everyday work.',
                'Hausa comes first in the competition MVP.',
                'Your business details are set for this preview session. No real account has been created.',
              ][step]
            }
          </p>
          <form
            className="form-stack"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              void next()
            }}
          >
            {step === 0 && (
              <div className="setup-welcome">
                <strong>
                  Sannu{profile.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}!
                </strong>
                <p>Less paperwork. Clearer records. More time for your customers.</p>
              </div>
            )}
            {step === 1 && (
              <Field label="Business name" error={errors.name?.message}>
                {(props) => (
                  <input
                    {...props}
                    {...register('name')}
                    placeholder="For example, Amina General Store"
                    maxLength={100}
                  />
                )}
              </Field>
            )}
            {step === 2 && (
              <Field label="Business type" error={errors.type?.message}>
                {(props) => (
                  <select {...props} {...register('type')}>
                    <option value="">Choose your business type</option>
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
            )}
            {step === 3 && <LanguageField />}
            {step === 4 ? (
              <Button asChild className="full-width">
                <Link to="/">
                  Go to your dashboard
                  <ArrowRight size={18} />
                </Link>
              </Button>
            ) : (
              <div className="dialog-actions">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((value) => value - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button type="submit">
                  {step === 0
                    ? 'Let’s get started'
                    : step === 3
                      ? 'Complete preview setup'
                      : 'Continue'}
                  <ArrowRight size={18} />
                </Button>
              </div>
            )}
          </form>
        </section>
        <p className="setup-foot">Speak It. Record It. Grow Your Business.</p>
      </div>
    </main>
  )
}
