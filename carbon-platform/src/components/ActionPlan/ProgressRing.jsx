import PropTypes from 'prop-types'

export default function ProgressRing({ pct, size = 80 }) {
  const r    = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <svg
      width={size}
      height={size}
      aria-hidden="true"
      className="rotate-[-90deg]"
      focusable="false"
    >
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#dcfce7" strokeWidth={7} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke="#16a34a"
        strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  )
}

ProgressRing.propTypes = {
  pct:  PropTypes.number.isRequired,
  size: PropTypes.number,
}

ProgressRing.defaultProps = {
  size: 80,
}
