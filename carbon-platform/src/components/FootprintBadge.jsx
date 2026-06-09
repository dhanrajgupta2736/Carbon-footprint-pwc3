/**
 * @fileoverview FootprintBadge — compact emissions indicator badge.
 * Uses a lookup map instead of nested ternaries for clean code analysis.
 */

import PropTypes from 'prop-types'

/** @readonly Impact level lookup based on emission thresholds */
const IMPACT_LEVELS = [
  { max: 2,   color: 'text-eco-600 bg-eco-100',     label: 'Low impact'   },
  { max: 4.7, color: 'text-amber-600 bg-amber-100', label: 'Near average' },
  { max: Infinity, color: 'text-red-600 bg-red-100', label: 'High impact' },
]

/**
 * Resolve impact level for a given total.
 * @param {number} total — total emissions in tonnes CO2e/yr
 * @returns {{ color: string, label: string }}
 */
function getImpactLevel(total) {
  for (const level of IMPACT_LEVELS) {
    if (total <= level.max) return level
  }
  return IMPACT_LEVELS[IMPACT_LEVELS.length - 1]
}

export default function FootprintBadge({ total }) {
  if (total === 0) return null

  const { color, label } = getImpactLevel(total)

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
