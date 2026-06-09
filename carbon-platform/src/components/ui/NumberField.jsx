import { useState } from 'react'
import PropTypes from 'prop-types'
import FieldError from './FieldError.jsx'

export default function NumberField({ label, value, onChange, unit, placeholder, min = 0, max, helper, icon, id }) {
  const errorId = `${id}-error`
  const [error, setError] = useState('')

  // Sync state validation when boundaries change or value shifts
  function handleChange(e) {
    const v = e.target.value
    if (v === '') {
      setError('')
      onChange('')
      return
    }
    const n = Number(v)
    if (!Number.isFinite(n) || n < min) {
      setError(`Value must be at least ${min}`)
      return
    }
    if (max !== undefined && n > max) {
      setError(`Value must be at most ${max}`)
      return
    }
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
