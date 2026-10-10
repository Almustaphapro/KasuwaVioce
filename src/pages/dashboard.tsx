import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Mic,
  MessageCircle,
  Plus,
  Package,
  ReceiptText,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/hooks/store'
import { Button } from '@/components/ui/button'
import { PageHeading, PreviewGate, EmptyState } from '@/components/common/page'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { TransactionList } from '@/components/transactions/transaction-list'
import { TransactionDetails } from '@/components/transactions/transaction-details'
import { daysAgo, localDate, money } from '@/utils/format'
import type { Transaction } from '@/types/business'
export function DashboardPage() {
  const { enabled, profile, business, transactions, products } = useAppSelector(
    (state) => state.preview,
  )
  const [selected, setSelected] = useState<Transaction | null>(null)
  const today = transactions.filter((item) => item.date === localDate())
  const sales = today
    .filter((item) => item.type === 'sale')
    .reduce((sum, item) => sum + item.amount, 0)
  const expenses = today
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)
  const lowStock = products.filter((product) => product.stock <= product.lowStockAt)
  const chart = Array.from({ length: 7 }, (_, index) => {
    const date = daysAgo(6 - index)
    return {
      label: new Date(`${date}T12:00:00`).toLocaleDateString('en', { weekday: 'short' }),
      value: transactions
        .filter((item) => item.date === date && item.type === 'sale')
        .reduce((sum, item) => sum + item.amount, 0),
    }
  })
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow={enabled ? business.name || 'Your preview business' : 'A GOOD DAY TO GROW'}
        title={
          enabled
            ? `Sannu, ${profile.fullName.split(' ')[0] || 'friend'} ☀`
            : 'Your business, at a glance.'
        }
        description="A little clarity for your day. A little more time for your customers."
        actions={
          <Button asChild variant="outline">
            <Link to="/transactions?new=sale">
              <Plus size={18} />
              Add a record
            </Link>
          </Button>
        }
      />
      <PreviewGate />
      <section className="voice-hero">
        <div className="voice-hero-copy">
          <span className="hero-kicker">
            <span /> YOUR VOICE MEANS BUSINESS
          </span>
          <h2>
            Big on business.
            <br />
            Light on the paperwork.
          </h2>
          <p>
            Sold something? Paid for a delivery?
            <br className="desktop-only" /> Start with your voice. Review every detail.
          </p>
          <div className="hero-actions">
            <Button variant="gold" asChild>
              <Link to="/voice">
                <Mic size={19} />
                Record a sale
              </Link>
            </Button>
            <Button className="hero-secondary" variant="quiet" asChild>
              <Link to="/voice?intent=question">
                <MessageCircle size={19} />
                Ask KasuwaVoice
              </Link>
            </Button>
          </div>
          <span className="hero-footnote">Hausa first. Always a review before a record.</span>
        </div>
        <div className="voice-orbit" aria-hidden="true">
          <div className="orbit-ring ring-one" />
          <div className="orbit-ring ring-two" />
          <div className="orbit-mic">
            <Mic size={48} strokeWidth={1.5} />
          </div>
          <div className="sound-bars">
            {[18, 32, 49, 25, 40, 56, 31, 44, 20].map((height, index) => (
              <i key={index} style={{ height }} />
            ))}
          </div>
          <span className="orbit-caption">Speak it. We’ll help you review it.</span>
        </div>
      </section>
      <section className="stats-grid" aria-label="Today's overview">
        {[
          {
            label: "Today's sales",
            value: sales,
            icon: ArrowDownLeft,
            kind: 'green',
            currency: true,
            note: 'Sales recorded today',
          },
          {
            label: "Today's expenses",
            value: expenses,
            icon: ArrowUpRight,
            kind: 'amber',
            currency: true,
            note: 'Business costs recorded today',
          },
          {
            label: 'Transactions today',
            value: today.length,
            icon: ReceiptText,
            kind: 'blue',
            currency: false,
            note: 'Sales and expense entries',
          },
          {
            label: 'Available products',
            value: products.filter((item) => item.stock > 0).length,
            icon: Package,
            kind: 'purple',
            currency: false,
            note: 'Product lines with stock',
          },
        ].map(({ label, value, icon: Icon, kind, currency, note }) => (
          <section className="stat-card" key={label}>
            <div className="stat-top">
              <p>{label}</p>
              <span className={`stat-icon ${kind}`}>
                <Icon size={19} aria-hidden="true" />
              </span>
            </div>
            <strong>{enabled ? (currency ? money(value) : value) : '—'}</strong>
            <small>{enabled ? note : 'Waiting for connected services'}</small>
          </section>
        ))}
      </section>
      <div className="dashboard-middle">
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Sales this week</h2>
              <p className="muted">One day at a time. Every sale counts.</p>
            </div>
            <span className="badge neutral">Last 7 days</span>
          </div>
          {enabled ? (
            <>
              <p className="chart-total">
                {money(chart.reduce((sum, point) => sum + point.value, 0))}
                <span>Total sales · preview</span>
              </p>
              <SalesChart points={chart} />
            </>
          ) : (
            <EmptyState
              title="Your week will take shape here"
              description="Connect business services to see your sales, or explore the labelled preview."
            />
          )}
        </section>
        <section className="panel quick-actions">
          <div className="section-heading">
            <h2>A good next step</h2>
            <TrendingUp size={20} className="muted" />
          </div>
          <Link to="/transactions?new=sale">
            <span className="quick-icon green">
              <Plus size={21} />
            </span>
            <span>
              <strong>Add a sale</strong>
              <small>Keep today’s sales up to date</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link to="/transactions?new=expense">
            <span className="quick-icon amber">
              <ArrowUpRight size={21} />
            </span>
            <span>
              <strong>Record an expense</strong>
              <small>Know where your money goes</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <Link to="/inventory?new=product">
            <span className="quick-icon purple">
              <Package size={21} />
            </span>
            <span>
              <strong>Add a product</strong>
              <small>Make room for your next bestseller</small>
            </span>
            <ArrowRight size={17} />
          </Link>
          <div className="stock-note">
            <strong>
              {enabled
                ? `${lowStock.length} products need a stock check`
                : 'A well-stocked shop starts here'}
            </strong>
            <p>
              {enabled
                ? 'Review low and out-of-stock products before your next market trip.'
                : 'Stock reminders appear when business services are connected.'}
            </p>
            <Link to="/inventory?stock=low">
              Review inventory <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Recent transactions</h2>
            <p className="muted">The small details, all in one place.</p>
          </div>
          <Link className="text-link" to="/transactions">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {transactions.length ? (
          <TransactionList transactions={transactions.slice(0, 5)} onSelect={setSelected} />
        ) : (
          <EmptyState
            title="A fresh page for your business"
            description={
              enabled
                ? 'Add your first preview sale or expense to see it here.'
                : 'No real records are being displayed.'
            }
          />
        )}
      </section>
      {selected && <TransactionDetails transaction={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
