import { useId } from 'react'
import PropTypes from 'prop-types'

export default function TabBar({ tabs, active, onChange, ariaLabel }) {
  const uid = useId()
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex gap-1 bg-eco-100/70 rounded-2xl p-1"
    >
      {tabs.map((tab) => {
        const Icon     = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            id={`${uid}-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`${uid}-panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
              text-xs font-semibold transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-500 focus-visible:ring-offset-1
              ${isActive ? 'bg-white text-eco-700 shadow-sm' : 'text-eco-500 hover:text-eco-700 hover:bg-white/50'}`}
          >
            {Icon && <Icon size={14} aria-hidden="true" />}
            <span>{tab.shortLabel ?? tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

TabBar.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      shortLabel: PropTypes.string,
      icon: PropTypes.elementType,
    })
  ).isRequired,
  active: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string.isRequired,
}
