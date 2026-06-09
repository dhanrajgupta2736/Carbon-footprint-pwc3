/**
 * @fileoverview Transport emissions calculator tab.
 * Handles vehicle type selection, commute distance, and flight inputs.
 * Fully accessible: all controls have labels, ARIA attributes, and keyboard support.
 */

import { useState, useId } from 'react'
import PropTypes from 'prop-types'
import { Car, Plane, AlertCircle } from 'lucide-react'
import { VEHICLE_OPTIONS } from '../constants/emissions.js'

// ─── Sub-components ────────────────────────────────────────────────────────

function FieldError({ message, id }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-xs text-red-600 flex items-center gap-1 mt-1">
      <AlertCircle size={12} aria-hidden="true" />
      {message}
    </p>
  )
}
FieldError.propTypes = { message: PropTypes.string, id: PropTypes.string.isRequired }

function RangeInput({ label, value, min, max, step = 1, unit, onChange, helper, id }) {
  const pct = max > 0 ? (((+value || 0) - min) / (max - min)) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-sm font-semibold text-eco-800">{label}</label>
        <output
          htmlFor={id}
          aria-live="polite"
          className="text-sm font-mono font-bold text-eco-600 bg-eco-100 px-2 py-0.5 rounded-lg tabular-nums"
        >
          {+value || 0} {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={+value || 0}
        onChange={(e) => onChange(+e.target.value)}
        style={{ '--val': `${pct}%` }}
        className="w-full cursor-pointer"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={+value || 0}
        aria-valuetext={`${+value || 0} ${unit}`}
      />
      <div className="flex justify-between text-xs text-eco-400" aria-hidden="true">
        <span>{min} {unit}</span>
        {helper && <span className="text-eco-500 italic">{helper}</span>}
        <span>{max} {unit}</span>
      </div>
    </div>
  )
}
RangeInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number,
  unit: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  helper: PropTypes.string,
  id: PropTypes.string.isRequired,
}

function NumberField({ label, value, onChange, unit, placeholder, min = 0, max, helper, icon, id }) {
  const errorId = `${id}-error`
  const [error, setError] = useState('')

  function handleChange(e) {
    const v = e.target.value
    if (v === '') { setError(''); onChange(''); return }
    const n = Number(v)
    if (!Number.isFinite(n) || n < min)       { setError(`Value must be at least ${min}`);     return }
    if (max !== undefined && n > max)          { setError(`Value must be at most ${max}`);      return }
    setError('')
    onChange(v)
  }

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-semibold text-eco-800 flex items-center gap-1.5">
        {icon && <span aria-hidden="true">{icon}</span>}
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={!!error}
          className={`input-field ${unit ? 'pr-14' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        />
        {unit && (
          <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-eco-400 font-medium pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      <FieldError message={error} id={errorId} />
      {!error && helper && <p className="text-xs text-eco-400">{helper}</p>}
    </div>
  )
}
NumberField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  unit: PropTypes.string,
  placeholder: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  helper: PropTypes.string,
  icon: PropTypes.node,
  id: PropTypes.string.isRequired,
}

// ─── Main component ────────────────────────────────────────────────────────

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
