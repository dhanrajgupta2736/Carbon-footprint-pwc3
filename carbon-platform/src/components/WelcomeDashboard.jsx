/**
 * @fileoverview Welcome / empty-state dashboard.
 * Shown before the user starts entering data.
 */

import PropTypes from 'prop-types'
import { ArrowRight, Leaf, BarChart2, Zap, ShieldCheck } from 'lucide-react'

const STEPS = [
  { step: '01', icon: '🚗', title: 'Transport',   desc: 'Daily commute, vehicle type, and flights.',           color: 'from-eco-500 to-eco-600',   light: 'bg-eco-50 border-eco-200'     },
  { step: '02', icon: '🏠', title: 'Home Energy', desc: 'Electricity usage, heating source, household size.', color: 'from-teal-500 to-teal-600', light: 'bg-teal-50 border-teal-200'   },
  { step: '03', icon: '🥗', title: 'Lifestyle',   desc: 'Diet type and recycling habits.',                    color: 'from-amber-500 to-amber-600', light: 'bg-amber-50 border-amber-200' },
]

const FACTS = [
  { icon: '🌍', stat: '4.7t',  label: 'Global avg CO2e/person/year' },
  { icon: '🎯', stat: '2.0t',  label: 'Paris Agreement per-capita target' },
  { icon: '🌱', stat: '21kg',  label: 'CO2 absorbed by one tree/year' },
]

const FEATURES = [
  { icon: <Leaf        size={13} aria-hidden="true" />, text: '100% client-side — your data never leaves your device' },
  { icon: <BarChart2   size={13} aria-hidden="true" />, text: 'Real-time analytics powered by IPCC emission factors'  },
  { icon: <Zap         size={13} aria-hidden="true" />, text: 'Personalised gamified eco-action plan'                 },
  { icon: <ShieldCheck size={13} aria-hidden="true" />, text: 'No account required — works offline (PWA)'            },
]

export default function WelcomeDashboard({ onGetStarted }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-10 animate-fade-in">
      {/* Hero */}
      <div className="text-center max-w-lg mb-10">
        <div
          className="w-20 h-20 eco-gradient rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5
            shadow-lg shadow-eco-500/30 animate-float"
          aria-hidden="true"
        >
          🌿
        </div>
        <h2 className="text-3xl font-bold text-eco-900 mb-3 leading-tight">
          Discover Your<br />
          <span className="text-eco-600">Carbon Footprint</span>
        </h2>
        <p className="text-eco-600 text-base leading-relaxed">
          Answer a few questions about your lifestyle and get a personalised carbon report with
          an actionable eco-plan — in under 2 minutes.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-6 btn-primary inline-flex items-center gap-2 text-base px-8 py-3
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-eco-400 focus-visible:ring-offset-2"
          aria-label="Start calculating your carbon footprint"
        >
          Start Calculating
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Steps */}
      <ol className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 list-none" aria-label="How it works">
        {STEPS.map((s) => (
          <li
            key={s.step}
            className={`rounded-2xl border p-4 ${s.light} transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold bg-gradient-to-br ${s.color} text-white px-2 py-0.5 rounded-full`}
                aria-hidden="true"
              >
                {s.step}
              </span>
              <span aria-hidden="true" className="text-xl">{s.icon}</span>
            </div>
            <h3 className="text-sm font-bold text-eco-800 mb-1">{s.title}</h3>
            <p className="text-xs text-eco-600 leading-relaxed">{s.desc}</p>
          </li>
        ))}
      </ol>

      {/* Stats */}
      <div className="w-full max-w-xl">
        <p className="text-xs text-eco-500 text-center font-semibold uppercase tracking-widest mb-3">
          Did you know?
        </p>
        <ul className="grid grid-cols-3 gap-3 list-none" aria-label="Climate facts">
          {FACTS.map((f) => (
            <li
              key={f.stat}
              className="glass-card rounded-2xl p-3 text-center hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="text-2xl mb-1" aria-hidden="true">{f.icon}</div>
              <div className="text-lg font-bold text-eco-700">{f.stat}</div>
              <div className="text-xs text-eco-500 leading-tight">{f.label}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Feature strip */}
      <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 list-none" aria-label="App features">
        {FEATURES.map((f, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs text-eco-500 font-medium">
            <span className="text-eco-400">{f.icon}</span>
            {f.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

WelcomeDashboard.propTypes = { onGetStarted: PropTypes.func.isRequired }
