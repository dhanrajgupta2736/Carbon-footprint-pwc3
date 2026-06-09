import PropTypes from 'prop-types'

const TYPE_STYLES = {
  welcome:  { bg: 'bg-eco-50 border-eco-200',   icon: '👋' },
  positive: { bg: 'bg-eco-50 border-eco-300',   icon: '🌟' },
  alert:    { bg: 'bg-red-50 border-red-200',   icon: '⚠️' },
  neutral:  { bg: 'bg-blue-50 border-blue-200', icon: '📊' },
  tip:      { bg: 'bg-amber-50 border-amber-200', icon: '💡' },
  info:     { bg: 'bg-teal-50 border-teal-200',  icon: 'ℹ️' },
}

export default function MessageBubble({ msg, index }) {
  const style = TYPE_STYLES[msg.type] ?? TYPE_STYLES.neutral
  return (
    <div
      className={`border rounded-2xl rounded-tl-sm p-3 animate-slide-up ${style.bg}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex gap-2 items-start">
        <span aria-hidden="true" className="text-base shrink-0 w-6 text-center">{style.icon}</span>
        <p className="text-xs text-eco-800 leading-relaxed">{msg.message}</p>
      </div>
    </div>
  )
}

MessageBubble.propTypes = {
  msg:   PropTypes.shape({ type: PropTypes.string, message: PropTypes.string }).isRequired,
  index: PropTypes.number.isRequired,
}
export { TYPE_STYLES }
