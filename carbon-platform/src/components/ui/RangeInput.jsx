import PropTypes from 'prop-types'

export default function RangeInput({ label, value, min, max, step = 1, unit, onChange, helper, id }) {
  const pct = max > min ? (((+value || 0) - min) / (max - min)) * 100 : 0
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
