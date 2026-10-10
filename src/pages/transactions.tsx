import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, AlertCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/hooks/store'
import { addTransaction } from '@/features/preview/preview-slice'
import { PageHeading, EmptyState, PreviewGate } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/common/dialog'
import { TransactionList } from '@/components/transactions/transaction-list'
import { TransactionDetails } from '@/components/transactions/transaction-details'
import { TransactionForm } from '@/features/transactions/transaction-form'
import type { Transaction, TransactionKind } from '@/types/business'
import { daysAgo, localDate, money } from '@/utils/format'
export function TransactionsPage() {
  const { enabled, transactions } = useAppSelector((state) => state.preview)
  const dispatch = useAppDispatch()
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState('all')
  const [period, setPeriod] = useState('all')
  const [notice, setNotice] = useState('')
  const [failure, setFailure] = useState(false)
  const create = params.get('new')
  const formType: TransactionKind | null = create === 'sale' || create === 'expense' ? create : null
  const filtered = transactions
    .filter(
      (item) =>
        (kind === 'all' || item.type === kind) &&
        item.description.toLowerCase().includes(search.toLowerCase()) &&
        (period === 'all' || item.date >= (period === 'today' ? localDate() : daysAgo(6))),
    )
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
  const total = filtered
    .filter((item) => item.type === 'sale')
    .reduce((sum, item) => sum + item.amount, 0)
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="EVERY RECORD COUNTS"
        title="Transactions"
        description="Keep the day’s sales and expenses in one clear place."
        actions={
          <>
            <Button
              variant="outline"
              disabled={!enabled}
              onClick={() => setParams({ new: 'expense' })}
            >
              Add expense
            </Button>
            <Button disabled={!enabled} onClick={() => setParams({ new: 'sale' })}>
              <Plus size={18} />
              Add sale
            </Button>
          </>
        }
      />
      <PreviewGate />
      {notice && (
        <p className="success-notice" role="status">
          {notice}
        </p>
      )}
      <section className="panel">
        <div className="filter-bar">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search transactions</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your records…"
            />
          </label>
          <label>
            <span className="sr-only">Transaction type</span>
            <select value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="all">All transactions</option>
              <option value="sale">Sales</option>
              <option value="expense">Expenses</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Date filter</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="all">All dates</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
            </select>
          </label>
        </div>
        <div className="list-summary">
          <span>
            {filtered.length} records{enabled && ' · preview'}
          </span>
          <span>
            Filtered sales <strong>{enabled ? money(total) : '—'}</strong>
          </span>
        </div>
        {failure ? (
          <div className="error-state" role="alert">
            <AlertCircle />
            <h3>Sample loading error</h3>
            <p>This is a UI error demonstration. Your preview records are still available.</p>
            <Button variant="outline" onClick={() => setFailure(false)}>
              Retry loading records
            </Button>
          </div>
        ) : filtered.length ? (
          <TransactionList transactions={filtered} onSelect={setSelected} />
        ) : (
          <EmptyState
            title={
              search || kind !== 'all' || period !== 'all'
                ? 'No matching records'
                : 'Your first record starts here'
            }
            description={
              enabled
                ? 'Try another filter, or add a sale or expense.'
                : 'Business services are unavailable. No sample records are shown unless you choose preview.'
            }
          />
        )}
      </section>
      {enabled && (
        <details className="preview-tools">
          <summary>Preview tools</summary>
          <Button variant="outline" onClick={() => setFailure(true)}>
            Demonstrate a loading error
          </Button>
        </details>
      )}
      {enabled && formType && (
        <Dialog
          title={formType === 'sale' ? 'Add a sale' : 'Add an expense'}
          onClose={() => setParams({})}
        >
          <TransactionForm
            type={formType}
            onCancel={() => setParams({})}
            onSave={(values) => {
              dispatch(
                addTransaction({
                  ...values,
                  id: `KV-${crypto.randomUUID().slice(0, 8)}`,
                  source: 'manual',
                }),
              )
              setParams({})
              setNotice('Record added to this preview. It has not been saved to an account.')
            }}
          />
        </Dialog>
      )}
      {selected && <TransactionDetails transaction={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
