/**
 * @fileoverview Analytics / action plan column layout.
 * Renders the right-side panel tabs (chart, plan, google services).
 */

import PropTypes from 'prop-types'
import { ErrorBoundary } from '../ErrorBoundary.jsx'
import TabBar from '../TabBar.jsx'
import EmissionsChart from '../EmissionsChart.jsx'
import ActionPlan from '../ActionPlan.jsx'
import GoogleServicesContainer from '../GoogleServicesContainer.jsx'

/** @readonly Panel labels for ARIA and heading text, keyed by tab ID */
const PANEL_LABELS = { chart: 'Emissions analytics', plan: 'Eco-action plan', google: 'Google services' }
const PANEL_HEADINGS = { chart: 'Your Impact', plan: 'Eco-Action Plan', google: 'Google Services' }

export default function AnalyticsColumn({
  rightTabs, rightTab, setRightTab,
  transportEmissions, homeEmissions, lifestyleEmissions,
  totalEmissions, breakdown, comparison,
  allActions, completedActions, toggleAction, projectedReduction,
}) {
  const panelLabel = PANEL_LABELS[rightTab] ?? 'Results'
  const heading = PANEL_HEADINGS[rightTab] ?? 'Results'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-eco-900">{heading}</h2>
        {rightTab === 'plan' && completedActions.size > 0 && (
          <span className="text-xs font-bold bg-eco-100 text-eco-700 px-2.5 py-1 rounded-full" aria-live="polite">
            {completedActions.size} done ✓
          </span>
        )}
      </div>

      <TabBar tabs={rightTabs} active={rightTab} onChange={setRightTab} ariaLabel="Results view" />

      <div role="tabpanel" aria-label={panelLabel}>
        <ErrorBoundary message="This panel failed to load. Try refreshing.">
          {rightTab === 'chart' && (
            <EmissionsChart
              transport={transportEmissions}
              home={homeEmissions}
              lifestyle={lifestyleEmissions}
              total={totalEmissions}
              breakdown={breakdown}
              comparison={comparison}
            />
          )}
          {rightTab === 'plan' && (
            <ActionPlan
              actions={allActions}
              completedActions={completedActions}
              onToggle={toggleAction}
              projectedReduction={projectedReduction}
              totalEmissions={totalEmissions}
            />
          )}
          {rightTab === 'google' && (
            <GoogleServicesContainer totalEmissions={totalEmissions} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}

AnalyticsColumn.propTypes = {
  rightTabs: PropTypes.arrayOf(
    PropTypes.shape({
      id:    PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon:  PropTypes.elementType,
    })
  ).isRequired,
  rightTab:           PropTypes.string.isRequired,
  setRightTab:        PropTypes.func.isRequired,
  transportEmissions: PropTypes.number.isRequired,
  homeEmissions:      PropTypes.number.isRequired,
  lifestyleEmissions: PropTypes.number.isRequired,
  totalEmissions:     PropTypes.number.isRequired,
  breakdown:          PropTypes.shape({
    transport: PropTypes.number,
    home:      PropTypes.number,
    lifestyle: PropTypes.number,
  }).isRequired,
  comparison:         PropTypes.shape({
    vsGlobal: PropTypes.number,
    vsIndia:  PropTypes.number,
    vsTarget: PropTypes.number,
  }).isRequired,
  allActions: PropTypes.arrayOf(
    PropTypes.shape({
      id:       PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      title:    PropTypes.string.isRequired,
      impact:   PropTypes.number.isRequired,
    })
  ).isRequired,
  completedActions:   PropTypes.instanceOf(Set).isRequired,
  toggleAction:       PropTypes.func.isRequired,
  projectedReduction: PropTypes.number.isRequired,
}
