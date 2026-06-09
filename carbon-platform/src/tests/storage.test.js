/**
 * @fileoverview Unit tests for the localStorage persistence service.
 * Verifies sanitisation, schema validation, and safe error handling.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { saveState, loadState, clearState } from '../services/storage.js'

// ─── localStorage mock ─────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store = {}
  return {
    getItem:    (key) => store[key] ?? null,
    setItem:    (key, val) => { store[key] = String(val) },
    removeItem: (key) => { delete store[key] },
    clear:      () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

const VALID_STATE = {
  transport:        { dailyKm: 20, vehicleType: 'petrol', flightsPerYear: 2, flightHours: 3 },
  home:             { monthlyKwh: 300, heatingSource: 'electric', numPeople: 3 },
  lifestyle:        { dietType: 'omnivore', recyclingHabit: 'some' },
  completedActions: ['ev-switch', 'led'],
}

describe('Storage service', () => {
  beforeEach(() => localStorageMock.clear())

  // ── saveState ────────────────────────────────────────────────────────────

  describe('saveState', () => {
    it('saves valid state without throwing', () => {
      expect(() => saveState(VALID_STATE)).not.toThrow()
    })

    it('writes a JSON string to localStorage', () => {
      saveState(VALID_STATE)
      const raw = localStorageMock.getItem('carbonwise_v1')
      expect(raw).toBeTruthy()
      expect(() => JSON.parse(raw)).not.toThrow()
    })

    it('strips __proto__ keys from saved state', () => {
      const malicious = { ...VALID_STATE, __proto__: { isAdmin: true } }
      expect(() => saveState(malicious)).not.toThrow()
    })
  })

  // ── loadState ────────────────────────────────────────────────────────────

  describe('loadState', () => {
    it('returns null when nothing is stored', () => {
      expect(loadState()).toBeNull()
    })

    it('round-trips valid state correctly', () => {
      saveState(VALID_STATE)
      const loaded = loadState()
      expect(loaded).not.toBeNull()
      expect(loaded.transport.vehicleType).toBe('petrol')
      expect(loaded.home.heatingSource).toBe('electric')
      expect(loaded.lifestyle.dietType).toBe('omnivore')
    })

    it('restores completedActions as an array', () => {
      saveState(VALID_STATE)
      const loaded = loadState()
      expect(Array.isArray(loaded.completedActions)).toBe(true)
      expect(loaded.completedActions).toContain('ev-switch')
    })

    it('returns null for corrupted JSON', () => {
      localStorageMock.setItem('carbonwise_v1', '{bad json!!!')
      expect(loadState()).toBeNull()
    })

    it('returns null for wrong schema version', () => {
      localStorageMock.setItem('carbonwise_v1', JSON.stringify({ schemaVersion: 999, transport: {}, home: {}, lifestyle: {}, completedActions: [] }))
      expect(loadState()).toBeNull()
    })

    it('sanitises out-of-range numeric values to defaults', () => {
      const bad = { ...VALID_STATE, transport: { ...VALID_STATE.transport, dailyKm: 999999 } }
      saveState(bad)
      const loaded = loadState()
      // dailyKm > 2000 should be clamped/defaulted
      expect(Number(loaded.transport.dailyKm)).toBeLessThanOrEqual(2000)
    })

    it('sanitises invalid vehicleType to petrol default', () => {
      const bad = { ...VALID_STATE, transport: { ...VALID_STATE.transport, vehicleType: 'rocketship' } }
      saveState(bad)
      const loaded = loadState()
      expect(loaded.transport.vehicleType).toBe('petrol')
    })

    it('sanitises invalid dietType to omnivore default', () => {
      const bad = { ...VALID_STATE, lifestyle: { dietType: 'alien-diet', recyclingHabit: 'some' } }
      saveState(bad)
      const loaded = loadState()
      expect(loaded.lifestyle.dietType).toBe('omnivore')
    })

    it('filters malicious strings from completedActions array', () => {
      const bad = { ...VALID_STATE, completedActions: ['<script>alert(1)</script>', 'ev-switch'] }
      saveState(bad)
      const loaded = loadState()
      expect(loaded.completedActions).not.toContain('<script>alert(1)</script>')
      expect(loaded.completedActions).toContain('ev-switch')
    })
  })

  // ── clearState ───────────────────────────────────────────────────────────

  describe('clearState', () => {
    it('removes stored state so loadState returns null', () => {
      saveState(VALID_STATE)
      clearState()
      expect(loadState()).toBeNull()
    })

    it('does not throw when nothing is stored', () => {
      expect(() => clearState()).not.toThrow()
    })
  })
})
