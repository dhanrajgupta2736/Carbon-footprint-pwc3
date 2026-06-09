/**
 * @fileoverview Safe localStorage wrapper with schema validation.
 * Sanitises all values before writing and validates on read
 * to prevent prototype pollution and XSS via stored data.
 */

const STORAGE_KEY = 'carbonwise_v1'
const SCHEMA_VERSION = 1

/**
 * Allowed value types and ranges for each field.
 * This acts as both validation and sanitisation schema.
 */
const FIELD_SCHEMA = {
  transport: {
    dailyKm:        { type: 'number', min: 0, max: 2000,  default: '' },
    vehicleType:    { type: 'enum',   values: ['petrol','diesel','hybrid','electric','transit','bikewalk'], default: 'petrol' },
    flightsPerYear: { type: 'number', min: 0, max: 365,   default: '' },
    flightHours:    { type: 'number', min: 0, max: 24,    default: '' },
  },
  home: {
    monthlyKwh:    { type: 'number', min: 0, max: 50000, default: '' },
    heatingSource: { type: 'enum',   values: ['gas','electric','solar'], default: 'electric' },
    numPeople:     { type: 'number', min: 1, max: 20,    default: '' },
  },
  lifestyle: {
    dietType:       { type: 'enum', values: ['vegan','vegetarian','flexitarian','omnivore','meatheavy'], default: 'omnivore' },
    recyclingHabit: { type: 'enum', values: ['none','some','most','all'], default: 'some' },
  },
  completedActions: { type: 'array', itemType: 'string', default: [] },
  schemaVersion:    { type: 'number', min: 1, max: 999, default: SCHEMA_VERSION },
}

/**
 * Sanitise a single value against its schema rule.
 * Returns the sanitised value or the default if invalid.
 * @param {*} value
 * @param {object} rule
 * @returns {*}
 */
function sanitiseValue(value, rule) {
  if (rule.type === 'number') {
    const n = Number(value)
    if (!Number.isFinite(n)) return rule.default
    if (n < rule.min || n > rule.max) return rule.default
    return value // preserve string '' for empty fields
  }
  if (rule.type === 'enum') {
    return rule.values.includes(value) ? value : rule.default
  }
  if (rule.type === 'array') {
    if (!Array.isArray(value)) return rule.default
    // Sanitise each item: allow only printable ASCII strings ≤ 64 chars
    return value
      .filter((item) => typeof item === 'string' && /^[\w-]{1,64}$/.test(item))
      .slice(0, 100) // cap array length
  }
  return rule.default
}

/**
 * Sanitise a whole category object against its schema.
 * @param {object} data
 * @param {object} schema
 * @returns {object}
 */
function sanitiseCategory(data, schema) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return Object.fromEntries(
      Object.entries(schema).map(([k, rule]) => [k, rule.default])
    )
  }
  return Object.fromEntries(
    Object.entries(schema).map(([k, rule]) => [k, sanitiseValue(data[k], rule)])
  )
}

/**
 * Save calculator state to localStorage.
 * @param {{ transport: object, home: object, lifestyle: object, completedActions: string[] }} state
 */
export function saveState(state) {
  try {
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      transport:        sanitiseCategory(state.transport,  FIELD_SCHEMA.transport),
      home:             sanitiseCategory(state.home,       FIELD_SCHEMA.home),
      lifestyle:        sanitiseCategory(state.lifestyle,  FIELD_SCHEMA.lifestyle),
      completedActions: sanitiseValue(state.completedActions, FIELD_SCHEMA.completedActions),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) — fail silently
  }
}

/**
 * Load and validate calculator state from localStorage.
 * Returns null if nothing stored or data is invalid.
 * @returns {{ transport: object, home: object, lifestyle: object, completedActions: string[] }|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    // Prevent prototype pollution: parse with reviver that blocks __proto__
    const parsed = JSON.parse(raw, (key, val) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined
      }
      return val
    })

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      parsed.schemaVersion !== SCHEMA_VERSION
    ) {
      clearState()
      return null
    }

    return {
      transport:        sanitiseCategory(parsed.transport,  FIELD_SCHEMA.transport),
      home:             sanitiseCategory(parsed.home,       FIELD_SCHEMA.home),
      lifestyle:        sanitiseCategory(parsed.lifestyle,  FIELD_SCHEMA.lifestyle),
      completedActions: sanitiseValue(parsed.completedActions, FIELD_SCHEMA.completedActions),
    }
  } catch {
    return null
  }
}

/**
 * Remove persisted state from localStorage.
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore
  }
}
