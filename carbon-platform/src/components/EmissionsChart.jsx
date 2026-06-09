/**
 * @fileoverview Emissions analytics panel with Recharts visualisations.
 * All charts include accessible titles, descriptions, and ARIA labels.
 * Data tables are provided as accessible alternatives to visual charts.
 */

import PropTypes from 'prop-types'
import EmissionGauge from './EmissionsChart/EmissionGauge.jsx'
import BreakdownDonut from './EmissionsChart/BreakdownDonut.jsx'
import ComparisonBar from './EmissionsChart/ComparisonBar.jsx'

export default function EmissionsChart({ transport, home, lifestyle, total, breakdown, comparison }) {
  if (total === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center shadow-sm space-y-4 max-w-md mx-auto animate-fade-in" role="status">
        <div className="w-16 h-16 bg-eco-50 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-8 h-8 text-eco-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-eco-800">No Analytics Yet</h3>
        <p className="text-xs text-eco-500 leading-relaxed">
          Your real-time carbon footprint analytics, breakdown chart, and global averages comparison will generate here as soon as you start adding metrics.
        </p>
        <div className="text-[10px] text-eco-400 italic">
          All data is kept fully local on your device.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Total gauge */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-eco-800 mb-4">Your Total Carbon Footprint</h3>
        <EmissionGauge total={total} />
      </div>

      {/* Donut breakdown */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-eco-800 mb-3">Emissions Breakdown</h3>
        <BreakdownDonut transport={transport} home={home} lifestyle={lifestyle} breakdown={breakdown} />
      </div>

      {/* Comparison */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-eco-800 mb-3">Global Comparison</h3>
        <ComparisonBar total={total} comparison={comparison} />
      </div>
    </div>
  )
}

EmissionsChart.propTypes = {
  transport:  PropTypes.number.isRequired,
  home:       PropTypes.number.isRequired,
  lifestyle:  PropTypes.number.isRequired,
  total:      PropTypes.number.isRequired,
  breakdown:  PropTypes.shape({
    transport: PropTypes.number.isRequired,
    home:      PropTypes.number.isRequired,
    lifestyle: PropTypes.number.isRequired,
  }).isRequired,
  comparison: PropTypes.shape({
    vsGlobal: PropTypes.number.isRequired,
    vsIndia:  PropTypes.number.isRequired,
    vsTarget: PropTypes.number.isRequired,
  }).isRequired,
}
