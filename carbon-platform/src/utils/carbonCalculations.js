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

export function calcTransportEmissions(data) {
  if (!data || typeof data !== 'object') return 0
  const dailyKm = data.dailyKm
  const vehicleType = data.vehicleType
  const flightsPerYear = data.flightsPerYear
  const flightHours = data.flightHours

  const km    = clamp(+dailyKm        || 0, 0, 2000)
  const trips = clamp(+flightsPerYear || 0, 0, 365)
  const hours = clamp(+flightHours    || 0, 0, 24)
  const factor   = VEHICLE_EMISSION_FACTORS[vehicleType] ?? VEHICLE_EMISSION_FACTORS.petrol
  const flightKm = hours * 800
  const commute  = (km * factor * 365) / 1000
  const flights  = (trips * flightKm * AVIATION_FACTOR) / 1000
  return round(commute + flights)
}

export function calcHomeEmissions(data) {
  if (!data || typeof data !== 'object') return 0
  const monthlyKwh = data.monthlyKwh
  const heatingSource = data.heatingSource
  const numPeople = data.numPeople

  const kwh    = clamp(+monthlyKwh || 0, 0, 50000)
  const people = clamp(+numPeople  || 1, 1, 20)
  const factor = HEATING_EMISSION_FACTORS[heatingSource] ?? HEATING_EMISSION_FACTORS.electric
  return round((kwh * factor * 12) / people / 1000)
}

export function calcLifestyleEmissions(data) {
  if (!data || typeof data !== 'object') return 0
  const dietType = data.dietType
  const recyclingHabit = data.recyclingHabit

  const diet  = DIET_EMISSION_FACTORS[dietType]        ?? DIET_EMISSION_FACTORS.omnivore
  const waste = WASTE_EMISSION_FACTORS[recyclingHabit] ?? WASTE_EMISSION_FACTORS.some
  return round(diet + waste)
}

export function calcTotalEmissions(transport, home, lifestyle) {
  const t = Number(transport) || 0
  const h = Number(home) || 0
  const l = Number(lifestyle) || 0
  return round(t + h + l)
}

export function getBreakdown(transport, home, lifestyle) {
  const t = Number(transport) || 0
  const h = Number(home) || 0
  const l = Number(lifestyle) || 0
  const total = calcTotalEmissions(t, h, l)
  if (total === 0) return { transport: 0, home: 0, lifestyle: 0 }
  return {
    transport: round((t / total) * 100, 1),
    home:      round((h / total) * 100, 1),
    lifestyle: round((l / total) * 100, 1),
  }
}

export function compareToAverage(total) {
  const val = Number(total) || 0
  const pctDiff = (v, ref) => round(((v - ref) / ref) * 100, 1)
  return {
    vsGlobal: pctDiff(val, BENCHMARKS.global),
    vsIndia:  pctDiff(val, BENCHMARKS.india),
    vsTarget: round(val - BENCHMARKS.parisTarget),
  }
}

// ─── Eco-action plan generator ─────────────────────────────────────────────

export function generateActionPlan(tData, hData, lData, emissions) {
  if (!tData || !hData || !lData || !emissions) return []
  const { transport, home } = emissions
  const actions = []

  if (tData.vehicleType === 'petrol' || tData.vehicleType === 'diesel') {
    actions.push({
      id: 'ev-switch', category: 'transport', icon: '⚡', effort: 'high', tag: 'Big Change',
      title: 'Switch to an EV or Hybrid',
      description: 'Switching to an electric vehicle can cut your transport CO2 by up to 70%. Many Indian states offer purchase subsidies under the FAME-II scheme.',
      impact: round((transport || 0) * 0.65),
    })
  }

  const isHighKm = (+tData.dailyKm || 0) > 15
  if (isHighKm && !['transit', 'bikewalk'].includes(tData.vehicleType)) {
    actions.push({
      id: 'carpool', category: 'transport', icon: '🚌', effort: 'medium', tag: 'Easy Win',
      title: 'Carpool or Switch to Public Transit',
      description: `You drive ${tData.dailyKm} km daily. Sharing rides or using transit 3 days/week could cut your commute emissions by ~25%.`,
      impact: round((transport || 0) * 0.25),
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
      impact: round((transport || 0) * 0.20),
    })
  }

  if (hData.heatingSource === 'gas') {
    actions.push({
      id: 'solar', category: 'home', icon: '☀️', effort: 'high', tag: 'Big Change',
      title: 'Install Solar Panels or Switch to Green Tariff',
      description: 'Moving to solar energy or a 100% renewable electricity tariff eliminates most home energy emissions. MNRE subsidies available in India.',
      impact: round((home || 0) * 0.8),
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
      impact: round((home || 0) * 0.13),
    })
  }

  actions.push({
    id: 'standby', category: 'home', icon: '🔌', effort: 'low', tag: 'Easy Win',
    title: 'Unplug Idle Appliances',
    description: 'Standby power accounts for up to 10% of home electricity. Use smart power strips or unplug chargers when not in use.',
    impact: round((home || 0) * 0.08),
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
  const t = Number(tEmit) || 0
  const h = Number(hEmit) || 0
  const l = Number(lEmit) || 0
  const total = calcTotalEmissions(t, h, l)

  if (total === 0 || !tData || !hData || !lData) {
    return [{
      type: 'welcome',
      message: "👋 Hi! I'm your Eco-Assistant. Fill in the calculator tabs and I'll give you personalised carbon insights in real time!",
    }]
  }

  const msgs = []
  const { vsGlobal } = compareToAverage(total)

  // 1. General carbon status overview
  if (vsGlobal <= -20) {
    msgs.push({ type: 'positive', message: `🌟 Impressive! Your footprint of ${total}t CO2e/yr is ${Math.abs(vsGlobal)}% below the global average. You're genuinely making a difference.` })
  } else if (vsGlobal >= 20) {
    msgs.push({ type: 'alert',   message: `⚠️ Your footprint of ${total}t CO2e/yr is ${vsGlobal}% above the global average of 4.7t. Targeted changes can cut this significantly.` })
  } else {
    msgs.push({ type: 'neutral', message: `📊 Your total footprint is ${total}t CO2e/yr — near the global average of 4.7t. There is meaningful room to improve!` })
  }

  // 2. High-precision contextual correlation checks
  const km = +tData.dailyKm || 0
  const flights = +tData.flightsPerYear || 0
  const flightHours = +tData.flightHours || 0
  const kwh = +hData.monthlyKwh || 0
  const people = +hData.numPeople || 1

  // Correlation A: Transport & Diet Double High Impact
  if (km > 20 && ['petrol', 'diesel'].includes(tData.vehicleType) && ['meatheavy', 'omnivore'].includes(lData.dietType)) {
    msgs.push({
      type: 'alert',
      message: `🚗🥩 Double Carbon Driver: Commuting ${km}km daily in a ${tData.vehicleType} vehicle combined with an ${lData.dietType} diet creates a substantial personal footprint. Swapping a single beef meal a week or carpooling two days a week would prevent over 0.5t of CO2 from entering the atmosphere.`
    })
  }

  // Correlation B: Flying & Diet Offsetting Comparison
  if (flights > 2 && ['meatheavy', 'omnivore'].includes(lData.dietType)) {
    const flightEmissions = (flights * (flightHours * 800) * AVIATION_FACTOR) / 1000
    const dietSavings = (DIET_EMISSION_FACTORS[lData.dietType] - DIET_EMISSION_FACTORS.vegan)
    msgs.push({
      type: 'tip',
      message: `✈️🥗 High Altitude & Agriculture: Your flights emit ~${round(flightEmissions, 2)}t CO2e/yr. Shifting to a vegan diet would save ~${round(dietSavings, 2)}t CO2e/yr, offsetting about ${round((dietSavings / (AVIATION_FACTOR * 800)) * 1000, 1)} hours of flight time annually.`
    })
  }

  // Correlation C: Climate Champion Status
  if (km <= 10 && ['bikewalk', 'transit', 'electric'].includes(tData.vehicleType) && ['vegan', 'vegetarian'].includes(lData.dietType) && ['most', 'all'].includes(lData.recyclingHabit)) {
    const dietSaved = 3.3 - DIET_EMISSION_FACTORS[lData.dietType]
    const wasteSaved = 0.56 - WASTE_EMISSION_FACTORS[lData.recyclingHabit]
    msgs.push({
      type: 'positive',
      message: `🌱 Eco-Champion Status: Excellent choices! Your green commute, plant-based diet, and waste reduction habits save approximately ${round(dietSaved + wasteSaved + 1.25, 2)}t CO2e/yr compared to a standard high-carbon lifestyle.`
    })
  }

  // Correlation D: High Per-Capita Home Footprint
  if (kwh > 0 && (kwh / people) > 150) {
    const perCapitaKwh = round(kwh / people, 1)
    if (['gas', 'electric'].includes(hData.heatingSource)) {
      msgs.push({
        type: 'tip',
        message: `🏠 High Per-Capita Energy: Your home consumes ${perCapitaKwh} kWh/person monthly. Since you heat/cool with ${hData.heatingSource}, switching to a green energy tariff or using a smart AC could trim your home footprint by ~${round(h * 0.15, 2)}t CO2e/yr.`
      })
    }
  }

  // 3. Category-specific specific fallback tips (if not covered by correlation tips)
  const biggestEmit = Math.max(t, h, l)
  if (biggestEmit === t && t > 0.5 && msgs.filter(m => m.type === 'tip' && m.message.includes('Transport')).length === 0) {
    if (['petrol','diesel'].includes(tData.vehicleType)) {
      msgs.push({ type: 'tip', message: `🚗 Transport is your largest emitter (${t}t). Switching to an EV alone could cut your total footprint by ~${round(t * 0.65, 2)}t.` })
    } else if (flights > 2) {
      msgs.push({ type: 'tip', message: `✈️ Your ${flights} flights/year are a key driver. Offsetting via Gold Standard credits is the fastest fix.` })
    }
  }

  if (biggestEmit === h && h > 0.3 && msgs.filter(m => m.message.includes('Home')).length === 0) {
    const suggestion = hData.heatingSource === 'gas' ? 'exploring a solar or green electricity tariff' : 'reducing standby power and switching to LED lighting'
    msgs.push({ type: 'tip', message: `🏠 Home energy is your top emitter (${h}t). Consider ${suggestion}.` })
  }

  if (biggestEmit === l && ['omnivore','meatheavy'].includes(lData.dietType) && msgs.filter(m => m.message.includes('diet')).length === 0) {
    msgs.push({ type: 'tip', message: `🥩 Your diet is a large factor. Even 2 meat-free days per week could save ~0.5t CO2e/year.` })
  }

  // 4. Paris agreement & India benchmarks
  msgs.push({ type: 'info', message: `🇮🇳 India's average is 1.9t CO2e/yr. The Paris target is 2.0t — you are currently ${total <= 2 ? 'already at or below' : round(total - 2.0, 2) + 't above'} that target.` })

  if (lData.recyclingHabit === 'all' && msgs.filter(m => m.message.includes('recycling')).length === 0) {
    msgs.push({ type: 'positive', message: `♻️ Excellent recycling habits! Composting and full recycling save an estimated 0.7t CO2e/yr vs. landfilling.` })
  }

  return msgs
}
