import PropTypes from 'prop-types'

export default function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-xl px-3 py-2 shadow-lg text-xs" role="tooltip">
      <p className="font-bold text-eco-800">{payload[0].name}</p>
      <p className="text-eco-600 tabular-nums">{payload[0].value} t CO2e</p>
    </div>
  )
}

ChartTooltip.propTypes = {
  active:  PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.shape({
    name:  PropTypes.string,
    value: PropTypes.number,
  })),
}

ChartTooltip.defaultProps = {
  active:  false,
  payload: [],
}
