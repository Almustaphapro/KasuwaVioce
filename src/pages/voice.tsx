import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Mic,
  Square,
  RotateCcw,
  ShieldCheck,
  Check,
  Pencil,
  ArrowRight,
  AudioLines,
  AlertCircle,
  FlaskConical,
  RefreshCw,
} from 'lucide-react'
import { useRecorder } from '@/hooks/use-recorder'
import { useAppSelector } from '@/hooks/store'
import { TransactionForm } from '@/features/transactions/transaction-form'
import { PageHeading, PreviewGate } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/common/dialog'
import type { Transaction } from '@/types/business'
import { localDate, money } from '@/utils/format'
import {
  useConfirmVoiceTransactionMutation,
  useGetProductsQuery,
  useProcessVoiceMutation,
  type VoiceDraft,
} from '@/services/planned-api'

type Stage =
  | 'idle'
  | 'uploading'
  | 'transcribing'
  | 'understanding'
  | 'confirmation'
  | 'completed'
  | 'error'

const stageLabels: Record<Stage, string> = {
  idle: '',
  uploading: 'Uploading your recording…',
  transcribing: 'Transcribing with the selected ASR model…',
  understanding: 'Interpreting the business instruction…',
  confirmation: 'Review and confirm the draft before saving.',
  completed: 'Transaction confirmed.',
  error: 'The workflow stopped because a required step failed.',
}

function toCandidate(draft: VoiceDraft | null, productId?: string): Transaction | null {
  if (!draft) return null

  const intent = draft.extracted_intent
  const isSale = intent === 'record_sale'
  const quantity = Number(draft.extracted_fields.quantity ?? 1)
  const unitPrice = Number(draft.extracted_fields.unit_price ?? 0)
  const totalAmount = Number(draft.extracted_fields.total_amount_spoken ?? (unitPrice * quantity || 0))
  const amount = Number.isFinite(totalAmount) ? totalAmount : 0

  return {
    id: draft.draft_id,
    type: isSale ? 'sale' : 'expense',
    description: draft.transcript || 'Voice-confirmed transaction',
    amount: Number.isFinite(amount) ? amount : 0,
    quantity: Number.isFinite(quantity) ? quantity : 1,
    date: localDate(),
    source: 'voice',
    productId: draft.matched_product_id || productId,
  }
}

export function VoicePage() {
  const { enabled, products } = useAppSelector((state) => state.preview)
  const capture = useRecorder()
  const [params] = useSearchParams()
  const question = params.get('intent') === 'question'
  const [stage, setStage] = useState<Stage>('idle')
  const [draft, setDraft] = useState<VoiceDraft | null>(null)
  const [candidate, setCandidate] = useState<Transaction | null>(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [processVoice, { isLoading: isProcessingVoice }] = useProcessVoiceMutation()
  const [confirmVoiceTransaction, { isLoading: isConfirming }] = useConfirmVoiceTransactionMutation()
  const { data: productData } = useGetProductsQuery({ search: '' })
  const availableProducts = productData?.items ?? products
  const busy = isProcessingVoice || isConfirming || ['uploading', 'transcribing', 'understanding'].includes(stage)
  const recording = capture.state === 'recording'

  useEffect(() => {
    if (!draft) return
    setCandidate(toCandidate(draft, availableProducts[0]?.id))
  }, [draft, availableProducts])

  function cancel() {
    setStage('idle')
    setDraft(null)
    setCandidate(null)
    setError('')
    setEditing(false)
    capture.reset()
  }

  async function runTranscription() {
    if (!capture.audioUrl || busy || capture.state === 'requesting') return

    try {
      setStage('uploading')
      setError('')
      const response = await fetch(capture.audioUrl)
      const blob = await response.blob()
      const formData = new FormData()
      formData.append('audio', blob, 'voice-recording.webm')
      formData.append('language', 'ha')
      formData.append('context', JSON.stringify({ source: 'browser' }))

      setStage('transcribing')
      const result = await processVoice(formData).unwrap()

      if (!result?.draft_id) {
        throw new Error('The server did not create a draft for this recording.')
      }

      setDraft(result)
      setStage(result.confirmation_required ? 'confirmation' : 'completed')
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'The voice workflow could not complete. Check the recording and try again.'
      setError(message)
      setStage('error')
    }
  }

  async function handleConfirm() {
    if (!draft || !candidate) return
    const payload = {
      draft_id: draft.draft_id,
      transaction_type: candidate.type,
      description: candidate.description,
      product_id: candidate.productId,
      quantity: candidate.quantity,
      unit_price: candidate.amount / (candidate.quantity || 1),
      total_amount: candidate.amount,
    }
    try {
      setStage('understanding')
      const result = await confirmVoiceTransaction(payload).unwrap()
      const confirmed = result as Transaction & {
        total_amount?: number
        created_at?: string
        items?: Array<{ product_id?: string; quantity?: number }>
      }
      setCandidate({
        ...candidate,
        id: confirmed.id,
        amount: Number(confirmed.total_amount ?? confirmed.amount ?? candidate.amount),
        description: confirmed.description ?? candidate.description,
        date: confirmed.created_at ? new Date(confirmed.created_at).toISOString().slice(0, 10) : candidate.date,
        productId: confirmed.items?.[0]?.product_id ?? candidate.productId,
        quantity: confirmed.items?.[0]?.quantity ? Number(confirmed.items[0].quantity) : candidate.quantity,
      })
      setStage('completed')
      setDraft(null)
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'The draft could not be confirmed. Review and try again.'
      setError(message)
      setStage('error')
    }
  }

  const stateLabel =
    stage !== 'idle'
      ? stageLabels[stage]
      : capture.state === 'requesting'
        ? 'Allow microphone access in your browser.'
        : recording
          ? 'Go ahead. We’re listening locally.'
          : capture.state === 'recorded'
            ? 'Your recording is ready to upload.'
            : capture.state === 'error'
              ? 'Let’s try that again.'
              : 'A simple tap. A clearer record.'

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="YOUR VOICE. YOUR BUSINESS."
        title={question ? 'Ask KasuwaVoice' : 'Voice Assistant'}
        description="Record a purchase, expense, or question and review the draft before you save it."
      />
      <PreviewGate />
      {!enabled && (
        <p className="note">
          Real N-ATLaS inference is not available in this environment, so the workflow is clearly marked as
          not yet competition-compliant. The UI still supports the review flow and fail-safe actions.
        </p>
      )}
      {question && (
        <p className="note">
          Business Q&A is gated behind the same real-model access requirements. Draft handling is available,
          but the backend will not claim a real answer without verified inference.
        </p>
      )}
      <div className="voice-page-grid">
        <section className="panel recording-panel">
          <div className="section-heading">
            <span className="badge neutral">Hausa · voice workflow</span>
            <span className="local-audio">
              <ShieldCheck size={16} />
              Browser recording + backend review
            </span>
          </div>
          <div className="recorder-core">
            <div
              className={`mic-halo ${recording ? 'is-recording' : ''} ${busy ? 'is-processing' : ''}`}
            >
              <button
                className="record-button"
                aria-label={recording ? 'Stop recording' : 'Start recording'}
                disabled={busy || capture.state === 'requesting'}
                onClick={() => {
                  if (recording) capture.stop()
                  else {
                    setStage('idle')
                    setDraft(null)
                    setCandidate(null)
                    void capture.start()
                  }
                }}
              >
                {recording ? <Square size={32} fill="currentColor" /> : <Mic size={43} strokeWidth={1.6} />}
              </button>
            </div>
            <div className="recording-timer" aria-label={`Recording time ${capture.seconds} seconds`}>
              {String(Math.floor(capture.seconds / 60)).padStart(2, '0')}:
              {String(capture.seconds % 60).padStart(2, '0')}
            </div>
            <h2 role="status" aria-live="polite">
              {stateLabel}
            </h2>
            <p className="muted">
              {recording
                ? 'Tap the square to stop. A normal browser recording is uploaded for review.'
                : 'Tap the microphone to start. Your browser will ask for access.'}
            </p>
            {capture.state === 'error' && (
              <p className="error-message" role="alert">
                <AlertCircle size={20} />
                {capture.error}
              </p>
            )}
            {capture.audioUrl && (
              <div className="audio-preview">
                <label htmlFor="recorded-audio">Local recording</label>
                <audio id="recorded-audio" src={capture.audioUrl} controls aria-label="Play your local recording" />
              </div>
            )}
            {capture.audioUrl && !busy && (
              <div className="actions centered">
                <Button onClick={() => void runTranscription()}>
                  <AudioLines size={16} />
                  Process recording
                </Button>
                <Button variant="outline" onClick={cancel}>
                  <RotateCcw size={16} />
                  Retry
                </Button>
              </div>
            )}
          </div>
          <div className="recording-disclaimer">
            <ShieldCheck size={19} />
            <p>
              <strong>Important:</strong> if ASR is not configured, the API fails safely and does not create a
              financial record.
            </p>
          </div>
        </section>
        <div className="voice-side">
          <section className="panel">
            <h2 className="icon-heading">
              <AudioLines size={22} />
              Try saying…
            </h2>
            <p lang="ha" className="hausa-example">
              “Na sayar da buhun shinkafa biyu kan naira dubu tamanin da biyu da ɗari biyar kowanne.”
            </p>
            <p className="muted">“I sold two bags of rice for ₦82,500 each.”</p>
            <div className="speaking-tips">
              <p>
                <Check size={16} />
                Mention the product and quantity.
              </p>
              <p>
                <Check size={16} />
                Include the unit price or total amount.
              </p>
              <p>
                <Check size={16} />
                Review before saving any transaction.
              </p>
            </div>
          </section>
          <section className="panel sample-panel">
            <span className="badge preview">
              <FlaskConical size={14} />
              Workflow marker
            </span>
            <h2>Voice-to-transaction review</h2>
            <p>
              The review step is active even when genuine inference is unavailable. The backend will stop on a
              secure, explicit model failure instead of pretending it completed a real sale.
            </p>
            <Button variant="outline" className="full-width" onClick={cancel}>
              <RefreshCw size={16} />
              Reset workflow
            </Button>
          </section>
        </div>
      </div>
      {draft && candidate && (
        <section className="panel interpretation" aria-busy={busy}>
          <div className="section-heading">
            <h2>Review draft</h2>
            <span className="badge preview">{draft.draft_status}</span>
          </div>
          <div className="transcript-box">
            <span className="eyebrow">TRANSCRIPT</span>
            <p lang="ha">{draft.transcript}</p>
          </div>
          <dl className="extraction-grid">
            <div>
              <dt>Type</dt>
              <dd>{candidate.type === 'sale' ? 'Sale' : 'Expense'}</dd>
            </div>
            <div>
              <dt>Product</dt>
              <dd>{String((draft.extracted_fields as Record<string, unknown>).product_name ?? 'Not identified')}</dd>
            </div>
            <div>
              <dt>Quantity</dt>
              <dd>{candidate.quantity ?? 'Not linked'}</dd>
            </div>
            <div>
              <dt>Total amount</dt>
              <dd>{money(candidate.amount)}</dd>
            </div>
          </dl>
          {draft.warnings.length > 0 && (
            <ul className="field-hint">
              {draft.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
          {draft.clarification_questions.length > 0 && (
            <ul className="field-hint">
              {draft.clarification_questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          )}
          <div className="dialog-actions">
            <Button variant="quiet" onClick={cancel}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil size={16} />
              Correct details
            </Button>
            <Button onClick={() => void handleConfirm()} disabled={isConfirming || stage === 'completed'}>
              <Check size={18} />
              Confirm transaction
            </Button>
          </div>
        </section>
      )}
      {error && (
        <p className="error-message" role="alert">
          <AlertCircle size={20} />
          {error}
        </p>
      )}
      {editing && candidate && (
        <Dialog title="Correct transaction details" onClose={() => setEditing(false)}>
          <TransactionForm
            type={candidate.type}
            initial={candidate}
            submitLabel="Use corrected details"
            onCancel={() => setEditing(false)}
            onSave={(values) => {
              setCandidate({ ...values, id: candidate.id, source: 'voice' })
              setEditing(false)
            }}
          />
        </Dialog>
      )}
      {stage === 'completed' && candidate && (
        <div className="success-notice" role="status">
          <Check size={19} />
          The transaction draft was confirmed and saved.{' '}
          <Link className="text-link" to="/transactions">
            View transactions
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  )
}
