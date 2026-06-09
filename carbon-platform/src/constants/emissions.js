/**
 * @fileoverview Emission factors and configuration constants.
 * Sources:
 *  - IPCC AR6 (2022) — transport lifecycle emissions
 *  - UK DEFRA GHG Conversion Factors 2023 — electricity grid
 *  - Our World in Data — per-capita averages
 *  - FAO — dietary footprints
 */

/** @readonly Vehicle emission factors in kg CO2e per km (lifecycle) */
export const VEHICLE_EMISSION_FACTORS = Object.freeze({
  petrol:   0.171,
  diesel:   0.159,
  hybrid:   0.105,
  electric: 0.047,
  transit:  0.027,
  bikewalk: 0.000,
})

/** @readonly Heating source emission factors */
export const HEATING_EMISSION_FACTORS = Object.freeze({
  gas:      2.040,  // kg CO2e per m³ natural gas
  electric: 0.233,  // kg CO2e per kWh (India grid avg)
  solar:    0.041,  // kg CO2e per kWh (lifecycle)
})

/** @readonly Diet type annual footprints in tonnes CO2e/year */
export const DIET_EMISSION_FACTORS = Object.freeze({
  vegan:       1.5,
  vegetarian:  1.7,
  flexitarian: 2.5,
  omnivore:    3.3,
  meatheavy:   4.5,
})

/** @readonly Waste/recycling offset factors in tonnes CO2e/year saved */
export const WASTE_EMISSION_FACTORS = Object.freeze({
  none: 0.84,
  some: 0.56,
  most: 0.28,
  all:  0.14,
})

/** @readonly Aviation emission factor kg CO2e per passenger-km */
export const AVIATION_FACTOR = 0.255

/** @readonly Global benchmark values in tonnes CO2e per person per year */
export const BENCHMARKS = Object.freeze({
  global:     4.7,
  india:      1.9,
  parisTarget: 2.0,
  uk:         5.5,
  usa:        14.5,
})

/** @readonly Vehicle UI metadata */
export const VEHICLE_OPTIONS = Object.freeze([
  { value: 'petrol',   label: 'Petrol / Gas',    emoji: '⛽', badgeColor: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'diesel',   label: 'Diesel',           emoji: '🛢️', badgeColor: 'bg-stone-100 text-stone-700 border-stone-200'  },
  { value: 'hybrid',   label: 'Hybrid',           emoji: '🔋', badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'electric', label: 'Electric (EV)',    emoji: '⚡', badgeColor: 'bg-eco-100 text-eco-700 border-eco-200'         },
  { value: 'transit',  label: 'Public Transit',   emoji: '🚌', badgeColor: 'bg-blue-100 text-blue-700 border-blue-200'     },
  { value: 'bikewalk', label: 'Bike / Walk',      emoji: '🚲', badgeColor: 'bg-teal-100 text-teal-700 border-teal-200'     },
])

/** @readonly Heating source UI metadata */
export const HEATING_OPTIONS = Object.freeze([
  { value: 'gas',      label: 'Natural Gas',   emoji: '🔥', desc: 'Pipeline gas heating'   },
  { value: 'electric', label: 'Electricity',   emoji: '⚡', desc: 'Electric heating / AC'  },
  { value: 'solar',    label: 'Solar / Renew.',emoji: '☀️', desc: 'Solar panels / green tariff' },
])

/** @readonly Diet option UI metadata */
export const DIET_OPTIONS = Object.freeze([
  { value: 'vegan',       label: 'Vegan',        emoji: '🌱', desc: 'No animal products',     tons: 1.5 },
  { value: 'vegetarian',  label: 'Vegetarian',   emoji: '🥦', desc: 'No meat, dairy allowed', tons: 1.7 },
  { value: 'flexitarian', label: 'Flexitarian',  emoji: '🥗', desc: 'Mostly plant-based',     tons: 2.5 },
  { value: 'omnivore',    label: 'Omnivore',     emoji: '🍽️', desc: 'Balanced mixed diet',    tons: 3.3 },
  { value: 'meatheavy',   label: 'Meat-Heavy',   emoji: '🥩', desc: 'High meat consumption',  tons: 4.5 },
])

/** @readonly Recycling habit UI metadata */
export const RECYCLE_OPTIONS = Object.freeze([
  { value: 'all',  label: 'Everything',  emoji: '🏆', desc: 'Compost + full recycling', saving: 0.70 },
  { value: 'most', label: 'Most things', emoji: '♻️', desc: 'Paper, glass, plastic',    saving: 0.56 },
  { value: 'some', label: 'Sometimes',   emoji: '📦', desc: 'Occasional recycling',     saving: 0.28 },
  { value: 'none', label: 'Rarely',      emoji: '🗑️', desc: 'Mostly landfill',          saving: 0.00 },
])

/** @readonly Effort level UI metadata for action plan */
export const EFFORT_CONFIG = Object.freeze({
  low:    { label: 'Easy Win',    ringColor: 'ring-eco-400',    badgeClass: 'bg-eco-100 text-eco-700'      },
  medium: { label: 'Moderate',   ringColor: 'ring-yellow-400', badgeClass: 'bg-yellow-100 text-yellow-700' },
  high:   { label: 'Big Change', ringColor: 'ring-orange-400', badgeClass: 'bg-orange-100 text-orange-700' },
})

/** @readonly Category UI metadata for action plan */
export const CATEGORY_CONFIG = Object.freeze({
  transport: { label: 'Transport', badgeClass: 'bg-eco-100 text-eco-700'    },
  home:      { label: 'Home',      badgeClass: 'bg-teal-100 text-teal-700'  },
  lifestyle: { label: 'Lifestyle', badgeClass: 'bg-amber-100 text-amber-700' },
})

/** @readonly Google Analytics Measurement ID (replace with real ID in production) */
export const GA_MEASUREMENT_ID = 'G-CARBONWISE01'

/** @readonly Google Maps API key placeholder */
export const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

/** @readonly Google Fonts URL for DM Sans */
export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap'
