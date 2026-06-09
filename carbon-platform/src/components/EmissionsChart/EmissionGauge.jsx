import PropTypes from 'prop-types'

export default function EmissionGauge({ total }) {
  const max    = 10
  const capped = Math.min(total, max)
  const pct    = (capped / max) * 100
  const color  = total <= 2 ? '#16a34a' : total <= 4.7 ? '#ca8a04' : '#dc2626'
  const label  = total <= 2 ? 'Low Impact 🌟' : total <= 4.7 ? 'Average 📊' : 'High Impact ⚠️'

  return (
    <div
      role="img"
      aria-label={`Your total carbon footprint is ${total} tonnes CO2 equivalent per year — ${label}`}
      className="space-y-2"
    >
      <div className="flex justify-between items-end">
        <div>
          <div className="text-3xl font-bold tabular-nums" style={{ color }} aria-hidden="true">{total}</div>
          <div className="text-xs text-eco-500 font-medium">tonnes CO2e / year</div>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: color + '20', color }}
          aria-hidden="true"
        >
          {label}
        </span>
      </div>
      <div className="h-3 rounded-full bg-eco-100 overflow-hidden" aria-hidden="true">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="flex justify-between text-xs text-eco-400" aria-hidden="true">
        <span>0t</span>
        <span>🎯 Paris: 2t</span>
        <span>🌍 Global avg: 4.7t</span>
        <span>10t+</span>
      </div>
    </div>
  )
}

EmissionGauge.propTypes = {
  total: PropTypes.number.isRequired,
}
