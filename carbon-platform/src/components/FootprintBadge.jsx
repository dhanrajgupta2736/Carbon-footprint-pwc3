import PropTypes from 'prop-types'

export default function FootprintBadge({ total }) {
  if (total === 0) return null
  const { color, label } =
    total <= 2   ? { color: 'text-eco-600 bg-eco-100',     label: 'Low impact'   } :
    total <= 4.7 ? { color: 'text-amber-600 bg-amber-100', label: 'Near average' } :
                   { color: 'text-red-600 bg-red-100',     label: 'High impact'  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${color} animate-fade-in`}
      aria-label={`Total emissions: ${total} tonnes CO2 equivalent per year — ${label}`}
    >
      <span className="w-2 h-2 rounded-full bg-current opacity-60" aria-hidden="true" />
      <span aria-hidden="true">{total}t CO2e/yr</span>
    </div>
  )
}

FootprintBadge.propTypes = {
  total: PropTypes.number.isRequired,
}
