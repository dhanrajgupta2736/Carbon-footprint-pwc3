/**
 * @fileoverview Gamified eco-action plan with task completion and progress tracking.
 * Fully accessible: keyboard operable, ARIA live regions, focus management.
 */

import PropTypes from 'prop-types'
import { Zap, Award } from 'lucide-react'
import ProgressRing from './ActionPlan/ProgressRing.jsx'
import ActionCard from './ActionPlan/ActionCard.jsx'
import FilterBar from './ActionPlan/FilterBar.jsx'
import { useState } from 'react'

export default function ActionPlan({ actions, completedActions, onToggle, projectedReduction, totalEmissions }) {
  const [filter, setFilter] = useState('all')

  const completedCount  = actions.filter((a) => completedActions.has(a.id)).length
  const footprintReductionPct = totalEmissions > 0 ? Math.min((projectedReduction / totalEmissions) * 100, 100) : 0
  const newTotal        = Math.max(0, totalEmissions - projectedReduction)

  const filtered = (() => {
    switch (filter) {
      case 'done':      return actions.filter((a) =>  completedActions.has(a.id))
      case 'all':       return actions
      default:          return actions.filter((a) => a.category === filter && !completedActions.has(a.id))
    }
  })()

  // Beautiful visual empty state with leaf/action board illustration
  if (actions.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center shadow-sm space-y-4 max-w-md mx-auto animate-fade-in" role="status">
        <div className="w-16 h-16 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg className="w-8 h-8 text-eco-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-eco-800">Ready to Take Action?</h3>
        <p className="text-xs text-eco-500 leading-relaxed">
          Your personalized eco-action plan is generated from your inputs.
          Fill out the calculator tabs on the left (Commute, Home Energy, or Lifestyle) to see custom reduction recommendations here.
        </p>
        <div className="text-[10px] text-eco-400 italic">
          Every checked action updates your projected carbon reduction in real time.
        </div>
      </div>
    )
  }

  const badgeLabel =
    completedCount >= actions.length ? '🏆 Eco Champion!' :
    completedCount >= 5              ? '⭐ Eco Hero!'      :
    completedCount >= 3              ? '🌟 Eco Warrior!'   : null

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Progress summary */}
      <div className="glass-card rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <ProgressRing pct={footprintReductionPct} />
            <div
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-sm font-bold text-eco-700">{Math.round(footprintReductionPct)}%</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-eco-800 text-sm">Carbon Reduced</h3>
            <p className="text-xs text-eco-500 mt-0.5" aria-live="polite">
              {completedCount} of {actions.length} tasks completed
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-eco-500">Projected CO2 reduction</span>
                <span className="font-bold text-eco-700 tabular-nums" aria-live="polite">
                  −{projectedReduction.toFixed(2)}t/yr
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-eco-500">New annual footprint</span>
                <span className="font-bold text-eco-700 tabular-nums" aria-live="polite">
                  {newTotal.toFixed(2)}t CO2e/yr
                </span>
              </div>
            </div>
          </div>
        </div>

        {badgeLabel && (
          <div
            className="mt-3 flex items-center gap-2 bg-eco-100 rounded-xl px-3 py-2"
            role="status"
            aria-live="polite"
          >
            <Award size={16} className="text-eco-600 shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold text-eco-700">{badgeLabel} Keep it up!</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <FilterBar active={filter} onChange={setFilter} />

      {/* Action cards */}
      <div
        role="list"
        aria-label={`Eco-actions — ${filter === 'all' ? 'showing all' : `filtered by ${filter}`}`}
        className="space-y-3"
      >
        {filtered.length === 0 ? (
          <p className="text-center py-6 text-eco-400 text-sm" role="status">
            {filter === 'done' ? 'No completed actions yet — start checking them off!' : 'No actions in this category.'}
          </p>
        ) : (
          filtered.map((action) => (
            <div key={action.id} role="listitem">
              <ActionCard
                action={action}
                completed={completedActions.has(action.id)}
                onToggle={onToggle}
              />
            </div>
          ))
        )}
      </div>

      {/* Collective impact footer */}
      <div className="text-center py-3 px-4 bg-eco-50 rounded-2xl border border-eco-200">
        <Zap size={16} className="inline text-eco-500 mr-1.5 mb-0.5" aria-hidden="true" />
        <span className="text-xs text-eco-600 font-medium">
          If 1 million people completed all actions, we would collectively save{' '}
          <strong>{(actions.reduce((s, a) => s + a.impact, 0) * 1_000_000).toLocaleString('en-IN')}t</strong>{' '}
          CO2e — equivalent to planting ~{Math.round(actions.reduce((s, a) => s + a.impact, 0) * 1_000_000 / 0.021).toLocaleString('en-IN')} trees.
        </span>
      </div>
    </div>
  )
}

ActionPlan.propTypes = {
  actions:            PropTypes.array.isRequired,
  completedActions:   PropTypes.instanceOf(Set).isRequired,
  onToggle:           PropTypes.func.isRequired,
  projectedReduction: PropTypes.number.isRequired,
  totalEmissions:     PropTypes.number.isRequired,
}
