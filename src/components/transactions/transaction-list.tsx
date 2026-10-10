import { ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react'
import type { Transaction } from '@/types/business'
import { displayDate, money } from '@/utils/format'
export function TransactionList({
  transactions,
  onSelect,
}: {
  transactions: Transaction[]
  onSelect: (transaction: Transaction) => void
}) {
  return (
    <ul className="transaction-list">
      {transactions.map((item) => (
        <li key={item.id}>
          <button
            className="transaction-row"
            onClick={() => onSelect(item)}
            aria-label={`View ${item.description}, ${money(item.amount)}`}
          >
            <span className={`transaction-icon ${item.type}`} aria-hidden="true">
              {item.type === 'sale' ? <ArrowDownLeft size={21} /> : <ArrowUpRight size={21} />}
            </span>
            <span className="transaction-description">
              <strong>{item.description}</strong>
              <small>
                {displayDate(item.date)} · {item.id}
              </small>
            </span>
            <span className={`badge ${item.type}`}>
              {item.type === 'sale' ? 'Sale' : 'Expense'}
            </span>
            <strong className={`transaction-amount ${item.type}`}>
              {item.type === 'expense' ? '−' : '+'}
              {money(item.amount)}
            </strong>
            <ChevronRight className="row-chevron" size={17} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )
}
