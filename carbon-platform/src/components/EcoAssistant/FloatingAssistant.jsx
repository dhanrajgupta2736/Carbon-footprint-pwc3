import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { trackAssistantOpened } from '../../services/analytics.js'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import useMessageReveal from './useMessageReveal.js'

export default function FloatingAssistant({ messages, totalEmissions }) {
  const [open, setOpen] = useState(false)
  const { typing, visibleCount } = useMessageReveal(messages)
  const panelRef = useRef(null)
  const btnRef   = useRef(null)

  const handleOpen = useCallback(() => {
    setOpen(true)
    trackAssistantOpened()
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    btnRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, handleClose])

  const hasAlert = messages.some((m) => m.type === 'alert')

  return (
    <>
      {/* Floating trigger */}
      <button
        ref={btnRef}
        onClick={open ? handleClose : handleOpen}
        aria-label={open ? 'Close Eco-Assistant' : 'Open Eco-Assistant'}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl
          flex items-center justify-center transition-all duration-300
          hover:scale-110 active:scale-95
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-eco-400 focus-visible:ring-offset-2
          ${open ? 'bg-eco-700' : 'eco-gradient'}
          ${hasAlert && !open ? 'ring-2 ring-red-400 ring-offset-2' : ''}
        `}
      >
        {open
          ? <X size={22} className="text-white" aria-hidden="true" />
          : <MessageCircle size={22} className="text-white" aria-hidden="true" />
        }
        {!open && messages.length > 1 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 w-5 h-5 bg-eco-500 rounded-full
              text-white text-xs flex items-center justify-center font-bold border-2 border-white"
          >
            {messages.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Eco-Assistant insights"
          aria-modal="true"
          className="fixed bottom-24 right-4 left-4 sm:left-auto sm:w-80 z-40 animate-slide-up"
        >
          <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
            <div className="eco-gradient p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-xl" aria-hidden="true">🌿</div>
              <div>
                <div className="text-white font-bold text-sm flex items-center gap-1.5">
                  Eco-Assistant <Sparkles size={13} className="text-eco-200" aria-hidden="true" />
                </div>
                <div className="text-eco-200 text-xs">Personalised carbon insights</div>
              </div>
              {totalEmissions > 0 && (
                <div className="ml-auto text-right" aria-hidden="true">
                  <div className="text-white font-bold text-sm tabular-nums">{totalEmissions}t</div>
                  <div className="text-eco-200 text-xs">CO2e/yr</div>
                </div>
              )}
            </div>

            <div
              className="p-3 space-y-2 max-h-72 overflow-y-auto"
              role="log"
              aria-live="polite"
              aria-label="Assistant messages"
            >
              {typing && <TypingIndicator />}
              {messages.slice(0, visibleCount).map((msg, i) => (
                <MessageBubble key={`${i}-${msg.type}`} msg={msg} index={i} />
              ))}
            </div>

            <div className="px-3 pb-3 border-t border-eco-100 pt-2">
              <p className="text-xs text-eco-400 text-center">Update your data for fresh insights</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

FloatingAssistant.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      type:    PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    })
  ).isRequired,
  totalEmissions: PropTypes.number.isRequired,
}
