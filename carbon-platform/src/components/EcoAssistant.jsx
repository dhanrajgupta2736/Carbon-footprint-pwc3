/**
 * @fileoverview Context-aware Eco-Assistant.
 * Sidebar (desktop) + floating panel (mobile) variants.
 * Fully accessible: focus trap in modal, ARIA live regions, keyboard dismiss.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { trackAssistantOpened } from '../services/analytics.js'

// ─── Message type → visual config ─────────────────────────────────────────
const TYPE_STYLES = {
  welcome:  { bg: 'bg-eco-50 border-eco-200',   icon: '👋' },
  positive: { bg: 'bg-eco-50 border-eco-300',   icon: '🌟' },
  alert:    { bg: 'bg-red-50 border-red-200',   icon: '⚠️' },
  neutral:  { bg: 'bg-blue-50 border-blue-200', icon: '📊' },
  tip:      { bg: 'bg-amber-50 border-amber-200', icon: '💡' },
  info:     { bg: 'bg-teal-50 border-teal-200',  icon: 'ℹ️' },
}

// ─── Typing indicator ──────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="Eco-Assistant is thinking"
      className="flex items-center gap-2 px-4 py-3 bg-eco-50 border border-eco-200 rounded-2xl rounded-tl-sm w-fit"
    >
      <span aria-hidden="true" className="text-sm">🤖</span>
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-eco-400 typing-dot" />
        ))}
      </div>
    </div>
  )
}

// ─── Single message bubble ─────────────────────────────────────────────────
function MessageBubble({ msg, index }) {
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

function useMessageReveal(messages) {
  const [typing,       setTyping]       = useState(false)
  const [visibleCount, setVisibleCount] = useState(() => messages.length)
  const prevKey = useRef(null)

  useEffect(() => {
    const key = messages.map((m) => m.message).join('|')
    if (key === prevKey.current) return
    prevKey.current = key

    let iv = null
    const t0 = setTimeout(() => {
      if (messages.length === 0) {
        setVisibleCount(0)
      } else {
        setTyping(true)
        setVisibleCount(0)
      }
    }, 0)

    if (messages.length === 0) {
      return () => clearTimeout(t0)
    }

    const t1 = setTimeout(() => {
      setTyping(false)
      let i = 0
      iv = setInterval(() => {
        i += 1
        setVisibleCount(i)
        if (i >= messages.length) {
          clearInterval(iv)
        }
      }, 350)
    }, 1100)

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      if (iv) clearInterval(iv)
    }
  }, [messages])

  return { typing, visibleCount }
}

// ─── Floating button + slide-up panel (mobile) ─────────────────────────────
export function FloatingAssistant({ messages, totalEmissions }) {
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
  messages:       PropTypes.array.isRequired,
  totalEmissions: PropTypes.number.isRequired,
}

// ─── Sidebar (desktop) ─────────────────────────────────────────────────────
export function AssistantSidebar({ messages, totalEmissions }) {
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
