import PropTypes from 'prop-types'
import { Sparkles } from 'lucide-react'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import useMessageReveal from './useMessageReveal.js'

export default function AssistantSidebar({ messages, totalEmissions }) {
  const { typing, visibleCount } = useMessageReveal(messages)

  return (
    <aside
      aria-label="Eco-Assistant — personalised carbon insights"
      className="glass-card rounded-2xl shadow-sm overflow-hidden h-full flex flex-col"
    >
      {/* Header */}
      <div className="eco-gradient p-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-xl animate-float"
            aria-hidden="true"
          >
            🌿
          </div>
          <div>
            <div className="text-white font-bold text-sm flex items-center gap-1.5">
              Eco-Assistant <Sparkles size={13} className="text-eco-200" aria-hidden="true" />
            </div>
            <div className="text-eco-200 text-xs">Personalised insights</div>
          </div>
        </div>
        {totalEmissions > 0 && (
          <div
            className="mt-3 bg-white/10 rounded-xl p-3 text-center"
            aria-label={`Current footprint: ${totalEmissions} tonnes CO2 equivalent per year`}
          >
            <div className="text-2xl font-bold text-white tabular-nums" aria-hidden="true">{totalEmissions}t</div>
            <div className="text-eco-200 text-xs">CO2e per year</div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2.5"
        role="log"
        aria-live="polite"
        aria-label="Eco-Assistant messages"
      >
        {typing && (
          <div className="animate-fade-in">
            <TypingIndicator />
          </div>
        )}
        {messages.slice(0, visibleCount).map((msg, i) => (
          <MessageBubble key={`${i}-${msg.type}`} msg={msg} index={i} />
        ))}
      </div>

      <div className="p-3 border-t border-eco-100">
        <p className="text-xs text-eco-400 text-center italic">Insights update as you enter data</p>
      </div>
    </aside>
  )
}

AssistantSidebar.propTypes = {
  messages:       PropTypes.array.isRequired,
  totalEmissions: PropTypes.number.isRequired,
}
