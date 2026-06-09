/**
 * @fileoverview Home energy emissions calculator tab.
 * Fully accessible with semantic fieldsets, radio groups, and ARIA live regions.
 */

import { useState, useId } from 'react'
import PropTypes from 'prop-types'
import { Zap, Users, AlertCircle } from 'lucide-react'
import { HEATING_OPTIONS } from '../constants/emissions.js'

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

function NumberField({ label, value, onChange, unit, placeholder, min = 0, max, helper, icon, id }) {
  const errorId = `${id}-error`
  const [error, setError] = useState('')

  function handleChange(e) {
    const v = e.target.value
    if (v === '') { setError(''); onChange(''); return }
    const n = Number(v)
    if (!Number.isFinite(n) || n < min) { setError(`Must be at least ${min}`); return }
    if (max !== undefined && n > max)   { setError(`Must be at most ${max}`);   return }
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
          className={`input-field ${unit ? 'pr-16' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
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

export default function HomeCalculator({ data, onChange, emissions }) {
  const uid  = useId()
  const kwh  = +data.monthlyKwh || 0
  const cost = (kwh * 8).toFixed(0) // ≈ ₹8/kWh

  return (
    <section aria-label="Home energy emissions calculator" className="space-y-6 animate-slide-up">
      {/* Heating source */}
      <fieldset>
        <legend className="text-sm font-semibold text-eco-800 mb-3">
          Primary Energy / Heating Source
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Heating source">
          {HEATING_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none
                ${data.heatingSource === opt.value
                  ? 'border-eco-500 bg-eco-50 shadow-sm ring-1 ring-eco-300'
                  : 'border-eco-200 bg-white hover:border-eco-300'
                }`}
            >
              <input
                type="radio"
                name={`${uid}-heating`}
                value={opt.value}
                checked={data.heatingSource === opt.value}
                onChange={() => onChange({ ...data, heatingSource: opt.value })}
                className="sr-only"
              />
              <span aria-hidden="true" className="text-xl">{opt.emoji}</span>
              <div className="mt-1">
                <div className="text-sm font-semibold text-eco-800">{opt.label}</div>
                <div className="text-xs text-eco-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Monthly usage */}
      <NumberField
        id={`${uid}-kwh`}
        label="Monthly Electricity Usage"
        value={data.monthlyKwh}
        onChange={(v) => onChange({ ...data, monthlyKwh: v })}
        unit="kWh"
        placeholder="e.g. 250"
        min={0}
        max={5000}
        icon={<Zap size={13} className="text-eco-500" />}
        helper={kwh > 0
          ? `≈ ₹${cost}/month · ${(kwh * 12).toLocaleString('en-IN')} kWh/year`
          : 'Find this on your electricity bill'
        }
      />

      {/* Household size */}
      <fieldset>
        <legend className="text-sm font-semibold text-eco-800 flex items-center gap-1.5 mb-2">
          <Users size={13} aria-hidden="true" className="text-eco-500" />
          Household Size
        </legend>
        <div className="flex gap-2" role="radiogroup" aria-label="Number of people in household">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <label
              key={n}
              title={`${n} person${n > 1 ? 's' : ''}`}
              className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 cursor-pointer
                text-center transition-all duration-200 select-none
                ${+data.numPeople === n
                  ? 'border-eco-500 bg-eco-100 text-eco-800'
                  : 'border-eco-200 bg-white text-eco-500 hover:border-eco-300'
                }`}
            >
              <input
                type="radio"
                name={`${uid}-people`}
                value={n}
                checked={+data.numPeople === n}
                onChange={() => onChange({ ...data, numPeople: n })}
                className="sr-only"
              />
              {n}
            </label>
          ))}
          <label
            title="7 or more people"
            className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 cursor-pointer
              text-center transition-all duration-200 select-none
              ${+data.numPeople >= 7
                ? 'border-eco-500 bg-eco-100 text-eco-800'
                : 'border-eco-200 bg-white text-eco-500 hover:border-eco-300'
              }`}
          >
            <input
              type="radio"
              name={`${uid}-people`}
              value={7}
              checked={+data.numPeople >= 7}
              onChange={() => onChange({ ...data, numPeople: 7 })}
              className="sr-only"
            />
            7+
          </label>
        </div>
        <p className="text-xs text-eco-400 mt-1.5">Energy usage will be split per person</p>
      </fieldset>

      {/* Live result */}
      {emissions > 0 && (
        <div
          role="status"
          aria-live="polite"
          aria-label={`Home energy footprint: ${emissions} tonnes CO2 equivalent per year`}
          className="eco-gradient-soft rounded-2xl p-4 border border-eco-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-eco-700">Home Energy Footprint</span>
            <div className="text-right" aria-hidden="true">
              <span className="text-2xl font-bold text-eco-700 tabular-nums">{emissions}</span>
              <span className="text-sm text-eco-500 ml-1">t CO2e/yr</span>
            </div>
          </div>
          {data.heatingSource === 'gas' && (
            <p className="text-xs text-eco-600 mt-2">🌱 Switching to solar could reduce this to ~{(emissions * 0.25).toFixed(2)}t</p>
          )}
          {data.heatingSource === 'solar' && (
            <p className="text-xs text-eco-600 mt-2">⭐ Excellent choice — solar is among the lowest-emission home energy sources.</p>
          )}
        </div>
      )}
    </section>
  )
}

HomeCalculator.propTypes = {
  data: PropTypes.shape({
    monthlyKwh:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    heatingSource: PropTypes.string.isRequired,
    numPeople:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  onChange:  PropTypes.func.isRequired,
  emissions: PropTypes.number.isRequired,
}
