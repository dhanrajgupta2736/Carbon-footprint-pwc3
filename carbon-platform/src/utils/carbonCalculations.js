/**
 * @fileoverview Carbon footprint calculation engine.
 * All functions are pure (no side effects) and fully unit-tested.
 *
 * Emission factors sourced from:
 *  - IPCC AR6 Working Group III (2022) — transport lifecycle
 *  - UK DEFRA GHG Conversion Factors 2023 — electricity
 *  - FAO GLEAM 2.0 — dietary footprints
 *  - Our World in Data — per-capita averages
 */

import {
  VEHICLE_EMISSION_FACTORS,
  HEATING_EMISSION_FACTORS,
  DIET_EMISSION_FACTORS,
  WASTE_EMISSION_FACTORS,
  AVIATION_FACTOR,
  BENCHMARKS,
} from '../constants/emissions.js'

// ─── Helpers ───────────────────────────────────────────────────────────────
const round  = (n, dp = 3) => Math.round(n * 10 ** dp) / 10 ** dp
const clamp  = (n, min, max) => Math.min(Math.max(n, min), max)

// ─── Core calculators ──────────────────────────────────────────────────────

export function calcTransportEmissions({ dailyKm, vehicleType, flightsPerYear, flightHours }) {
  const km    = clamp(+dailyKm        || 0, 0, 2000)
  const trips = clamp(+flightsPerYear || 0, 0, 365)
  const hours = clamp(+flightHours    || 0, 0, 24)
  const factor   = VEHICLE_EMISSION_FACTORS[vehicleType] ?? VEHICLE_EMISSION_FACTORS.petrol
  const flightKm = hours * 800
  const commute  = (km * factor * 365) / 1000
  const flights  = (trips * flightKm * AVIATION_FACTOR) / 1000
  return round(commute + flights)
}

export function calcHomeEmissions({ monthlyKwh, heatingSource, numPeople }) {
  const kwh    = clamp(+monthlyKwh || 0, 0, 50000)
  const people = clamp(+numPeople  || 1, 1, 20)
  const factor = HEATING_EMISSION_FACTORS[heatingSource] ?? HEATING_EMISSION_FACTORS.electric
  return round((kwh * factor * 12) / people / 1000)
}

export function calcLifestyleEmissions({ dietType, recyclingHabit }) {
  const diet  = DIET_EMISSION_FACTORS[dietType]        ?? DIET_EMISSION_FACTORS.omnivore
  const waste = WASTE_EMISSION_FACTORS[recyclingHabit] ?? WASTE_EMISSION_FACTORS.some
  return round(diet + waste)
}

export function calcTotalEmissions(transport, home, lifestyle) {
  return round(transport + home + lifestyle)
}

export function getBreakdown(transport, home, lifestyle) {
  const total = calcTotalEmissions(transport, home, lifestyle)
  if (total === 0) return { transport: 0, home: 0, lifestyle: 0 }
  return {
    transport: round((transport / total) * 100, 1),
    home:      round((home      / total) * 100, 1),
    lifestyle: round((lifestyle / total) * 100, 1),
  }
}

export function compareToAverage(total) {
  const pctDiff = (val, ref) => round(((val - ref) / ref) * 100, 1)
  return {
    vsGlobal: pctDiff(total, BENCHMARKS.global),
    vsIndia:  pctDiff(total, BENCHMARKS.india),
    vsTarget: round(total - BENCHMARKS.parisTarget),
  }
}

// ─── Eco-action plan generator ─────────────────────────────────────────────

export function generateActionPlan(tData, hData, lData, emissions) {
  const { transport, home } = emissions
  const actions = []

  if (tData.vehicleType === 'petrol' || tData.vehicleType === 'diesel') {
    actions.push({
      id: 'ev-switch', category: 'transport', icon: '⚡', effort: 'high', tag: 'Big Change',
      title: 'Switch to an EV or Hybrid',
      description: 'Switching to an electric vehicle can cut your transport CO2 by up to 70%. Many Indian states offer purchase subsidies under the FAME-II scheme.',
      impact: round(transport * 0.65),
    })
  }

  const isHighKm = (+tData.dailyKm || 0) > 15
  if (isHighKm && !['transit', 'bikewalk'].includes(tData.vehicleType)) {
    actions.push({
      id: 'carpool', category: 'transport', icon: '🚌', effort: 'medium', tag: 'Easy Win',
      title: 'Carpool or Switch to Public Transit',
      description: `You drive ${tData.dailyKm} km daily. Sharing rides or using transit 3 days/week could cut your commute emissions by ~25%.`,
      impact: round(transport * 0.25),
    })
  }

  if ((+tData.flightsPerYear || 0) > 2) {
    const flightImpact = round(tData.flightsPerYear * (tData.flightHours * 800) * AVIATION_FACTOR * 0.5 / 1000)
    actions.push({
      id: 'flight-offset', category: 'transport', icon: '✈️', effort: 'low', tag: 'Quick Action',
      title: 'Offset Your Flights',
      description: `Your ${tData.flightsPerYear} flights/year are a significant source. Purchase Gold Standard carbon credits to offset their impact immediately.`,
      impact: round(Math.max(flightImpact, 0.05)),
    })
  }

  if ((+tData.dailyKm || 0) <= 10 && !['bikewalk'].includes(tData.vehicleType)) {
    actions.push({
      id: 'cycle', category: 'transport', icon: '🚲', effort: 'low', tag: 'Easy Win',
      title: 'Cycle Short Distances',
      description: 'For trips under 5 km, cycling is zero-emission and faster in traffic.',
      impact: round(transport * 0.20),
    })
  }

  if (hData.heatingSource === 'gas') {
    actions.push({
      id: 'solar', category: 'home', icon: '☀️', effort: 'high', tag: 'Big Change',
      title: 'Install Solar Panels or Switch to Green Tariff',
      description: 'Moving to solar energy or a 100% renewable electricity tariff eliminates most home energy emissions. MNRE subsidies available in India.',
      impact: round(home * 0.8),
    })
  }

  if ((+hData.monthlyKwh || 0) > 200) {
    actions.push({
      id: 'led', category: 'home', icon: '💡', effort: 'low', tag: 'Quick Action',
      title: 'Replace Bulbs with LED',
      description: 'Replacing 10 incandescent bulbs with LEDs saves ~450 kWh/year and pays back in under 6 months.',
      impact: 0.10,
    })
    actions.push({
      id: 'smart-thermostat', category: 'home', icon: '🌡️', effort: 'medium', tag: 'Smart Upgrade',
      title: 'Use a Smart AC / Thermostat',
      description: 'Smart thermostats cut heating and cooling energy by 10-15%. Set AC to 24°C — each degree saves ~6% energy.',
      impact: round(home * 0.13),
    })
  }

  actions.push({
    id: 'standby', category: 'home', icon: '🔌', effort: 'low', tag: 'Easy Win',
    title: 'Unplug Idle Appliances',
    description: 'Standby power accounts for up to 10% of home electricity. Use smart power strips or unplug chargers when not in use.',
    impact: round(home * 0.08),
  })

  if (['omnivore', 'meatheavy'].includes(lData.dietType)) {
    actions.push({
      id: 'meatless-monday', category: 'lifestyle', icon: '🥗', effort: 'low', tag: 'Easy Win',
      title: 'Meatless Mondays',
      description: 'Eliminating meat one day per week reduces your annual diet footprint by ~14%. Start with one day and build from there.',
      impact: round(DIET_EMISSION_FACTORS[lData.dietType] * 0.14),
    })
  }

  if (lData.dietType === 'meatheavy') {
    actions.push({
      id: 'reduce-beef', category: 'lifestyle', icon: '🐄', effort: 'medium', tag: 'High Impact',
      title: 'Reduce Beef Consumption',
      description: 'Beef produces 20× more CO2 than vegetables per kg. Swapping beef for chicken, fish, or legumes halves meat emissions.',
      impact: 0.80,
    })
  }

  if (['none', 'some'].includes(lData.recyclingHabit)) {
    actions.push({
      id: 'compost', category: 'lifestyle', icon: '♻️', effort: 'low', tag: 'Quick Action',
      title: 'Start Composting & Recycling',
      description: 'Composting diverts food waste from landfill, reducing methane. Recycling paper/plastic/glass saves the energy of raw production.',
      impact: 0.35,
    })
  }

  actions.push({
    id: 'local-produce', category: 'lifestyle', icon: '🛒', effort: 'low', tag: 'Easy Win',
    title: 'Buy Local & Seasonal Produce',
    description: 'Food transport accounts for ~6% of food emissions. Local markets and seasonal eating reduce this significantly.',
    impact: 0.18,
  })

  return actions.filter((a) => a.impact > 0).sort((a, b) => b.impact - a.impact)
}

// ─── Assistant insight generator ───────────────────────────────────────────

export function generateAssistantInsights(tEmit, hEmit, lEmit, tData, hData, lData) {
  const total = calcTotalEmissions(tEmit, hEmit, lEmit)

  if (total === 0) {
    return [{
      type: 'welcome',
      message: "👋 Hi! I'm your Eco-Assistant. Fill in the calculator tabs and I'll give you personalised carbon insights in real time!",
    }]
  }

  const msgs = []
  const { vsGlobal } = compareToAverage(total)

  if (vsGlobal <= -20) {
    msgs.push({ type: 'positive', message: `🌟 Impressive! Your footprint of ${total}t CO2e/yr is ${Math.abs(vsGlobal)}% below the global average. You're genuinely making a difference.` })
  } else if (vsGlobal >= 20) {
    msgs.push({ type: 'alert',   message: `⚠️ Your footprint of ${total}t CO2e/yr is ${vsGlobal}% above the global average of 4.7t. Targeted changes can cut this significantly.` })
  } else {
    msgs.push({ type: 'neutral', message: `📊 Your total footprint is ${total}t CO2e/yr — near the global average of 4.7t. There is meaningful room to improve!` })
  }

  const biggestEmit = Math.max(tEmit, hEmit, lEmit)
  if (biggestEmit === tEmit && tEmit > 0.5) {
    if (['petrol','diesel'].includes(tData.vehicleType)) {
      msgs.push({ type: 'tip', message: `🚗 Transport is your largest emitter (${tEmit}t). Switching to an EV alone could cut your total footprint by ~${round(tEmit * 0.65, 2)}t.` })
    } else if ((+tData.flightsPerYear || 0) > 2) {
      msgs.push({ type: 'tip', message: `✈️ Your ${tData.flightsPerYear} flights/year are a key driver. Offsetting via Gold Standard credits is the fastest fix.` })
    }
  }

  if (biggestEmit === hEmit && hEmit > 0.3) {
    const suggestion = hData.heatingSource === 'gas' ? 'exploring a solar or green electricity tariff' : 'reducing standby power and switching to LED lighting'
    msgs.push({ type: 'tip', message: `🏠 Home energy is your top emitter (${hEmit}t). Consider ${suggestion}.` })
  }

  if (biggestEmit === lEmit && ['omnivore','meatheavy'].includes(lData.dietType)) {
    msgs.push({ type: 'tip', message: `🥩 Your diet is a large factor. Even 2 meat-free days per week could save ~0.5t CO2e/year.` })
  }

  msgs.push({ type: 'info', message: `🇮🇳 India's average is 1.9t CO2e/yr. The Paris target is 2.0t — you are currently ${total <= 2 ? 'already at or below' : round(total - 2.0, 2) + 't above'} that target.` })

  if (lData.recyclingHabit === 'all') {
    msgs.push({ type: 'positive', message: `♻️ Excellent recycling habits! Composting and full recycling save an estimated 0.7t CO2e/yr vs. landfilling.` })
  }

  return msgs
}
