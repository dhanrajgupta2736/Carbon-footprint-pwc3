/**
 * @fileoverview Gamified eco-action plan with task completion and progress tracking.
 * Fully accessible: keyboard operable, ARIA live regions, focus management.
 */

import { useState, useId } from 'react'
import PropTypes from 'prop-types'
import { CheckCircle2, Circle, Zap, TrendingDown, Award, ChevronDown, ChevronUp } from 'lucide-react'
import { EFFORT_CONFIG, CATEGORY_CONFIG } from '../constants/emissions.js'
import { trackEvent } from '../services/analytics.js'

// ─── Progress ring SVG ─────────────────────────────────────────────────────
function ProgressRing({ pct, size = 80 }) {
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
ProgressRing.propTypes = { pct: PropTypes.number.isRequired, size: PropTypes.number }

// ─── Single action card ────────────────────────────────────────────────────
function ActionCard({ action, completed, onToggle }) {
  const [expanded, setExpanded]   = useState(false)
  const descId  = `action-desc-${action.id}`
  const effort  = EFFORT_CONFIG[action.effort]  ?? EFFORT_CONFIG.low
  const cat     = CATEGORY_CONFIG[action.category] ?? CATEGORY_CONFIG.lifestyle

  return (
    <article
      aria-label={`${action.title} — ${completed ? 'completed' : 'not yet completed'}`}
      className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden
        ${completed
          ? 'border-eco-300 bg-eco-50/80'
          : 'border-eco-100 bg-white hover:border-eco-200 hover:shadow-sm'
        }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox toggle */}
          <button
            onClick={() => onToggle(action.id)}
            aria-pressed={completed}
            aria-label={completed ? `Mark "${action.title}" as incomplete` : `Mark "${action.title}" as complete`}
            className="mt-0.5 shrink-0 transition-all duration-200 hover:scale-110 active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 focus-visible:ring-offset-2 rounded-full"
          >
            {completed
              ? <CheckCircle2 size={22} className="text-eco-500 fill-eco-100" aria-hidden="true" />
              : <Circle       size={22} className="text-eco-300"             aria-hidden="true" />
            }
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span aria-hidden="true" className="text-base">{action.icon}</span>
              <span className={`text-sm font-bold ${completed ? 'line-through text-eco-400' : 'text-eco-900'}`}>
                {action.title}
              </span>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.badgeClass}`}>
                {cat.label}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${effort.badgeClass}`}>
                {action.tag || effort.label}
              </span>
              <span className="text-xs font-bold text-eco-600 ml-auto tabular-nums" aria-label={`Reduces emissions by ${action.impact} tonnes CO2 per year`}>
                <TrendingDown size={11} className="inline mr-0.5" aria-hidden="true" />
                −{action.impact}t/yr
              </span>
            </div>

            {/* Expandable description */}
            <button
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              aria-controls={descId}
              className="mt-2 text-xs text-eco-500 flex items-center gap-1
                hover:text-eco-700 transition-colors
                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-eco-400 rounded"
            >
              {expanded
                ? <><ChevronUp size={13} aria-hidden="true" /> Hide detail</>
                : <><ChevronDown size={13} aria-hidden="true" /> Why this matters</>
              }
            </button>

            <div id={descId} role="region" aria-label={`Details for ${action.title}`}>
              {expanded && (
                <div className="mt-2 space-y-2.5 animate-slide-up">
                  <p className="text-xs text-eco-600 leading-relaxed">
                    {action.description}
                  </p>
                  
                  {/* Google Calendar Link */}
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('CarbonWise: ' + action.title)}&details=${encodeURIComponent(action.description + '\n\nImpact: Save ' + action.impact + 't CO2e/year')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 border border-eco-200 hover:border-eco-300 bg-eco-50 hover:bg-eco-100 rounded-lg text-[10px] font-bold text-eco-700 transition-colors focus-visible:ring-1 focus-visible:ring-eco-400"
                    onClick={() => trackEvent('google_calendar_reminder_added', { action_id: action.id })}
                  >
                    📅 Schedule Weekly Google Calendar Reminder
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
ActionCard.propTypes = {
  action: PropTypes.shape({
    id:          PropTypes.string.isRequired,
    category:    PropTypes.string.isRequired,
    title:       PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    impact:      PropTypes.number.isRequired,
    effort:      PropTypes.string.isRequired,
    icon:        PropTypes.string.isRequired,
    tag:         PropTypes.string,
  }).isRequired,
  completed: PropTypes.bool.isRequired,
  onToggle:  PropTypes.func.isRequired,
}

// ─── Filter tab bar ────────────────────────────────────────────────────────
const FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'transport', label: '🚗 Transport' },
  { key: 'home',      label: '🏠 Home'     },
  { key: 'lifestyle', label: '🥗 Lifestyle' },
  { key: 'done',      label: '✅ Done'     },
]

function FilterBar({ active, onChange }) {
  const uid = useId()
  return (
    <div
      role="tablist"
      aria-label="Filter eco-actions"
      className="flex gap-1.5 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {FILTERS.map((f) => (
        <button
          key={f.key}
          role="tab"
          id={`${uid}-tab-${f.key}`}
          aria-selected={active === f.key}
          onClick={() => onChange(f.key)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500
            ${active === f.key
              ? 'bg-eco-600 text-white shadow'
              : 'bg-eco-100 text-eco-600 hover:bg-eco-200'
            }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
FilterBar.propTypes = { active: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired }

// ─── Main component ────────────────────────────────────────────────────────
export default function ActionPlan({ actions, completedActions, onToggle, projectedReduction, totalEmissions }) {
  const [filter, setFilter] = useState('all')

  const completedCount  = actions.filter((a) => completedActions.has(a.id)).length
  const totalPossible   = actions.reduce((s, a) => s + a.impact, 0)
  const progressPct     = totalPossible > 0 ? Math.min((projectedReduction / totalPossible) * 100, 100) : 0
  const newTotal        = Math.max(0, totalEmissions - projectedReduction)

  const filtered = (() => {
    switch (filter) {
      case 'done':      return actions.filter((a) =>  completedActions.has(a.id))
      case 'all':       return actions
      default:          return actions.filter((a) => a.category === filter && !completedActions.has(a.id))
    }
  })()

  if (actions.length === 0) {
    return (
      <div className="text-center py-12 text-eco-400" role="status">
        <span className="text-4xl mb-3 block" aria-hidden="true">🌱</span>
        <p className="font-medium">Enter your data in the calculator tabs</p>
        <p className="text-sm mt-1">Your personalised action plan will appear here</p>
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
            <ProgressRing pct={progressPct} />
            <div
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-sm font-bold text-eco-700">{Math.round(progressPct)}%</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-eco-800 text-sm">Eco-Action Progress</h3>
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
          <strong>{(totalPossible * 1_000_000).toLocaleString('en-IN')}t</strong>{' '}
          CO2e — equivalent to planting ~{Math.round(totalPossible * 1_000_000 / 0.021).toLocaleString('en-IN')} trees.
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
