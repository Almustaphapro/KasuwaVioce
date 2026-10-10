import { money } from '@/utils/format'
export interface ChartPoint {
  label: string
  value: number
}
export function SalesChart({
  points,
  title = 'Daily sales',
}: {
  points: ChartPoint[]
  title?: string
}) {
  const maximum = Math.max(1, ...points.map((point) => point.value))
  return (
    <div className="sales-chart">
      <div className="chart-scale" aria-hidden="true">
        <span>{money(maximum)}</span>
        <span>{money(maximum / 2)}</span>
        <span>₦0</span>
      </div>
      <div
        className="chart-bars"
        role="img"
        aria-label={`${title}. ${points.map((point) => `${point.label}: ${money(point.value)}`).join('; ')}`}
      >
        {points.map((point, index) => (
          <div className="chart-column" key={`${point.label}-${index}`}>
            <div className="bar-track">
              <div
                className={`chart-bar ${index === points.length - 1 ? 'latest' : ''}`}
                style={{
                  height: `${Math.max(point.value > 0 ? 3 : 0, (point.value / maximum) * 100)}%`,
                }}
              />
            </div>
            <span>{point.label}</span>
          </div>
        ))}
      </div>
      <details className="chart-data">
        <summary>View chart values</summary>
        <ul>
          {points.map((point, index) => (
            <li key={index}>
              {point.label}
              <strong>{money(point.value)}</strong>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
