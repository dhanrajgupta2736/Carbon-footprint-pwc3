import { useState } from 'react'
import PropTypes from 'prop-types'
import { CheckCircle2, Circle, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'
import { EFFORT_CONFIG, CATEGORY_CONFIG } from '../../constants/emissions.js'
import { trackEvent } from '../../services/analytics.js'

export default function ActionCard({ action, completed, onToggle }) {
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
