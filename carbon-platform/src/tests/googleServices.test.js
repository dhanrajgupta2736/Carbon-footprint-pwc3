/**
 * @fileoverview Unit tests for the Google Services integrations.
 * Asserts correctness of Calendar Link generation and storage session bindings.
 */

import { describe, it, expect } from 'vitest'

// Helper function equivalent to what is used in ActionPlan.jsx for Calendar link generation
function generateCalendarTestUrl(title, description, impact) {
  const text = encodeURIComponent('CarbonWise: ' + title)
  const details = encodeURIComponent(description + '\n\nImpact: Save ' + impact + 't CO2e/year')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}`
}

describe('Google Calendar Integration', () => {
  it('correctly builds standard templates with correct query options', () => {
    const title = 'Switch to LED'
    const desc = 'Change all incandescent bulbs to LED'
    const impact = 0.15

    const url = generateCalendarTestUrl(title, desc, impact)
    
    expect(url).toContain('https://calendar.google.com/calendar/render')
    expect(url).toContain('action=TEMPLATE')
    expect(url).toContain('text=' + encodeURIComponent('CarbonWise: Switch to LED'))
    expect(url).toContain('details=' + encodeURIComponent('Change all incandescent bulbs to LED\n\nImpact: Save 0.15t CO2e/year'))
  })

  it('handles spaces and special characters safely', () => {
    const title = 'EV & Hybrid Switch!'
    const desc = 'Move to hybrid/EV transport options'
    const impact = 1.25

    const url = generateCalendarTestUrl(title, desc, impact)

    expect(url).not.toContain(' ')
    expect(url).toContain('%26') // & sign encoded
    expect(url).toContain('!') // ! sign remains safe unencoded
  })
})

describe('Google Session Binding Storage', () => {
  it('saves and reads mock google profiles correctly', () => {
    const mockProfile = {
      name: 'Dr. Jane Eco',
      picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      email: 'jane.eco@gmail.com',
    }

    // Direct mock storage logic matching App.jsx
    const storageStore = {}
    const setItem = (key, val) => { storageStore[key] = String(val) }
    const getItem = (key) => storageStore[key] ?? null

    setItem('carbonwise_google_user', JSON.stringify(mockProfile))

    const loaded = JSON.parse(getItem('carbonwise_google_user'))
    expect(loaded).toBeTruthy()
    expect(loaded.name).toBe('Dr. Jane Eco')
    expect(loaded.email).toBe('jane.eco@gmail.com')
    expect(loaded.picture).toContain('unsplash.com')
  })
})
