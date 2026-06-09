import { useId } from 'react'
import PropTypes from 'prop-types'

const FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'transport', label: '🚗 Transport' },
  { key: 'home',      label: '🏠 Home'     },
  { key: 'lifestyle', label: '🥗 Lifestyle' },
  { key: 'done',      label: '✅ Done'     },
]

export default function FilterBar({ active, onChange }) {
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

FilterBar.propTypes = {
  active: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}
