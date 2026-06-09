/**
 * @fileoverview Lifestyle & diet emissions calculator tab.
 * Fully accessible with semantic radio groups, ARIA live regions, and visible focus.
 */

import { useId } from 'react'
import PropTypes from 'prop-types'
import { Leaf, Recycle } from 'lucide-react'
import { DIET_OPTIONS, RECYCLE_OPTIONS } from '../constants/emissions.js'

/** @readonly Impact thresholds for diet emissions meter */
const DIET_IMPACT_LEVELS = [
  { max: 1.7,      color: '#16a34a', label: 'Low impact'    },
  { max: 2.5,      color: '#ca8a04', label: 'Medium impact' },
  { max: Infinity,  color: '#dc2626', label: 'High impact'   },
]

/**
 * Resolve impact level for diet emissions.
 * @param {number} tons — annual diet emissions
 * @returns {{ color: string, label: string }}
 */
function getDietImpact(tons) {
  for (const level of DIET_IMPACT_LEVELS) {
    if (tons <= level.max) return level
  }
  return DIET_IMPACT_LEVELS[DIET_IMPACT_LEVELS.length - 1]
}

function DietMeter({ tons }) {
  const max  = 4.5
  const pct  = Math.min((tons / max) * 100, 100)
  const { color, label } = getDietImpact(tons)

  return (
    <div className="mt-3 space-y-1" role="img" aria-label={`Diet CO2 impact: ${tons} tonnes per year — ${label}`}>
      <div className="flex justify-between text-xs text-eco-500" aria-hidden="true">
        <span>Low impact</span>
        <span className="font-semibold" style={{ color }}>{tons}t CO2e/yr from diet</span>
        <span>High impact</span>
      </div>
      <div className="h-2 rounded-full bg-eco-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
DietMeter.propTypes = { tons: PropTypes.number.isRequired }

export default function LifestyleCalculator({ data, onChange, emissions }) {
  const uid          = useId()
  const selectedDiet = DIET_OPTIONS.find((d) => d.value === data.dietType)

  return (
    <section aria-label="Lifestyle and diet emissions calculator" className="space-y-6 animate-slide-up">
      {/* Diet type */}
      <fieldset>
        <legend className="text-sm font-semibold text-eco-800 mb-3 flex items-center gap-1.5">
          <Leaf size={14} aria-hidden="true" />
          Diet Type
        </legend>
        <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Diet type">
          {DIET_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer
                transition-all duration-200 select-none
                ${data.dietType === opt.value
                  ? 'border-eco-500 bg-eco-50 shadow-sm ring-1 ring-eco-300'
                  : 'border-eco-200 bg-white hover:border-eco-300'
                }`}
            >
              <input
                type="radio"
                name={`${uid}-diet`}
                value={opt.value}
                checked={data.dietType === opt.value}
                onChange={() => onChange({ ...data, dietType: opt.value })}
                className="sr-only"
              />
              <span aria-hidden="true" className="text-2xl">{opt.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-eco-800">{opt.label}</div>
                <div className="text-xs text-eco-500">{opt.desc}</div>
              </div>
              <div className="text-right shrink-0" aria-hidden="true">
                <span className="text-xs font-mono font-bold text-eco-600">{opt.tons}t</span>
                <div className="text-xs text-eco-400">CO2/yr</div>
              </div>
            </label>
          ))}
        </div>
        {selectedDiet && <DietMeter tons={selectedDiet.tons} />}
      </fieldset>

      {/* Recycling habits */}
      <fieldset>
        <legend className="text-sm font-semibold text-eco-800 mb-3 flex items-center gap-1.5">
          <Recycle size={14} aria-hidden="true" />
          Recycling &amp; Waste Habits
        </legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Recycling habit">
          {RECYCLE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none
                ${data.recyclingHabit === opt.value
                  ? 'border-eco-500 bg-eco-50 shadow-sm ring-1 ring-eco-300'
                  : 'border-eco-200 bg-white hover:border-eco-300'
                }`}
            >
              <input
                type="radio"
                name={`${uid}-recycle`}
                value={opt.value}
                checked={data.recyclingHabit === opt.value}
                onChange={() => onChange({ ...data, recyclingHabit: opt.value })}
                className="sr-only"
              />
              <span aria-hidden="true" className="text-xl">{opt.emoji}</span>
              <div className="mt-1">
                <div className="text-sm font-semibold text-eco-800">{opt.label}</div>
                <div className="text-xs text-eco-500">{opt.desc}</div>
                {opt.saving > 0 && (
                  <div className="text-xs text-eco-600 font-medium mt-0.5">saves ~{opt.saving}t/yr</div>
                )}
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Live result */}
      {emissions > 0 && (
        <div
          role="status"
          aria-live="polite"
          aria-label={`Lifestyle footprint: ${emissions} tonnes CO2 equivalent per year`}
          className="eco-gradient-soft rounded-2xl p-4 border border-eco-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-eco-700">Lifestyle Footprint</span>
            <div className="text-right" aria-hidden="true">
              <span className="text-2xl font-bold text-eco-700 tabular-nums">{emissions}</span>
              <span className="text-sm text-eco-500 ml-1">t CO2e/yr</span>
            </div>
          </div>
          {['meatheavy', 'omnivore'].includes(data.dietType) && (
            <p className="text-xs text-eco-600 mt-2">
              🥗 Switching to flexitarian could save ~{(emissions - 2.78).toFixed(2)}t CO2e/year
            </p>
          )}
          {data.dietType === 'vegan' && data.recyclingHabit === 'all' && (
            <p className="text-xs text-eco-600 mt-2">🌟 Best-in-class lifestyle footprint!</p>
          )}
        </div>
      )}
    </section>
  )
}

LifestyleCalculator.propTypes = {
  data: PropTypes.shape({
    dietType:       PropTypes.string.isRequired,
    recyclingHabit: PropTypes.string.isRequired,
  }).isRequired,
  onChange:  PropTypes.func.isRequired,
  emissions: PropTypes.number.isRequired,
}
