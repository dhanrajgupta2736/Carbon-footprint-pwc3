/**
 * @fileoverview Calculator column layout — renders the active calculator tab
 * with navigation controls and mobile emission summary strip.
 */

import { useCallback } from 'react'
import PropTypes from 'prop-types'
import { ErrorBoundary } from '../ErrorBoundary.jsx'
import TabBar from '../TabBar.jsx'
import FootprintBadge from '../FootprintBadge.jsx'
import TransportCalculator from '../TransportCalculator.jsx'
import HomeCalculator from '../HomeCalculator.jsx'
import LifestyleCalculator from '../LifestyleCalculator.jsx'
import { trackReportViewed } from '../../services/analytics.js'

/** @readonly Mobile-visible emission strips */
const SUMMARY_ITEMS = [
  { label: '🚗 Transport', key: 'transport' },
  { label: '🏠 Home',      key: 'home'      },
  { label: '🥗 Lifestyle', key: 'lifestyle' },
]

export default function CalculatorColumn({
  calcTabs, calcTab, onCalcTabChange, panelId,
  transportData, setTransportData, transportEmissions,
  homeData, setHomeData, homeEmissions,
  lifestyleData, setLifestyleData, lifestyleEmissions,
  totalEmissions, setRightTab,
}) {
  const calcTabIdx  = calcTabs.findIndex((t) => t.id === calcTab)
  const prevCalcTab = calcTabs[calcTabIdx - 1]?.id
  const nextCalcTab = calcTabs[calcTabIdx + 1]?.id

  const handleViewReport = useCallback(() => {
    setRightTab('chart')
    trackReportViewed(totalEmissions)
  }, [setRightTab, totalEmissions])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-eco-900">Carbon Calculator</h2>
          <p className="text-xs text-eco-500 mt-0.5">Emissions update in real time</p>
        </div>
        <FootprintBadge total={totalEmissions} />
      </div>

      <div className="glass-card rounded-2xl p-4 shadow-sm">
        <TabBar tabs={calcTabs} active={calcTab} onChange={onCalcTabChange} ariaLabel="Calculator sections" />

        <div role="tabpanel" id={`${panelId}-panel-${calcTab}`} aria-label={`${calcTab} calculator`} className="mt-5">
          <ErrorBoundary message="Calculator section failed to load.">
            {calcTab === 'transport' && (
              <TransportCalculator data={transportData} onChange={setTransportData} emissions={transportEmissions} />
            )}
            {calcTab === 'home' && (
              <HomeCalculator data={homeData} onChange={setHomeData} emissions={homeEmissions} />
            )}
            {calcTab === 'lifestyle' && (
              <LifestyleCalculator data={lifestyleData} onChange={setLifestyleData} emissions={lifestyleEmissions} />
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => prevCalcTab && onCalcTabChange(prevCalcTab)}
          disabled={!prevCalcTab}
          aria-label={prevCalcTab ? `Go to previous section: ${prevCalcTab}` : 'No previous section'}
          className="btn-secondary text-xs disabled:opacity-30 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
        >
          ← Previous
        </button>
        {nextCalcTab ? (
          <button
            onClick={() => onCalcTabChange(nextCalcTab)}
            aria-label={`Go to next section: ${nextCalcTab}`}
            className="btn-primary text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
          >
            Next Section →
          </button>
        ) : (
          <button
            onClick={handleViewReport}
            aria-label="View your carbon footprint report"
            className="btn-primary text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500"
          >
            View My Report →
          </button>
        )}
      </div>

      {/* Mobile summary strip */}
      {totalEmissions > 0 && (
        <div className="lg:hidden grid grid-cols-3 gap-2" aria-label="Emissions summary" role="region">
          {SUMMARY_ITEMS.map((s) => {
            const emissionsByKey = { transport: transportEmissions, home: homeEmissions, lifestyle: lifestyleEmissions }
            const val = emissionsByKey[s.key] ?? 0
            return (
              <div key={s.key} className="glass-card rounded-xl p-2.5 text-center" aria-label={`${s.label}: ${val} tonnes`}>
                <div className="text-xs text-eco-500">{s.label}</div>
                <div className="text-base font-bold text-eco-700 tabular-nums">{val}t</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

CalculatorColumn.propTypes = {
  calcTabs: PropTypes.arrayOf(
    PropTypes.shape({
      id:    PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon:  PropTypes.elementType,
    })
  ).isRequired,
  calcTab:             PropTypes.string.isRequired,
  onCalcTabChange:     PropTypes.func.isRequired,
  panelId:             PropTypes.string.isRequired,
  transportData:       PropTypes.shape({
    dailyKm:        PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    vehicleType:    PropTypes.string.isRequired,
    flightsPerYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    flightHours:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  setTransportData:    PropTypes.func.isRequired,
  transportEmissions:  PropTypes.number.isRequired,
  homeData:            PropTypes.shape({
    monthlyKwh:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    heatingSource: PropTypes.string.isRequired,
    numPeople:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  setHomeData:         PropTypes.func.isRequired,
  homeEmissions:       PropTypes.number.isRequired,
  lifestyleData:       PropTypes.shape({
    dietType:       PropTypes.string.isRequired,
    recyclingHabit: PropTypes.string.isRequired,
  }).isRequired,
  setLifestyleData:    PropTypes.func.isRequired,
  lifestyleEmissions:  PropTypes.number.isRequired,
  totalEmissions:      PropTypes.number.isRequired,
  setRightTab:         PropTypes.func.isRequired,
}
