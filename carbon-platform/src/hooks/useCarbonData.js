/**
 * @fileoverview Central state management hook for CarbonWise.
 * Manages calculator inputs, derived emissions, persistence, and analytics.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  calcTransportEmissions,
  calcHomeEmissions,
  calcLifestyleEmissions,
  calcTotalEmissions,
  getBreakdown,
  compareToAverage,
  generateActionPlan,
  generateAssistantInsights,
} from '../utils/carbonCalculations.js'
import { saveState, loadState, clearState } from '../services/storage.js'
import { trackEvent, trackActionToggled } from '../services/analytics.js'

// ─── Default form values ───────────────────────────────────────────────────

const DEFAULT_TRANSPORT = Object.freeze({ dailyKm: '', vehicleType: 'petrol',   flightsPerYear: '', flightHours: '' })
const DEFAULT_HOME      = Object.freeze({ monthlyKwh: '', heatingSource: 'electric', numPeople: '' })
const DEFAULT_LIFESTYLE = Object.freeze({ dietType: 'omnivore', recyclingHabit: 'some' })

// ─── Numeric normaliser (converts empty string to 0 for math) ─────────────

function toNum(val, fallback = 0) {
  const n = Number(val)
  return Number.isFinite(n) ? n : fallback
}

/**
 * Central data hook — single source of truth for all calculator state.
 * @returns {object} Full calculator state + action dispatchers
 */
export function useCarbonData() {
  // ── Form state ────────────────────────────────────────────────────────────
  // ── Form state (lazy initialisation from storage) ─────────────────────────
  const [transportData, setTransportData] = useState(() => {
    const saved = loadState()
    return saved ? saved.transport : DEFAULT_TRANSPORT
  })
  const [homeData, setHomeData] = useState(() => {
    const saved = loadState()
    return saved ? saved.home : DEFAULT_HOME
  })
  const [lifestyleData, setLifestyleData] = useState(() => {
    const saved = loadState()
    return saved ? saved.lifestyle : DEFAULT_LIFESTYLE
  })
  const [completedActions, setCompletedActions] = useState(() => {
    const saved = loadState()
    return saved ? new Set(saved.completedActions) : new Set()
  })
  const [hydrated, setHydrated] = useState(false)

  // ── Mark hydration complete on mount ─────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setHydrated(true), 0)
    return () => clearTimeout(t)
  }, [])

  // ── Persist on every change (debounced via useEffect dependency array) ───
  useEffect(() => {
    if (!hydrated) return
    saveState({
      transport:        transportData,
      home:             homeData,
      lifestyle:        lifestyleData,
      completedActions: Array.from(completedActions),
    })
  }, [transportData, homeData, lifestyleData, completedActions, hydrated])

  // ── Derived numeric inputs (normalised for math) ──────────────────────────
  const tNorm = useMemo(() => ({
    ...transportData,
    dailyKm:        toNum(transportData.dailyKm),
    flightsPerYear: toNum(transportData.flightsPerYear),
    flightHours:    toNum(transportData.flightHours),
  }), [transportData])

  const hNorm = useMemo(() => ({
    ...homeData,
    monthlyKwh: toNum(homeData.monthlyKwh),
    numPeople:  toNum(homeData.numPeople, 1),
  }), [homeData])

  // ── Derived emissions (memoised) ─────────────────────────────────────────
  const transportEmissions = useMemo(() => calcTransportEmissions(tNorm), [tNorm])
  const homeEmissions      = useMemo(() => calcHomeEmissions(hNorm),      [hNorm])
  const lifestyleEmissions = useMemo(() => calcLifestyleEmissions(lifestyleData), [lifestyleData])
  const totalEmissions     = useMemo(() => calcTotalEmissions(transportEmissions, homeEmissions, lifestyleEmissions), [transportEmissions, homeEmissions, lifestyleEmissions])
  const breakdown          = useMemo(() => getBreakdown(transportEmissions, homeEmissions, lifestyleEmissions),      [transportEmissions, homeEmissions, lifestyleEmissions])
  const comparison         = useMemo(() => compareToAverage(totalEmissions),                                        [totalEmissions])

  // ── Has the user entered any meaningful data? ─────────────────────────────
  const hasData = useMemo(() =>
    toNum(transportData.dailyKm) > 0 ||
    toNum(homeData.monthlyKwh)   > 0 ||
    lifestyleData.dietType      !== DEFAULT_LIFESTYLE.dietType ||
    lifestyleData.recyclingHabit !== DEFAULT_LIFESTYLE.recyclingHabit,
    [transportData, homeData, lifestyleData]
  )

  // ── Action plan (memoised) ────────────────────────────────────────────────
  const allActions = useMemo(() => generateActionPlan(
    tNorm, hNorm, lifestyleData,
    { transport: transportEmissions, home: homeEmissions, lifestyle: lifestyleEmissions }
  ), [tNorm, hNorm, lifestyleData, transportEmissions, homeEmissions, lifestyleEmissions])

  // ── Projected CO2 reduction from checked-off actions ─────────────────────
  const projectedReduction = useMemo(() =>
    Array.from(completedActions).reduce((sum, id) => {
      const action = allActions.find(a => a.id === id)
      return sum + (action?.impact ?? 0)
    }, 0),
    [completedActions, allActions]
  )

  // ── Assistant messages (memoised) ────────────────────────────────────────
  const assistantMessages = useMemo(() =>
    generateAssistantInsights(
      transportEmissions, homeEmissions, lifestyleEmissions,
      tNorm, hNorm, lifestyleData
    ),
    [transportEmissions, homeEmissions, lifestyleEmissions, tNorm, hNorm, lifestyleData]
  )

  // ── Action dispatchers ────────────────────────────────────────────────────

  const toggleAction = useCallback((id) => {
    setCompletedActions(prev => {
      const next = new Set(prev)
      const nowCompleted = !next.has(id)
      nowCompleted ? next.add(id) : next.delete(id)
      trackActionToggled(id, nowCompleted)
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    setTransportData(DEFAULT_TRANSPORT)
    setHomeData(DEFAULT_HOME)
    setLifestyleData(DEFAULT_LIFESTYLE)
    setCompletedActions(new Set())
    clearState()
    trackEvent('calculator_reset')
  }, [])

  return {
    // Form state
    transportData, setTransportData,
    homeData,      setHomeData,
    lifestyleData, setLifestyleData,
    // Derived emissions
    transportEmissions, homeEmissions, lifestyleEmissions,
    totalEmissions, breakdown, comparison,
    // UI helpers
    hasData, hydrated,
    // Action plan
    allActions, completedActions, toggleAction, projectedReduction,
    // Assistant
    assistantMessages,
    // Reset
    resetAll,
  }
}
