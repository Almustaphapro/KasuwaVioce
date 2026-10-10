import type { Transaction } from '@/types/business'
import { Dialog } from '@/components/common/dialog'
import { money, displayDate } from '@/utils/format'
export function TransactionDetails({
  transaction,
  onClose,
}: {
  transaction: Transaction
  onClose: () => void
}) {
  return (
    <Dialog title="Transaction details" onClose={onClose}>
      <span className="badge preview">Preview record</span>
      <h3 className="detail-total">{money(transaction.amount)}</h3>
      <p>{transaction.description}</p>
      <dl className="detail-list">
        <div>
          <dt>Reference</dt>
          <dd>{transaction.id}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{transaction.type}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{displayDate(transaction.date)}</dd>
        </div>
        {transaction.quantity && (
          <div>
            <dt>Quantity</dt>
            <dd>{transaction.quantity}</dd>
          </div>
        )}
        <div>
          <dt>Source</dt>
          <dd>
            {transaction.source === 'voice'
              ? 'Simulated voice interpretation'
              : transaction.source === 'fixture'
                ? 'Development sample'
                : 'Manual preview entry'}
          </dd>
        </div>
      </dl>
      <p className="note">
        This record exists only in the current UI preview. Stock is not automatically adjusted.
      </p>
    </Dialog>
  )
}
