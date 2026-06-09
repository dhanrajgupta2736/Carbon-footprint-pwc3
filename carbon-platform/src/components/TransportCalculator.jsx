/**
 * @fileoverview Transport emissions calculator tab.
 * Handles vehicle type selection, commute distance, and flight inputs.
 * Fully accessible: all controls have labels, ARIA attributes, and keyboard support.
 */

import { useId } from 'react'
import PropTypes from 'prop-types'
import { Car, Plane } from 'lucide-react'
import { VEHICLE_OPTIONS } from '../constants/emissions.js'
import NumberField from './ui/NumberField.jsx'
import RangeInput from './ui/RangeInput.jsx'

export default function TransportCalculator({ data, onChange, emissions }) {
  const uid = useId()
  const dailyKmId = `${uid}-dailyKm`

  return (
    <section aria-label="Transport emissions calculator" className="space-y-6 animate-slide-up">
      {/* Vehicle type */}
      <fieldset>
        <legend className="text-sm font-semibold text-eco-800 mb-3 flex items-center gap-1.5">
          <Car size={14} aria-hidden="true" />
          Primary Vehicle Type
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Vehicle type">
          {VEHICLE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium
                cursor-pointer transition-all duration-200 select-none
                ${data.vehicleType === opt.value
                  ? 'border-eco-500 bg-eco-50 text-eco-800 shadow-sm ring-1 ring-eco-300'
                  : `${opt.badgeColor} hover:border-eco-300`
                }`}
            >
              <input
                type="radio"
                name={`${uid}-vehicle`}
                value={opt.value}
                checked={data.vehicleType === opt.value}
                onChange={() => onChange({ ...data, vehicleType: opt.value })}
                className="sr-only"
              />
              <span aria-hidden="true" className="text-lg">{opt.emoji}</span>
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Daily commute */}
      <RangeInput
        id={dailyKmId}
        label="Daily Commute Distance (round trip)"
        value={data.dailyKm}
        min={0}
        max={200}
        step={1}
        unit="km"
        onChange={(v) => onChange({ ...data, dailyKm: v })}
        helper={data.vehicleType === 'bikewalk' ? '🌱 Zero emissions!' : undefined}
      />

      {/* Flights */}
      <div className="grid grid-cols-2 gap-4" role="group" aria-label="Flight details">
        <NumberField
          id={`${uid}-flights`}
          label="Flights per Year"
          value={data.flightsPerYear}
          onChange={(v) => onChange({ ...data, flightsPerYear: v })}
          placeholder="e.g. 2"
          min={0}
          max={365}
          helper="Round trips counted"
          icon={<Plane size={12} />}
        />
        <NumberField
          id={`${uid}-flightHours`}
          label="Avg. Flight Duration"
          value={data.flightHours}
          onChange={(v) => onChange({ ...data, flightHours: v })}
          unit="hrs"
          placeholder="e.g. 3"
          min={0}
          max={24}
          helper="Per single flight"
        />
      </div>

      {/* Live result */}
      {emissions > 0 && (
        <div
          role="status"
          aria-live="polite"
          aria-label={`Transport footprint: ${emissions} tonnes CO2 equivalent per year`}
          className="eco-gradient-soft rounded-2xl p-4 border border-eco-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-eco-700">Transport Footprint</span>
            <div className="text-right" aria-hidden="true">
              <span className="text-2xl font-bold text-eco-700 tabular-nums">{emissions}</span>
              <span className="text-sm text-eco-500 ml-1">t CO2e/yr</span>
            </div>
          </div>
          {(data.vehicleType === 'petrol' || data.vehicleType === 'diesel') && emissions > 1.5 && (
            <p className="text-xs text-eco-600 mt-2">
              💡 Switching to an EV could reduce this by ~{(emissions * 0.65).toFixed(2)}t
            </p>
          )}
          {data.vehicleType === 'bikewalk' && (
            <p className="text-xs text-eco-600 mt-2">
              🌟 Excellent! Zero commute emissions — you are a climate hero.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

TransportCalculator.propTypes = {
  data: PropTypes.shape({
    dailyKm:        PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    vehicleType:    PropTypes.string.isRequired,
    flightsPerYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    flightHours:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onChange:  PropTypes.func.isRequired,
  emissions: PropTypes.number.isRequired,
}
