/**
 * @fileoverview Unit tests for the carbon calculation engine.
 * Tests all pure functions with boundary conditions, edge cases,
 * invalid inputs, and known-good emission scenarios.
 */

import { describe, it, expect } from 'vitest'
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

// ─── calcTransportEmissions ────────────────────────────────────────────────

describe('calcTransportEmissions', () => {
  it('returns 0 for bike/walk with no flights', () => {
    expect(calcTransportEmissions({ dailyKm: 20, vehicleType: 'bikewalk', flightsPerYear: 0, flightHours: 0 })).toBe(0)
  })

  it('returns 0 for all-zero inputs', () => {
    expect(calcTransportEmissions({ dailyKm: 0, vehicleType: 'petrol', flightsPerYear: 0, flightHours: 0 })).toBe(0)
  })

  it('calculates petrol commute correctly', () => {
    // 20 km/day * 0.171 kg/km * 365 days / 1000 = 1.249 t
    const result = calcTransportEmissions({ dailyKm: 20, vehicleType: 'petrol', flightsPerYear: 0, flightHours: 0 })
    expect(result).toBeCloseTo(1.249, 2)
  })

  it('electric vehicle emits less than petrol for same distance', () => {
    const petrol   = calcTransportEmissions({ dailyKm: 30, vehicleType: 'petrol',   flightsPerYear: 0, flightHours: 0 })
    const electric = calcTransportEmissions({ dailyKm: 30, vehicleType: 'electric', flightsPerYear: 0, flightHours: 0 })
    expect(electric).toBeLessThan(petrol)
  })

  it('transit emits less than diesel for same distance', () => {
    const diesel  = calcTransportEmissions({ dailyKm: 15, vehicleType: 'diesel',  flightsPerYear: 0, flightHours: 0 })
    const transit = calcTransportEmissions({ dailyKm: 15, vehicleType: 'transit', flightsPerYear: 0, flightHours: 0 })
    expect(transit).toBeLessThan(diesel)
  })

  it('includes flight emissions in total', () => {
    const withFlights    = calcTransportEmissions({ dailyKm: 0, vehicleType: 'bikewalk', flightsPerYear: 4, flightHours: 3 })
    const withoutFlights = calcTransportEmissions({ dailyKm: 0, vehicleType: 'bikewalk', flightsPerYear: 0, flightHours: 0 })
    expect(withFlights).toBeGreaterThan(withoutFlights)
  })

  it('handles string numeric inputs gracefully (from form state)', () => {
    const result = calcTransportEmissions({ dailyKm: '20', vehicleType: 'petrol', flightsPerYear: '0', flightHours: '0' })
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThan(0)
  })

  it('clamps negative dailyKm to 0', () => {
    const result = calcTransportEmissions({ dailyKm: -10, vehicleType: 'petrol', flightsPerYear: 0, flightHours: 0 })
    expect(result).toBe(0)
  })

  it('clamps excessive dailyKm to 2000', () => {
    const capped   = calcTransportEmissions({ dailyKm: 99999, vehicleType: 'petrol', flightsPerYear: 0, flightHours: 0 })
    const maxLegal = calcTransportEmissions({ dailyKm: 2000,  vehicleType: 'petrol', flightsPerYear: 0, flightHours: 0 })
    expect(capped).toBe(maxLegal)
  })

  it('falls back to petrol factor for unknown vehicleType', () => {
    const known   = calcTransportEmissions({ dailyKm: 10, vehicleType: 'petrol',  flightsPerYear: 0, flightHours: 0 })
    const unknown = calcTransportEmissions({ dailyKm: 10, vehicleType: 'unicorn', flightsPerYear: 0, flightHours: 0 })
    expect(unknown).toBe(known)
  })

  it('result is always a finite non-negative number', () => {
    const result = calcTransportEmissions({ dailyKm: 50, vehicleType: 'hybrid', flightsPerYear: 2, flightHours: 5 })
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBeGreaterThanOrEqual(0)
  })
})

// ─── calcHomeEmissions ─────────────────────────────────────────────────────

describe('calcHomeEmissions', () => {
  it('returns 0 for zero kWh', () => {
    expect(calcHomeEmissions({ monthlyKwh: 0, heatingSource: 'electric', numPeople: 1 })).toBe(0)
  })

  it('solar emits less than gas for same kWh', () => {
    const gas   = calcHomeEmissions({ monthlyKwh: 300, heatingSource: 'gas',   numPeople: 1 })
    const solar = calcHomeEmissions({ monthlyKwh: 300, heatingSource: 'solar', numPeople: 1 })
    expect(solar).toBeLessThan(gas)
  })

  it('larger household size reduces per-capita emissions', () => {
    const one  = calcHomeEmissions({ monthlyKwh: 400, heatingSource: 'electric', numPeople: 1 })
    const four = calcHomeEmissions({ monthlyKwh: 400, heatingSource: 'electric', numPeople: 4 })
    expect(four).toBeLessThan(one)
    expect(one / four).toBeCloseTo(4, 0)
  })

  it('clamps numPeople to minimum of 1 to avoid division by zero', () => {
    const result = calcHomeEmissions({ monthlyKwh: 200, heatingSource: 'electric', numPeople: 0 })
    expect(Number.isFinite(result)).toBe(true)
  })

  it('clamps numPeople to minimum of 1 for negative values', () => {
    const withNeg = calcHomeEmissions({ monthlyKwh: 200, heatingSource: 'electric', numPeople: -5 })
    const withOne = calcHomeEmissions({ monthlyKwh: 200, heatingSource: 'electric', numPeople: 1  })
    expect(withNeg).toBe(withOne)
  })

  it('result is always finite and non-negative', () => {
    const result = calcHomeEmissions({ monthlyKwh: 350, heatingSource: 'gas', numPeople: 3 })
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBeGreaterThanOrEqual(0)
  })
})

// ─── calcLifestyleEmissions ────────────────────────────────────────────────

describe('calcLifestyleEmissions', () => {
  it('vegan with full recycling has lowest footprint', () => {
    const low  = calcLifestyleEmissions({ dietType: 'vegan',     recyclingHabit: 'all' })
    const high = calcLifestyleEmissions({ dietType: 'meatheavy', recyclingHabit: 'none' })
    expect(low).toBeLessThan(high)
  })

  it('meat-heavy diet emits more than vegan', () => {
    const vegan = calcLifestyleEmissions({ dietType: 'vegan',     recyclingHabit: 'some' })
    const meat  = calcLifestyleEmissions({ dietType: 'meatheavy', recyclingHabit: 'some' })
    expect(meat).toBeGreaterThan(vegan)
  })

  it('recycling all reduces emissions vs recycling none', () => {
    const withRecycle    = calcLifestyleEmissions({ dietType: 'omnivore', recyclingHabit: 'all'  })
    const withoutRecycle = calcLifestyleEmissions({ dietType: 'omnivore', recyclingHabit: 'none' })
    expect(withRecycle).toBeLessThan(withoutRecycle)
  })

  it('falls back to omnivore for unknown diet type', () => {
    const known   = calcLifestyleEmissions({ dietType: 'omnivore', recyclingHabit: 'some' })
    const unknown = calcLifestyleEmissions({ dietType: 'carnivore-supreme', recyclingHabit: 'some' })
    expect(unknown).toBe(known)
  })

  it('result is always finite and positive', () => {
    const result = calcLifestyleEmissions({ dietType: 'vegan', recyclingHabit: 'all' })
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBeGreaterThan(0)
  })
})

// ─── calcTotalEmissions ────────────────────────────────────────────────────

describe('calcTotalEmissions', () => {
  it('sums three categories correctly', () => {
    expect(calcTotalEmissions(1.5, 0.8, 2.2)).toBeCloseTo(4.5, 2)
  })

  it('returns 0 when all inputs are 0', () => {
    expect(calcTotalEmissions(0, 0, 0)).toBe(0)
  })

  it('result is rounded to 3 decimal places', () => {
    const result = calcTotalEmissions(1.1111, 2.2222, 3.3333)
    const decimals = result.toString().split('.')[1]?.length ?? 0
    expect(decimals).toBeLessThanOrEqual(3)
  })
})

// ─── getBreakdown ──────────────────────────────────────────────────────────

describe('getBreakdown', () => {
  it('returns all zeros when total is 0', () => {
    const result = getBreakdown(0, 0, 0)
    expect(result).toEqual({ transport: 0, home: 0, lifestyle: 0 })
  })

  it('percentages sum to approximately 100', () => {
    const { transport, home, lifestyle } = getBreakdown(2, 1, 3)
    expect(transport + home + lifestyle).toBeCloseTo(100, 0)
  })

  it('equal categories each have ~33.3%', () => {
    const { transport, home, lifestyle } = getBreakdown(1, 1, 1)
    expect(transport).toBeCloseTo(33.3, 0)
    expect(home).toBeCloseTo(33.3, 0)
    expect(lifestyle).toBeCloseTo(33.3, 0)
  })

  it('dominant category has highest percentage', () => {
    const { transport, home, lifestyle } = getBreakdown(5, 1, 1)
    expect(transport).toBeGreaterThan(home)
    expect(transport).toBeGreaterThan(lifestyle)
  })
})

// ─── compareToAverage ─────────────────────────────────────────────────────

describe('compareToAverage', () => {
  it('returns 0% difference for exactly global average (4.7t)', () => {
    const { vsGlobal } = compareToAverage(4.7)
    expect(vsGlobal).toBe(0)
  })

  it('returns negative vsGlobal when below average', () => {
    const { vsGlobal } = compareToAverage(2)
    expect(vsGlobal).toBeLessThan(0)
  })

  it('returns positive vsGlobal when above average', () => {
    const { vsGlobal } = compareToAverage(8)
    expect(vsGlobal).toBeGreaterThan(0)
  })

  it('vsTarget is negative when below Paris target (2.0t)', () => {
    const { vsTarget } = compareToAverage(1.5)
    expect(vsTarget).toBeLessThan(0)
  })

  it('vsTarget is positive when above Paris target', () => {
    const { vsTarget } = compareToAverage(3.0)
    expect(vsTarget).toBeGreaterThan(0)
  })

  it('all returned values are finite numbers', () => {
    const result = compareToAverage(5.2)
    expect(Number.isFinite(result.vsGlobal)).toBe(true)
    expect(Number.isFinite(result.vsIndia)).toBe(true)
    expect(Number.isFinite(result.vsTarget)).toBe(true)
  })
})

// ─── generateActionPlan ────────────────────────────────────────────────────

describe('generateActionPlan', () => {
  const baseTransport  = { dailyKm: 30, vehicleType: 'petrol',   flightsPerYear: 3, flightHours: 4 }
  const baseHome       = { monthlyKwh: 350, heatingSource: 'gas',      numPeople: 2 }
  const baseLifestyle  = { dietType: 'meatheavy', recyclingHabit: 'none' }
  const baseEmissions  = { transport: 3.0, home: 1.5, lifestyle: 5.3 }

  it('returns a non-empty array for high-emission profile', () => {
    const actions = generateActionPlan(baseTransport, baseHome, baseLifestyle, baseEmissions)
    expect(actions.length).toBeGreaterThan(0)
  })

  it('actions are sorted by impact descending', () => {
    const actions = generateActionPlan(baseTransport, baseHome, baseLifestyle, baseEmissions)
    for (let i = 0; i < actions.length - 1; i++) {
      expect(actions[i].impact).toBeGreaterThanOrEqual(actions[i + 1].impact)
    }
  })

  it('all action impacts are positive numbers', () => {
    const actions = generateActionPlan(baseTransport, baseHome, baseLifestyle, baseEmissions)
    actions.forEach(a => {
      expect(a.impact).toBeGreaterThan(0)
      expect(Number.isFinite(a.impact)).toBe(true)
    })
  })

  it('each action has required fields', () => {
    const actions = generateActionPlan(baseTransport, baseHome, baseLifestyle, baseEmissions)
    actions.forEach(a => {
      expect(typeof a.id).toBe('string')
      expect(typeof a.title).toBe('string')
      expect(typeof a.description).toBe('string')
      expect(['transport', 'home', 'lifestyle']).toContain(a.category)
      expect(['low', 'medium', 'high']).toContain(a.effort)
    })
  })

  it('no duplicate action IDs', () => {
    const actions = generateActionPlan(baseTransport, baseHome, baseLifestyle, baseEmissions)
    const ids = actions.map(a => a.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('EV switch appears for petrol vehicle', () => {
    const actions = generateActionPlan(baseTransport, baseHome, baseLifestyle, baseEmissions)
    expect(actions.some(a => a.id === 'ev-switch')).toBe(true)
  })

  it('EV switch does NOT appear for electric vehicle', () => {
    const evTransport = { ...baseTransport, vehicleType: 'electric' }
    const actions = generateActionPlan(evTransport, baseHome, baseLifestyle, { ...baseEmissions, transport: 0.5 })
    expect(actions.some(a => a.id === 'ev-switch')).toBe(false)
  })

  it('meatless monday appears for meat-heavy diet', () => {
    const actions = generateActionPlan(baseTransport, baseHome, baseLifestyle, baseEmissions)
    expect(actions.some(a => a.id === 'meatless-monday')).toBe(true)
  })

  it('meatless monday does NOT appear for vegan', () => {
    const veganLifestyle = { dietType: 'vegan', recyclingHabit: 'all' }
    const actions = generateActionPlan(baseTransport, baseHome, veganLifestyle, { ...baseEmissions, lifestyle: 1.64 })
    expect(actions.some(a => a.id === 'meatless-monday')).toBe(false)
  })

  it('solar action appears for gas heating', () => {
    const actions = generateActionPlan(baseTransport, baseHome, baseLifestyle, baseEmissions)
    expect(actions.some(a => a.id === 'solar')).toBe(true)
  })

  it('solar action does NOT appear for solar heating', () => {
    const solarHome = { ...baseHome, heatingSource: 'solar' }
    const actions = generateActionPlan(baseTransport, solarHome, baseLifestyle, baseEmissions)
    expect(actions.some(a => a.id === 'solar')).toBe(false)
  })
})

// ─── generateAssistantInsights ─────────────────────────────────────────────

describe('generateAssistantInsights', () => {
  const defaults = {
    t: { dailyKm: 20, vehicleType: 'petrol', flightsPerYear: 0, flightHours: 0 },
    h: { monthlyKwh: 200, heatingSource: 'electric', numPeople: 2 },
    l: { dietType: 'omnivore', recyclingHabit: 'some' },
  }

  it('returns welcome message when all emissions are 0', () => {
    const msgs = generateAssistantInsights(0, 0, 0, defaults.t, defaults.h, defaults.l)
    expect(msgs).toHaveLength(1)
    expect(msgs[0].type).toBe('welcome')
  })

  it('returns alert message for high emitters', () => {
    const msgs = generateAssistantInsights(5, 3, 5, defaults.t, defaults.h, defaults.l)
    expect(msgs.some(m => m.type === 'alert')).toBe(true)
  })

  it('returns positive message for low emitters', () => {
    const lowT = { dailyKm: 0, vehicleType: 'bikewalk', flightsPerYear: 0, flightHours: 0 }
    const msgs = generateAssistantInsights(0, 0.2, 1.64, lowT, defaults.h, { dietType: 'vegan', recyclingHabit: 'all' })
    expect(msgs.some(m => m.type === 'positive')).toBe(true)
  })

  it('all messages have type and message string', () => {
    const msgs = generateAssistantInsights(2, 1, 3, defaults.t, defaults.h, defaults.l)
    msgs.forEach(m => {
      expect(typeof m.type).toBe('string')
      expect(typeof m.message).toBe('string')
      expect(m.message.length).toBeGreaterThan(10)
    })
  })

  it('returns more than one message for real data', () => {
    const msgs = generateAssistantInsights(2, 1, 3.86, defaults.t, defaults.h, defaults.l)
    expect(msgs.length).toBeGreaterThan(1)
  })
})
