import { useState } from 'react'
import { PageHeading, PreviewGate, EmptyState } from '@/components/common/page'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { useAppSelector } from '@/hooks/store'
import { daysAgo, localDate, money } from '@/utils/format'
export function ReportsPage() {
  const { enabled, transactions, products } = useAppSelector((state) => state.preview)
  const [from, setFrom] = useState(daysAgo(6))
  const [to, setTo] = useState(localDate())
  const invalid = !from || !to || from > to || to > localDate()
  const filtered = invalid
    ? []
    : transactions.filter((item) => item.date >= from && item.date <= to)
  const sales = filtered.filter((item) => item.type === 'sale')
  const totalSales = sales.reduce((sum, item) => sum + item.amount, 0)
  const expenses = filtered
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)
  const grouped = new Map<string, number>()
  sales.forEach((item) => grouped.set(item.date, (grouped.get(item.date) ?? 0) + item.amount))
  const chart = [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, value]) => ({
      label: new Date(`${date}T12:00:00`).toLocaleDateString('en', {
        day: 'numeric',
        month: 'short',
      }),
      value,
    }))
  const performance = products
    .map((product) => ({
      ...product,
      sales: sales
        .filter((item) => item.productId === product.id)
        .reduce((sum, item) => sum + item.amount, 0),
      quantity: sales
        .filter((item) => item.productId === product.id)
        .reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    }))
    .filter((product) => product.sales > 0)
    .sort((a, b) => b.sales - a.sales)
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="SEE THE BIGGER PICTURE"
        title="Reports"
        description="Understand your sales and expenses, one clear summary at a time."
      />
      <PreviewGate />
      <section className="panel date-range">
        <div>
          <h2>Choose your date range</h2>
          <p className="muted">All summaries below use this range.</p>
        </div>
        <label>
          From
          <input
            type="date"
            value={from}
            max={to || localDate()}
            onChange={(event) => setFrom(event.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? 'date-error' : undefined}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            max={localDate()}
            onChange={(event) => setTo(event.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? 'date-error' : undefined}
          />
        </label>
        {invalid && (
          <p id="date-error" role="alert" className="field-error">
            Choose a valid range ending today or earlier, with the start before the end.
          </p>
        )}
      </section>
      <div className="report-stats">
        {[
          { title: 'Sales', value: money(totalSales) },
          { title: 'Expenses', value: money(expenses) },
          { title: 'Transactions', value: filtered.length },
          { title: 'Average sale', value: money(sales.length ? totalSales / sales.length : 0) },
        ].map((item) => (
          <section className="stat-card" key={item.title}>
            <p>{item.title}</p>
            <strong>{enabled && !invalid ? item.value : '—'}</strong>
            <small>{enabled ? 'Selected range · preview' : 'Services not connected'}</small>
          </section>
        ))}
      </div>
      <p className="note">
        Sales and expenses are separate totals. They are not a profit calculation; product cost data
        is not available.
      </p>
      <div className="reports-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Daily sales</h2>
            <span className="badge neutral">NGN</span>
          </div>
          <p className="muted">Latest 14 days with sales in the selected range.</p>
          {chart.length ? (
            <SalesChart points={chart} />
          ) : (
            <EmptyState
              title="No sales in this range"
              description="Choose another date range or add a preview sale."
            />
          )}
        </section>
        <section className="panel">
          <h2>Sales & expenses</h2>
          <p className="muted">A simple comparison, not profit.</p>
          {enabled && filtered.length ? (
            <div className="comparison-bars">
              {[
                { label: 'Sales', value: totalSales, className: 'sale' },
                { label: 'Expenses', value: expenses, className: 'expense' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="section-heading">
                    <span>{item.label}</span>
                    <strong>{money(item.value)}</strong>
                  </div>
                  <div className="comparison-track">
                    <div
                      className={item.className}
                      style={{
                        width: `${(item.value / Math.max(1, totalSales, expenses)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing to compare yet"
              description="Your totals will appear here when records are available."
            />
          )}
        </section>
      </div>
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Product performance</h2>
            <p className="muted">Sales linked to products. Unlinked entries are excluded.</p>
          </div>
        </div>
        {performance.length ? (
          <ul className="performance-list">
            {performance.map((product, index) => (
              <li key={product.id}>
                <span className="rank">{index + 1}</span>
                <div>
                  <strong>{product.name}</strong>
                  <small>
                    {product.quantity} {product.unit}
                    {product.quantity !== 1 && product.unit !== 'kg' ? 's' : ''} sold
                  </small>
                </div>
                <strong>{money(product.sales)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Your bestsellers will appear here"
            description="Link a product when adding a sale to include it in this summary."
          />
        )}
      </section>
    </div>
  )
}
